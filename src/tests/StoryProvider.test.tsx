import { describe, expect, test } from 'vitest';
import { db } from '../backend/db';
import { useStory } from '../providers/StoryProvider';
import { renderHook } from '@testing-library/react';
import { AllTheProvidersForMock } from '../App';

describe("test of testing", () => {
    test("test 1", async () => {
        expect(await db.users.where("nickname").equals("penis").first()).toMatchObject({ nickname: "penis", description: "Secret dev account for testing shit" });
    })
})

describe("chat testing", () => {
    test('addMessageFromUser', async () => {
        const { result } = renderHook(() => useStory(), {
            wrapper: AllTheProvidersForMock
        });
        console.log(result)
        const content = 'Hello, world!';
        await result.current.addMessageFromUser(content);
        const messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(1);
        expect(messagesBuffer[0].content).toBe(content);
    });
})