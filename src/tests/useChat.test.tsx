import { describe, expect, test, vi } from 'vitest';
import { db } from '../misc/db';
import { useChat } from '../hooks/useChat';
import { renderHook } from '@testing-library/react';
import { AllTheProvidersForMock } from '../App';

describe("useChat", () => {
    const chatId = "cyberdivers";

    function createHandle() {
        return {
            setStringToType: vi.fn(),
            addTypingUser: vi.fn(),
            removeTypingUser: vi.fn(),
            addMessage: vi.fn(),
            getMessage: vi.fn(),
            getId: () => chatId
        };
    }

    describe("addMessageFromUser", () => {
        test('addMessageFromUser', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.put({ id: 1, from: "TestHero", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false });
            const handle = createHandle();
            await result.current.setChatHandle(handle);
            await result.current.promptMessage(1);
            expect(handle.setStringToType).toHaveBeenCalledWith('Hello, world!');
            await result.current.addMessageFromUser();
            const messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].id).toBe(1);
            expect(messagesBuffer[0].content).toBe('Hello, world!');
            expect(messagesBuffer[0].isVisible).toBe(true);
        });

        test('addMessageFromUser (link)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.put({ id: 1, from: "TestHero", content: '/post/fake', chatId, timeSent: new Date(0), isVisible: false, isLink: true });
            const handle = createHandle();
            await result.current.setChatHandle(handle);
            await result.current.promptMessage(1);
            expect(handle.setStringToType).toHaveBeenCalledWith(window.location.origin + '/post/fake');
            await result.current.addMessageFromUser();
            const messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer[0].content).toBe('/post/fake');
            expect(messagesBuffer[0].isLink).toBe(true);
        });
    });

    describe("addMessageFromNPC", () => {
        test('addMessageFromNPC (no time to type)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.put({ id: 2, from: "user1", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false });
            await result.current.addMessageFromNPC(2);
            const messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].content).toBe('Hello, world!');
            expect(messagesBuffer[0].isVisible).toBe(true);
        });

        test('addMessageFromNPC (single with time)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.put({ id: 2, from: "user1", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false });
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            const promise = result.current.addMessageFromNPC(2, 1);
            await vi.advanceTimersByTimeAsync(0);
            let messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(1000);
            await promise;
            messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].content).toBe('Hello, world!');
        });

        test('addMessageFromNPC (multiple)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.bulkPut([
                { id: 2, from: "user1", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false },
                { id: 3, from: "user2", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false },
                { id: 4, from: "user3", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false }
            ]);
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
            const promises = [result.current.addMessageFromNPC(2, 2), result.current.addMessageFromNPC(3, 1), result.current.addMessageFromNPC(4, 0.5)];
            await vi.advanceTimersByTimeAsync(0);
            let messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(3000);
            await Promise.all(promises);
            messagesBuffer = (await db.messagesBuffer.toArray()).sort((a, b) => a.timeSent.getTime() - b.timeSent.getTime());
            expect(messagesBuffer.length).toBe(3);
            expect(messagesBuffer[0].from).toBe("user3");
            expect(messagesBuffer[1].from).toBe("user2");
            expect(messagesBuffer[2].from).toBe("user1");
        });

        test('addMessageFromNPC (multiple, with replies)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            await db.messages.bulkPut([
                { id: 2, from: "user1", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false },
                { id: 3, from: "user2", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false },
                { id: 4, from: "user3", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false, isReply: 2 },
                { id: 5, from: "user4", content: 'Hello, world!', chatId, timeSent: new Date(0), isVisible: false, isReply: 2 }
            ]);
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            const promises = [result.current.addMessageFromNPC(2, 2), result.current.addMessageFromNPC(3, 1), result.current.addMessageFromNPC(4, 0.5), result.current.addMessageFromNPC(5, 3.5)];
            await vi.advanceTimersByTimeAsync(0);
            let messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(3500);
            await Promise.all(promises);
            messagesBuffer = await db.messagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(4);
            expect(messagesBuffer.find(m => m.from == "user4")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
            expect(messagesBuffer.find(m => m.from == "user3")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
        });
    });
});
