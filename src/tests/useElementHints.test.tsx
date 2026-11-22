import { describe, expect, test, vi } from 'vitest';
import { useElementHints } from '../hooks/useElementHints';
import { render, renderHook } from '@testing-library/react';
import { AllTheProvidersForMock } from '../App';
import hintStyles from "../scss/storyProvider.module.scss";
import { useUserState } from '../providers/UserAuth';
import { bridge } from '../misc/utils';

describe("useHints", () => {
    describe("hintNavPath", () => {
        test("hintNavPath (/user/main_hero level 2 from /chat, logged in as main_hero)", async () => {
            const { result } = renderHook(() => {
                const hints = useElementHints();
                const userState = useUserState();
                return { hints, userState };
            }, {
                wrapper: AllTheProvidersForMock
            });
            result.current.userState.userLoggedIn.current = "main_hero";
            vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
            result.current.hints.hintNavPath({ level: 2, user: "main_hero", where: "/user/main_hero" });
            expect(result.current.hints._getCurrHint?.().current).toEqual(["user-icon-text"]);
        });

        test("hintNavPath (/user/someone level 2 from /chat, logged in as main_hero)", async () => {
            const { result } = renderHook(() => {
                const hints = useElementHints();
                const userState = useUserState();
                return { hints, userState };
            }, {
                wrapper: AllTheProvidersForMock
            });
            result.current.userState.userLoggedIn.current = "main_hero";
            vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
            result.current.hints.hintNavPath({ level: 2, user: "main_hero", where: "/user/someone" });
            expect(result.current.hints._getCurrHint?.().current).toEqual(["header-search", ""]);
        });

        test("hintNavPath (/user/main_hero/comments level 3 from /user/main_hero)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
            result.current.hintNavPath({ level: 3, user: "", where: "/user/main_hero/comments" });
            expect(result.current._getCurrHint?.().current).toEqual(["comments"]);
        });

        test("hintNavPath (/user/main_hero level 3 from /user/main_hero/comments)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero/comments"))
            result.current.hintNavPath({ level: 3, user: "", where: "/user/main_hero" });
            expect(result.current._getCurrHint?.().current).toEqual(["posts"]);
        });

        test("hintNavPath (/subforum/test/comments level 3 from /subforum/test)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test"))
            result.current.hintNavPath({ level: 3, user: "", where: "/subforum/test/comments" });
            expect(result.current._getCurrHint?.().current).toEqual(["comments"]);
        });

        test("hintNavPath (/subforum/test level 2 from /subforum/test2)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test2"))
            result.current.hintNavPath({ level: 2, user: "", where: "/subforum/test" });
            expect(result.current._getCurrHint?.().current).toEqual(["header-search", ""]);
        });

        test("hintNavPath (/chat/test level 2 from /chat/test2)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/chat/test2"))
            result.current.hintNavPath({ level: 2, user: "", where: "/chat/test" });
            expect(result.current._getCurrHint?.().current).toEqual(["back-text"]);
        });

        test("hintNavPath (/chat/test level 2 from /chat)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
            result.current.hintNavPath({ level: 2, user: "", where: "/chat/test" });
            expect(result.current._getCurrHint?.().current).toEqual(["test"]);
        });

        test("hintNavPath (/chat level 1 from /user/main_hero)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
            result.current.hintNavPath({ level: 1, user: "", where: "/chat" });
            expect(result.current._getCurrHint?.().current).toEqual(["menu-icon-text", "chat-menu"]);
        });

        test("hintNavPath (/user/main_hero level 2 from /user/main_hero/comments)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero/comments"))
            result.current.hintNavPath({ level: 2, user: "", where: "/user/main_hero" });
            expect(result.current._getCurrHint?.().current).toEqual([]);
        });

        test("hintNavPath (/post/p5 level 2 from /user/main_hero)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
            result.current.hintNavPath({ level: 2, user: "", where: "/post/p5" });
            expect(result.current._getCurrHint?.().current).toEqual(["p5"]);
        });

        test("hintNavPath (/user/main_hero level 2 from /post/p5)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/post/p5"))
            result.current.hintNavPath({ level: 2, user: "", where: "/user/main_hero" });
            expect(result.current._getCurrHint?.().current).toEqual(["back-text"]);
        });

        test("hintNavPath (/subforum/test level 2 from /post/p5)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/post/p5"))
            result.current.hintNavPath({ level: 2, user: "", where: "/subforum/test" });
            expect(result.current._getCurrHint?.().current).toEqual(["back-text"]);
        });

        test("hintNavPath (/chat level 1 from /post/p5)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/post/p5"))
            result.current.hintNavPath({ level: 1, user: "", where: "/chat" });
            expect(result.current._getCurrHint?.().current).toEqual(["menu-icon-text", "chat-menu"]);
        });

        test("hintNavPath (/post/p4 level 2 from /post/p5)", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/post/p5"))
            result.current.hintNavPath({ level: 2, user: "", where: "/post/p4" });
            expect(result.current._getCurrHint?.().current).toEqual(["back-text"]);
        });

        test("no nav path overrides from higher levels", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            const hintSpy = vi.spyOn(bridge, "exec");
            vi.stubGlobal("location", new URL("http://localhost:3000/subforum/test/comments"))
            result.current.hintNavPath({ level: 3, user: "", where: "/subforum/test" });
            result.current.hintNavPath({ level: 2, user: "", where: "/subforum/test2" });
            expect(hintSpy).toHaveBeenCalledTimes(1);
            const args = hintSpy.mock.calls[0]
            expect(args[0]).toBe(result.current._hint);
            expect(args[1]).toBe("posts");
        });

        test("hintNavPath hints the logout button when the logged in user is wrong", async () => {
            const { result } = renderHook(() => {
                const hints = useElementHints();
                const userState = useUserState();
                return { hints, userState };
            }, {
                wrapper: AllTheProvidersForMock
            });
            result.current.userState.userLoggedIn.current = "main_hero";
            vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
            result.current.hints.hintNavPath({ level: 2, user: "sillygoose228", where: "/user/sillygoose228" });
            expect(result.current.hints._getCurrHint?.().current).toEqual(["menu-icon-text", "logout"]);
        });

        test("hintNavPath uses the normal path hint when the logged in user matches", async () => {
            const { result } = renderHook(() => {
                const hints = useElementHints();
                const userState = useUserState();
                return { hints, userState };
            }, {
                wrapper: AllTheProvidersForMock
            });
            result.current.userState.userLoggedIn.current = "sillygoose228";
            vi.stubGlobal("location", new URL("http://localhost:3000/chat"))
            result.current.hints.hintNavPath({ level: 2, user: "sillygoose228", where: "/user/sillygoose228" });
            expect(result.current.hints._getCurrHint?.().current).toEqual(["user-icon-text"]);
        });
    });

    describe("hint", () => {
        test("hinting", async () => {
            const { result } = renderHook(() => useElementHints(), {
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
        });
    });

    describe("goBackHint and goForwardHint", () => {
        test("basic go back and forward on navpath", async () => {
            const { result } = renderHook(() => useElementHints(), {
                wrapper: AllTheProvidersForMock
            });
            vi.stubGlobal("location", new URL("http://localhost:3000/user/main_hero"))
            result.current.hintNavPath({ level: 1, user: "", where: "/chat" });
            expect(result.current._getCurrIndex?.().current).toEqual(0);
            result.current.goForwardHint("menu-icon-text");
            expect(result.current._getCurrIndex?.().current).toEqual(1);
            result.current.goBackwardHint("chat-menu");
            expect(result.current._getCurrIndex?.().current).toEqual(0);
        });
    });
});
