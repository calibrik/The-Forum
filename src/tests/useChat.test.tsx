import { describe, expect, test, vi } from 'vitest';
import { db } from '../misc/db';
import { useChat } from '../hooks/useChat';
import { renderHook } from '@testing-library/react';
import { AllTheProvidersForMock } from '../App';

describe("useChat", () => {
    describe("addMessageFromUser", () => {
        test('addMessageFromUser', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            const content = 'Hello, world!';
            await result.current.addMessageFromUser(content);
            const messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].content).toBe(content);
        });
    });

    describe("addMessageFromNPC", () => {
        test('addMessageFromNPC (no time to type)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            const content = 'Hello, world!';
            await result.current.addMessageFromNPC("user1", content);
            const messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].content).toBe(content);
        });

        test('addMessageFromNPC (single with time)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            const content = 'Hello, world!';
            result.current.addMessageFromNPC("user1", content, 1);
            let messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(1000);
            messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(1);
            expect(messagesBuffer[0].content).toBe(content);
        });

        test('addMessageFromNPC (multiple)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
            const content = 'Hello, world!';
            result.current.addMessageFromNPC("user1", content, 2);
            result.current.addMessageFromNPC("user2", content, 1);
            result.current.addMessageFromNPC("user3", content, 0.5);
            let messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(3000);
            messagesBuffer = (await db.storyMessagesBuffer.toArray()).sort((a, b) => a.timeSent.getTime() - b.timeSent.getTime());
            expect(messagesBuffer.length).toBe(3);
            expect(messagesBuffer[0].from).toBe("user3");
            expect(messagesBuffer[1].from).toBe("user2");
            expect(messagesBuffer[2].from).toBe("user1");
        });

        test('addMessageFromNPC (multiple, with replies)', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: AllTheProvidersForMock
            });
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
            const content = 'Hello, world!';
            result.current.addMessageFromNPC("user1", content, 2);
            result.current.addMessageFromNPC("user2", content, 1);
            result.current.addMessageFromNPC("user3", content, 0.5, -2);
            result.current.addMessageFromNPC("user4", content, 3.5, -3);
            let messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(0);
            await vi.advanceTimersByTimeAsync(3500);
            messagesBuffer = await db.storyMessagesBuffer.toArray();
            expect(messagesBuffer.length).toBe(4);
            expect(messagesBuffer.find(m => m.from == "user4")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
            expect(messagesBuffer.find(m => m.from == "user3")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
        });
    });
});
