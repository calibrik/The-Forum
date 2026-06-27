import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { db, seedNew } from '../backend/db';
import { useChat, useHints, useStory, useStoryFuncs } from '../providers/StoryProvider';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { AllTheProvidersForMock, exposedMockRouter } from '../App';
import hintStyles from "../scss/storyProvider.module.scss";
import type { ITypingTextBoxHandle } from '../components/TypingTextBox';
import gsap from 'gsap';
import { useUserState } from '../providers/UserAuth';
import { useLocation } from 'react-router';

describe("test of testing", () => {
    beforeAll(async () => {
        await seedNew();
    })

    test("test 1", async () => {
        expect(await db.users.where("nickname").equals("penis").first()).toMatchObject({ nickname: "penis", description: "Secret dev account for testing shit" });
    })
})

describe("chat testing", () => {

    test('addMessageFromUser', async () => {
        const { result } = renderHook(() => useChat(), {
            wrapper: AllTheProvidersForMock
        });
        const content = 'Hello, world!';
        await result.current.addMessageFromUser(content);
        const messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(1);
        expect(messagesBuffer[0].content).toBe(content);
    });

    test('addMessageFromNPC (no time to type)', async () => {
        const { result } = renderHook(() => useChat(), {
            wrapper: AllTheProvidersForMock
        });
        const content = 'Hello, world!';
        result.current.addMessageFromNPC("user1", content);
        const messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(1);
        expect(messagesBuffer[0].content).toBe(content);
    });

    test('addMessageFromNPC', async () => {
        const { result } = renderHook(() => useChat(), {
            wrapper: AllTheProvidersForMock
        });
        vi.useFakeTimers();
        const content = 'Hello, world!';
        result.current.addMessageFromNPC("user1", content, 1);
        let messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(0);
        await vi.advanceTimersByTimeAsync(1000);
        messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(1);
        expect(messagesBuffer[0].content).toBe(content);
        vi.useRealTimers();
    });

    test('addMessageFromNPC (multiple)', async () => {
        const { result } = renderHook(() => useChat(), {
            wrapper: AllTheProvidersForMock
        });
        vi.useFakeTimers();
        const content = 'Hello, world!';
        result.current.addMessageFromNPC("user1", content, 2);
        result.current.addMessageFromNPC("user2", content, 1);
        result.current.addMessageFromNPC("user3", content, 0.5);
        let messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(0);
        await vi.advanceTimersByTimeAsync(2000);
        messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(3);
        expect(messagesBuffer[0].from).toBe("user3");
        expect(messagesBuffer[1].from).toBe("user2");
        expect(messagesBuffer[2].from).toBe("user1");
        vi.useRealTimers();
    });

    test('addMessageFromNPC (multiple, with replies)', async () => {
        const { result } = renderHook(() => useChat(), {
            wrapper: AllTheProvidersForMock
        });
        vi.useFakeTimers();
        const content = 'Hello, world!';
        result.current.addMessageFromNPC("user1", content, 2);
        result.current.addMessageFromNPC("user2", content, 1);
        result.current.addMessageFromNPC("user3", content, 0.5, -2);
        result.current.addMessageFromNPC("user4", content, 3.5, -3);
        let messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(0);
        await vi.advanceTimersByTimeAsync(3500);
        messagesBuffer = result.current.getMessageBuffer();
        expect(messagesBuffer.length).toBe(4);
        expect(messagesBuffer.find(m => m.from == "user4")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
        expect(messagesBuffer.find(m => m.from == "user3")?.isReply).toEqual(messagesBuffer.find(m => m.from == "user1")?.id);
        vi.useRealTimers();
    });
});

describe("hint testing", () => {

    test("hintNavPath (/user/main_hero level 2 from /chat)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
        result.current.hintNavPath({ level: 2, where: "/user/main_hero" });
        expect(result.current._getCurrHint?.().current).toEqual(["user-icon-text"]);
    });

    test("hintNavPath (/user/main_hero/comments level 3 from /user/main_hero)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
        result.current.hintNavPath({ level: 3, where: "/user/main_hero/comments" });
        expect(result.current._getCurrHint?.().current).toEqual(["comments"]);
    });

    test("hintNavPath (/subforum/test/comments level 3 from /subforum/test)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test"))
        result.current.hintNavPath({ level: 3, where: "/subforum/test/comments" });
        expect(result.current._getCurrHint?.().current).toEqual(["comments"]);
    });

    test("hintNavPath (/subforum/test level 2 from /subforum/test2)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test2"))
        result.current.hintNavPath({ level: 2, where: "/subforum/test" });
        expect(result.current._getCurrHint?.().current).toEqual(["header-search", ""]);
    });

    test("hintNavPath (/chat/test level 2 from /chat/test2)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/chat/test2"))
        result.current.hintNavPath({ level: 2, where: "/chat/test" });
        expect(result.current._getCurrHint?.().current).toEqual(["back-text"]);
    });

    test("hintNavPath (/chat/test level 2 from /chat)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
        result.current.hintNavPath({ level: 2, where: "/chat/test" });
        expect(result.current._getCurrHint?.().current).toEqual(["test"]);
    });

    test("hintNavPath (/chat level 1 from /user/main_hero)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
        result.current.hintNavPath({ level: 1, where: "/chat" });
        expect(result.current._getCurrHint?.().current).toEqual(["menu-icon-text", "chat-menu"]);
    });

    test("hintNavPath (/user/main_hero level 2 from /user/main_hero/comments)", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero/comments"))
        result.current.hintNavPath({ level: 2, where: "/user/main_hero" });
        expect(result.current._getCurrHint?.().current).toEqual([]);
    });

    test("no nav path overrides from higher levels", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        const currHint = result.current._getCurrHint?.();
        const setSpy = vi.fn();
        let internalValue = currHint?.current;
        Object.defineProperty(currHint, "current", {
            get() {
                return internalValue;
            },
            set(newValue) {
                internalValue = newValue;
                setSpy(newValue);
            },
            configurable: true,
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test/comments"))
        result.current.hintNavPath({ level: 2, where: "/subforum/test2" });
        result.current.hintNavPath({ level: 2, where: "/subforum/test2" });
        expect(setSpy).toHaveBeenCalledTimes(1);
    })

    test("hinting", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        const { container } = render(
            <>
                <div id="test"></div>
                <div id="test-text"></div>
            </>
        );
        result.current._hint?.("test");
        let div = container.getElementsByClassName(hintStyles.hint);
        expect(div).not.toBe(undefined);
        result.current._hint?.("test-text");
        div = container.getElementsByClassName(hintStyles.hintText);
        expect(div).not.toBe(undefined);
        const consoleSpy = vi.spyOn(console, 'error');
        result.current._hint?.("wrong_id")
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    })

    test("basic go back and forward on navpath", async () => {
        const { result } = renderHook(() => useHints(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
        result.current.hintNavPath({ level: 1, where: "/chat" });
        expect(result.current._getCurrIndex?.().current).toEqual(0);
        result.current.goForwardHint("menu-icon-text");
        expect(result.current._getCurrIndex?.().current).toEqual(1);
        result.current.goBackHint("chat-menu");
        expect(result.current._getCurrIndex?.().current).toEqual(0);
    })
});

describe("story functionality", () => {
    test("no reset anims on story navigation", async () => {
        const { result } = renderHook(() => useStoryFuncs(), {
            wrapper: AllTheProvidersForMock
        });
        result.current._getIsStoryNavRef!().current = true;
        const locationRef = result.current._getLocationRef?.();
        locationRef!.current = { where: "/user/main_hero", level: 2 };
        result.current.setTypingBoxes([{ current: null } as unknown as React.RefObject<ITypingTextBoxHandle | null>], 2);
        await result.current._resetAnims?.();
        expect(result.current._getTypingBoxes?.().current.length).toEqual(1);
    })

    test("no reset anims if on target location on sufficient level", async () => {
        const { result } = renderHook(() => useStoryFuncs(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero/comments"));
        const locationRef = result.current._getLocationRef?.();
        locationRef!.current = { where: "/user/main_hero", level: 2 };
        result.current.setTypingBoxes([{ current: null } as unknown as React.RefObject<ITypingTextBoxHandle | null>], 2);
        result.current._resetAnims?.();
        expect(result.current._getTypingBoxes?.().current.length).toEqual(1);
    })

    test("reset anims (no active anim, no left from target)", async () => {
        const { result } = renderHook(() => useStoryFuncs(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test"));
        const locationRef = result.current._getLocationRef?.();
        locationRef!.current = { where: "/user/main_hero", level: 2 };
        const chatResetSpy = vi.spyOn(result.current._getChatHook!(), "onNavigateAway");
        const hintResetSpy = vi.spyOn(result.current._getHintHook!(), "resetHint");
        result.current.setTypingBoxes([{ current: null } as unknown as React.RefObject<ITypingTextBoxHandle | null>], 2);
        await result.current._resetAnims?.();
        expect(result.current._getTypingBoxes?.().current.length).toEqual(0);
        expect(chatResetSpy).toHaveBeenCalledTimes(1);
        expect(hintResetSpy).toHaveBeenCalledTimes(1);
    })

    test("reset anims (no active anim, left from target)", async () => {
        const { result } = renderHook(() => useStoryFuncs(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test"));
        const locationRef = result.current._getLocationRef?.();
        locationRef!.current = { where: "/user/main_hero", level: 2 };
        const chatResetSpy = vi.spyOn(result.current._getChatHook!(), "onNavigateAway");
        const hintResetSpy = vi.spyOn(result.current._getHintHook!(), "resetHint");
        result.current._getSavedStoryId!().current = 10;
        result.current._getIsStoryRecovered!().current = true;
        result.current.setTypingBoxes([{ current: null } as unknown as React.RefObject<ITypingTextBoxHandle | null>], 2);
        await result.current._resetAnims?.();
        expect(result.current._getTypingBoxes?.().current.length).toEqual(0);
        expect(chatResetSpy).toHaveBeenCalledTimes(1);
        expect(hintResetSpy).toHaveBeenCalledTimes(1);
        expect(result.current._getCurrStoryId!().current).toEqual(11);
    })

    test("reset anims (active anim, no left from target)", async () => {
        const { result } = renderHook(() => useStoryFuncs(), {
            wrapper: AllTheProvidersForMock
        });
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test"));
        const locationRef = result.current._getLocationRef?.();
        locationRef!.current = { where: "/user/main_hero", level: 2 };
        const chatResetSpy = vi.spyOn(result.current._getChatHook!(), "onNavigateAway");
        const hintResetSpy = vi.spyOn(result.current._getHintHook!(), "resetHint");
        const masterRef = result.current._getMasterRef!();
        masterRef.current = gsap.timeline({ paused: true });
        result.current.setTypingBoxes([{ current: null } as unknown as React.RefObject<ITypingTextBoxHandle | null>], 2);
        await result.current._resetAnims?.();
        expect(result.current._getTypingBoxes?.().current.length).toEqual(0);
        expect(chatResetSpy).toHaveBeenCalledTimes(1);
        expect(hintResetSpy).toHaveBeenCalledTimes(1);
        expect(masterRef.current).toBe(undefined);
    })

    test("navigate action (navigate true)", async () => {
        const { result } = renderHook(() => {
            const storyFuncs=useStory()._getStoryHook!();
            const userState=useUserState();
            return {storyFuncs,userState}
        }, {
            wrapper: AllTheProvidersForMock
        });
        await db.users.add({ nickname: "penis" });
        result.current.userState.isRealLoggedIn.current=true;
        const chatPreserveSpy = vi.spyOn(result.current.storyFuncs._getChatHook!(), "enablePreserveMessagesBuffer");
        const storyHintResetSpy = vi.spyOn(result.current.storyFuncs._getHintHook!(), "resetStoryHint");
        await result.current.storyFuncs._processAction!({ navigateAction: { dest: { where: "/user/penis", level: 2 }, navigate: true } }, 10);
        const locationRef = result.current.storyFuncs._getLocationRef!();
        await waitFor(async () => {
            expect(exposedMockRouter?.state.location.pathname).toEqual("/user/penis");
        });
        expect(locationRef.current).toEqual({ where: "/user/penis", level: 2 });
        expect(result.current.storyFuncs._getPageStoryIdRef!().current).toEqual(11);
        expect(chatPreserveSpy).toHaveBeenCalled();
        expect(storyHintResetSpy).toHaveBeenCalled();
    })
})