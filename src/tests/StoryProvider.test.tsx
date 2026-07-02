import { beforeAll, describe, expect, test, vi } from 'vitest';
import { db, seedNew, type IMessage } from '../backend/db';
import { useChat, useHints, useStory, useStoryFuncs } from '../providers/StoryProvider';
import { render, renderHook, waitFor } from '@testing-library/react';
import { AllTheProvidersForMock, exposedMockRouter } from '../App';
import hintStyles from "../scss/storyProvider.module.scss";
import type { ITypingTextBoxHandle } from '../components/TypingTextBox';
import gsap from 'gsap';
import { useUserState } from '../providers/UserAuth';
import { bridge } from '../utils';


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
        const hintSpy = vi.spyOn(bridge, "exec");
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test/comments"))
        result.current.hintNavPath({ level: 3, where: "/subforum/test" });
        result.current.hintNavPath({ level: 2, where: "/subforum/test2" });
        expect(hintSpy).toHaveBeenCalledTimes(1);
        const args = hintSpy.mock.calls[0]
        expect(args[0]).toBe(result.current._hint);
        expect(args[1]).toBe("posts");
    });

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
            const storyFuncs = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyFuncs, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        await db.users.add({ nickname: "penis" });
        result.current.userState.isRealLoggedIn.current = true;
        const chatPreserveSpy = vi.spyOn(result.current.storyFuncs!._getChatHook!(), "enablePreserveMessagesBuffer");
        const storyHintResetSpy = vi.spyOn(result.current.storyFuncs!._getHintHook!(), "resetStoryHint");
        await result.current.storyFuncs!._processAction!({ navigateAction: { dest: { where: "/user/penis", level: 2 }, navigate: true } }, 10);
        const locationRef = result.current.storyFuncs!._getLocationRef!();
        await waitFor(async () => {
            expect(exposedMockRouter?.state.location.pathname).toEqual("/user/penis");
        });
        expect(locationRef.current).toEqual({ where: "/user/penis", level: 2 });
        expect(result.current.storyFuncs!._getPageStoryIdRef!().current).toEqual(11);
        expect(chatPreserveSpy).toHaveBeenCalled();
        expect(storyHintResetSpy).toHaveBeenCalled();
    })

    test("navigate action (navigate false)", async () => {
        const { result } = renderHook(() => {
            const storyFuncs = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyFuncs, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        await db.users.add({ nickname: "penis" });
        result.current.userState.isRealLoggedIn.current = true;
        const chatPreserveSpy = vi.spyOn(result.current.storyFuncs!._getChatHook!(), "enablePreserveMessagesBuffer");
        const storyHintResetSpy = vi.spyOn(result.current.storyFuncs!._getHintHook!(), "resetStoryHint");
        const storyHintNavSpy = vi.spyOn(result.current.storyFuncs!._getHintHook!(), "hintNavPath");
        await result.current.storyFuncs!._processAction!({ navigateAction: { dest: { where: "/user/penis", level: 2 }, navigate: false } }, 10);
        const locationRef = result.current.storyFuncs!._getLocationRef!();
        await waitFor(async () => {
            expect(exposedMockRouter?.state.location.pathname).not.toEqual("/user/penis");
        });
        expect(locationRef.current).toEqual({ where: "/user/penis", level: 2 });
        expect(result.current.storyFuncs!._getPageStoryIdRef!().current).toEqual(11);
        expect(chatPreserveSpy).toHaveBeenCalled();
        expect(storyHintResetSpy).toHaveBeenCalled();
        expect(storyHintNavSpy).toHaveBeenCalled();
        expect(result.current.storyFuncs!._getIsStoryRecovered!().current).toEqual(false);
    })

    test("save action", async () => {
        const { result } = renderHook(() => {
            const storyFuncs = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyFuncs, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        await db.users.add({ nickname: "smth", password: "123", savedStoryId: 1 });
        const chatSinkSpy = vi.spyOn(result.current.storyFuncs!._getChatHook!(), "sinkMessages");
        await result.current.storyFuncs!._processAction!({ saveAction: { dest: { where: "/user/penis", level: 2 } } }, 10);
        expect(chatSinkSpy).toHaveBeenCalled();
        expect(result.current.storyFuncs?._getSavedStoryId!().current).toEqual(10);
        expect(result.current.storyFuncs!._getPageStoryIdRef!().current).toEqual(11);
        expect(await db.users.where("savedStoryId").aboveOrEqual(0).first()).toMatchObject({ savedStoryId: 10 });
    })

    test("hint action", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        await result.current!._processAction!({ hintAction: { ids: ["test-id"] } }, 10);
        const hintHook = result.current!._getHintHook!();
        expect(hintHook._getIsStoryHint!().current).toEqual(true);
        expect(hintHook._getCurrHint!().current).toEqual(["test-id"]);
        expect(hintHook._getisLegitStoryHint!().current).toEqual(true);
    })

    test("setTextBoxStyle action", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        const applyStyleSpy = vi.fn();
        const mockRef = { current: { applyStyle: applyStyleSpy } } as unknown as React.RefObject<ITypingTextBoxHandle | null>;
        result.current!._getTypingBoxes!().current = [mockRef];
        await result.current!._processAction!({ setTextBoxStyleAction: { id: 0, style: { color: "red" } } }, 10);
        expect(applyStyleSpy).toHaveBeenCalledWith({ color: "red" });
    })

    test("sendMessage action", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        const addMessageSpy = vi.spyOn(result.current!._getChatHook!(), "addMessageFromNPC");
        const action = { from: "npc", content: "hello", timeToType: 1 };
        await result.current!._processAction!({ sendMessageAction: action }, 10);
        expect(addMessageSpy).toHaveBeenCalledWith("npc", "hello", 1, undefined);
    })

    test("promptMessage action", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        const storyHintSpy = vi.spyOn(result.current!._getHintHook!(), "setStoryHint");
        const promptSpy = vi.spyOn(result.current!._getChatHook!(), "promptMessage");
        await result.current!._processAction!({ promptMessageAction: { content: "test prompt" } }, 10);
        expect(storyHintSpy).toHaveBeenCalledWith(["chat-input", "chat-send"], false, false);
        expect(promptSpy).toHaveBeenCalledWith("test prompt");
    })

    test("resume story from hint (normal flow)", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        result.current!._getHintHook!().setStoryHint(["test"]);
        const removeHintSpy = vi.spyOn(result.current!._getHintHook!(), "removeCurrHint");
        const showStorySpy = vi.spyOn(bridge, "exec");
        expect(result.current!.resumeStoryFromHint!("test")).toEqual(true);
        expect(removeHintSpy).toHaveBeenCalled();
        const args = showStorySpy.mock.calls[0];
        expect(args[0]).toBe(result.current?._showStory);
    });

    test("resume story from hint (wrong hint pressed)", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        result.current!._getHintHook!().setStoryHint(["test"]);
        expect(result.current!.resumeStoryFromHint!("test1")).toEqual(false);
    });

    test("resume story from hint (story is going)", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        result.current!._getHintHook!().setStoryHint(["test"]);
        result.current!._getMasterRef!().current = gsap.timeline();
        expect(result.current!.resumeStoryFromHint!("test")).toEqual(false);
    });

    test("recoverCheckpoint (basic)", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        const scl = {
            action: {
                saveAction: {
                    dest: { where: "/user/penis", level: 2 }
                }
            }
        };
        await db.users.add({ nickname: "penis" });
        await result.current!.recoverCheckpoint!(10, scl as any);

        expect(result.current!._getSavedStoryId!().current).toEqual(10);
        expect(result.current!._getCurrStoryId!().current).toEqual(11);
        expect(result.current!._getPageStoryIdRef!().current).toEqual(11);
        expect(result.current!._getLocationRef!().current).toEqual({ where: "/user/penis", level: 2 });
        await waitFor(() => {
            expect(exposedMockRouter?.state.location.pathname).toEqual("/user/penis");
        });
    });

    test("recoverCheckpoint (with hintActionPos)", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        await db.story.put({ id: 9, action: { hintAction: { ids: ["recovered-hint"] } }, offset: ">" });
        const setStoryHintSpy = vi.spyOn(result.current!._getHintHook!(), "setStoryHint");

        const scl = {
            action: {
                saveAction: {
                    dest: { where: "/chat", level: 1 },
                    hintActionPos: -1
                }
            }
        };
        await result.current!.recoverCheckpoint!(10, scl as any);
        expect(setStoryHintSpy).toHaveBeenCalledWith(["recovered-hint"], true);
        expect(result.current!._getSavedStoryId!().current).toEqual(10);
        expect(result.current!._getCurrStoryId!().current).toEqual(11);
        expect(result.current!._getPageStoryIdRef!().current).toEqual(11);
        expect(result.current!._getLocationRef!().current).toEqual({ where: "/chat", level: 1 });
        await waitFor(() => {
            expect(exposedMockRouter?.state.location.pathname).toEqual("/chat");
        });
    });

    test("recoverStoryOnPage (early returns)", async () => {
        const { result } = renderHook(() => {
            const storyHook = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyHook, userState };
        }, { wrapper: AllTheProvidersForMock });

        const hintNavSpy = vi.spyOn(result.current.storyHook!._getHintHook!(), "hintNavPath");
        const showStorySpy = vi.spyOn(bridge, "exec");

        // Case: !locationRef.current
        result.current.storyHook!._getLocationRef!().current = undefined;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!.recoverStoryOnPage!(1);
        expect(hintNavSpy).not.toHaveBeenCalled();
        expect(showStorySpy).not.toHaveBeenCalled();

        // Case: !isRealLoggedIn
        result.current.storyHook!._getLocationRef!().current = { where: "/test", level: 1 };
        result.current.userState.isRealLoggedIn.current = false;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        result.current.storyHook!.recoverStoryOnPage!(1);
        expect(hintNavSpy).not.toHaveBeenCalled();
        expect(showStorySpy).not.toHaveBeenCalled();

        // Case: isStoryRecovered
        result.current.storyHook!._getLocationRef!().current = { where: "/test", level: 1 };
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!._getIsStoryRecovered!().current = true;
        result.current.storyHook!.recoverStoryOnPage!(1);
        expect(hintNavSpy).not.toHaveBeenCalled();
        expect(showStorySpy).not.toHaveBeenCalled();
    });

    test("recoverStoryOnPage (mismatched level)", async () => {
        const { result } = renderHook(() => {
            const storyHook = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyHook, userState };
        }, { wrapper: AllTheProvidersForMock });

        const showStorySpy = vi.spyOn(bridge, "exec");
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        vi.stubGlobal("location", new URL("http://localhost:3000/user/test/comments"));
        const target = { where: "/user/penis", level: 2 };
        result.current.storyHook!._getLocationRef!().current = target;

        const hintNavSpy = vi.spyOn(result.current.storyHook!._getHintHook!(), "hintNavPath");
        result.current.storyHook!.recoverStoryOnPage!(3);
        expect(hintNavSpy).toHaveBeenCalledWith(target);
        expect(showStorySpy.mock.calls.find((call) => call[0] === result.current.storyHook?._showStory)).toBeUndefined();
    });

    test("recoverStoryOnPage (mismatched path)", async () => {
        const { result } = renderHook(() => {
            const storyHook = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyHook, userState };
        }, { wrapper: AllTheProvidersForMock });

        const showStorySpy = vi.spyOn(bridge, "exec");
        vi.stubGlobal("location", new URL("http://localhost:3000/subforum/other"));
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        const target = { where: "/subforum/test", level: 2 };
        result.current.storyHook!._getLocationRef!().current = target;

        const hintNavSpy = vi.spyOn(result.current.storyHook!._getHintHook!(), "hintNavPath");
        result.current.storyHook!.recoverStoryOnPage!(2);
        expect(hintNavSpy).toHaveBeenCalledWith(target);
        expect(showStorySpy.mock.calls.find((call) => call[0] === result.current.storyHook?._showStory)).toBeUndefined();
    });

    test("recoverStoryOnPage (success - reactivate story hint)", async () => {
        const { result } = renderHook(() => {
            const storyHook = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyHook, userState };
        }, { wrapper: AllTheProvidersForMock });

        vi.stubGlobal("location", new URL("http://localhost:3000/chat"));
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        result.current.storyHook!._getLocationRef!().current = { where: "/chat", level: 1 };
        const hintHook = result.current.storyHook!._getHintHook!();
        vi.spyOn(hintHook, "verifyStoryHint").mockReturnValue(true);
        const reactivateHintSpy = vi.spyOn(hintHook, "reactivateStoryHint");
        const resetHintSpy = vi.spyOn(hintHook, "resetHint");

        result.current.storyHook!.recoverStoryOnPage!(1);

        expect(resetHintSpy).toHaveBeenCalled();
        expect(reactivateHintSpy).toHaveBeenCalled();
        expect(result.current.storyHook!._getIsStoryRecovered!().current).toBe(true);
    });

    test("recoverStoryOnPage (success - show story)", async () => {
        const { result } = renderHook(() => {
            const storyHook = useStory()._getStoryHook!();
            const userState = useUserState();
            return { storyHook, userState };
        }, { wrapper: AllTheProvidersForMock });

        const showStorySpy = vi.spyOn(bridge, "exec");
        vi.stubGlobal("location", new URL("http://localhost:3000/user/penis"));
        result.current.userState.isRealLoggedIn.current = true;
        result.current.storyHook!._getIsStoryRecovered!().current = false;
        result.current.storyHook!._getLocationRef!().current = { where: "/user/penis", level: 2 };
        result.current.storyHook!._getPageStoryIdRef!().current = 50;

        const hintHook = result.current.storyHook!._getHintHook!();
        const resetHintSpy = vi.spyOn(hintHook, "resetHint");
        vi.spyOn(hintHook, "verifyStoryHint").mockReturnValue(false);

        result.current.storyHook!.recoverStoryOnPage!(2);

        expect(resetHintSpy).toHaveBeenCalled();
        expect(result.current.storyHook!._getIsStoryRecovered!().current).toBe(true);
        expect(showStorySpy).toHaveBeenCalled();
        const args = showStorySpy.mock.calls[0];
        expect(args[0]).toBe(result.current.storyHook?._showStory);
        expect(args[1]).toBe(50);
    });

    test("should replace old nickname with new nickname across relevant tables", async () => {
        const { result } = renderHook(() => useStory()._getStoryHook!(), {
            wrapper: AllTheProvidersForMock
        });
        await seedNew();
        const newNick = "ShinyNewHero";
        await result.current!._customizeStory!(newNick);

        let storiesAfter = await db.story.toArray();
        expect(storiesAfter.find(s => s.id === 3)?.storyline?.content).toBe(`I am ${newNick}.`);
        expect(storiesAfter.find(s => s.id === 14)?.action?.navigateAction?.dest?.where).toBe(`/user/${newNick}`);
        expect(storiesAfter.find(s => s.id === 17)?.action?.saveAction?.dest?.where).toBe(`/user/${newNick}`);
        expect(storiesAfter.find(s => s.id === 51)?.addParallelExec?.branches[0][0]?.action?.sendMessageAction?.from).toBe("clanker_oil_stain");

        let postsAfter = await db.posts.toArray();
        expect(postsAfter.find(p => p.id === 1)?.author).toBe(newNick);
        expect(postsAfter.find(p => p.id === 3)?.content).toBe(`Testing ${newNick} shit`);
        expect(postsAfter.find(p => p.id === 3)?.author).toBe("penis");

        let chatsAfter = await db.chats.toArray();
        expect(chatsAfter.find(c => c.id === "cyberdivers")?.owner).toBe(newNick);
        expect(chatsAfter.find(c => c.id === "cyberdivers")?.pregenMessages[0].from).toBe(`pinchIt`);

        let subforumsAfter = await db.subforums.toArray();
        expect(subforumsAfter.find(s => s.id === 1)?.admin).toBe("john_cyberdiverO7");
        expect(subforumsAfter.find(s => s.id === 1)?.members.find((m) => m === "main_hero")).toBeUndefined();
    });

    test("createUser should update user, clear story messages, and populate chat messages", async () => {
        const { result } = renderHook(() => ({
            storyFuncs: useStory()._getStoryHook!(),
        }), {
            wrapper: AllTheProvidersForMock
        });

        await seedNew();
        const newNickname = "TestHero";
        const newPassword = "testpassword123";

        const customizeStorySpy = vi.spyOn(bridge, 'exec');
        const collectionProto = Object.getPrototypeOf(db.users.where("savedStoryId").aboveOrEqual(0));
        const dbUsersModifySpy = vi.spyOn(collectionProto, "modify");
        const dbStoryMessagesClearSpy=vi.spyOn(db.storyMessages,"clear");
        const chatAddMessagesToDbSpy = vi.spyOn(result.current.storyFuncs!._getChatHook!(), 'addMessagesToDb');

        const createdAt = new Date();
        await result.current.storyFuncs!.createUser(newNickname, newPassword);

        expect(customizeStorySpy).toHaveBeenCalledWith(result.current.storyFuncs!._customizeStory, newNickname);
        expect(dbUsersModifySpy).toHaveBeenCalledWith({ nickname: newNickname, password: newPassword, savedStoryId: 1 });
        expect(dbStoryMessagesClearSpy).toHaveBeenCalled();
        const chatsAmount=await db.chats.count();
        expect(chatAddMessagesToDbSpy).toHaveBeenCalledTimes(chatsAmount);

        const message=await db.storyMessages.where("chatId").equals("cyberdivers").first();
        const chat=await db.chats.where("id").equals("cyberdivers").first();
        expect(message!.timeSent.getMinutes()).toBe(createdAt.getMinutes()+chat!.initTimeDiff+chat!.pregenMessages[0].timeDiff);
    });
});