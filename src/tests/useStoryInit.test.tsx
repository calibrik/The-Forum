import { describe, expect, test, vi } from 'vitest';
import { db } from '../misc/db';
import { useStory } from '../providers/StoryProvider';
import { useStoryInit } from '../hooks/useStoryInit';
import { renderHook, waitFor } from '@testing-library/react';
import { AllTheProvidersForMock, exposedMockRouter } from '../App';
import gsap from 'gsap';
import { useUserState } from '../providers/UserAuth';
import { bridge } from '../misc/utils';

describe("storyInit", () => {
    test("regular flow", async () => {
        const mountResetSpy = vi.spyOn(gsap, "set");
        const { result } = renderHook(() => {
            const story = useStory();
            const userState = useUserState();
            return { story, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        await waitFor(() => expect(mountResetSpy.mock.calls.some((c) => String(c[0]).includes("#effectOverlay"))).toBe(true));
        mountResetSpy.mockRestore();
        const gsapSetSpy = vi.spyOn(gsap, "set");
        const callsSpy = vi.spyOn(bridge, "exec");
        result.current!.userState!.isRealLoggedIn.current = true;
        result.current!.userState!.userLoggedIn.current = "main_hero";
        exposedMockRouter?.navigate("/login");
        await waitFor(() => {
            expect(callsSpy.mock.calls.find((v) => v[0].name === result.current.story.recoverStoryOnPage.name)).not.toBeUndefined();
            expect(gsapSetSpy.mock.calls.filter((c) => String(c[0]).includes("#effectOverlay")).length).toBe(1);
        })
        
    });
    test("check order", async () => {
        const { result } = renderHook(() => {
            const storyInit = useStoryInit();
            const userState = useUserState();
            return { storyInit, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        const callsSpy = vi.spyOn(bridge, "exec");
        await db.users.add({ nickname: "main_hero" });
        result.current!.userState!.isRealLoggedIn.current = true;
        result.current!.userState!.userLoggedIn.current = "main_hero";
        exposedMockRouter?.navigate("/user/main_hero/comments");
        await waitFor(() => {
            const level3 = callsSpy.mock.calls.findIndex((v) => v[0].name === result.current.storyInit.name && v[1] == 3);
            const level2 = callsSpy.mock.calls.findIndex((v) => v[0].name === result.current.storyInit.name && v[1] == 2);
            expect(level3).not.toBe(-1);
            expect(level2).not.toBe(-1);
            expect(level3).toBeLessThan(level2);
        })
    });
    test("resets the anims once per path before recovering the page", async () => {
        const mountResetSpy = vi.spyOn(gsap, "set");
        const { result } = renderHook(() => {
            const story = useStory();
            const userState = useUserState();
            return { story, userState }
        }, {
            wrapper: AllTheProvidersForMock
        });
        await waitFor(() => expect(mountResetSpy.mock.calls.some((c) => String(c[0]).includes("#effectOverlay"))).toBe(true));
        mountResetSpy.mockRestore();
        await db.users.add({ nickname: "main_hero" });
        result.current!.userState!.isRealLoggedIn.current = true;
        result.current!.userState!.userLoggedIn.current = "main_hero";
        const seq: string[] = [];
        const realExec = bridge.exec as unknown as (...args: unknown[]) => unknown;
        const realSet = gsap.set as unknown as (...args: unknown[]) => unknown;
        vi.spyOn(bridge, "exec").mockImplementation((async (fn: (...a: unknown[]) => unknown, ...args: unknown[]) => {
            if (fn.name === result.current!.story.recoverStoryOnPage.name)
                seq.push("recover");
            return realExec(fn, ...args);
        }) as unknown as typeof bridge.exec);
        vi.spyOn(gsap, "set").mockImplementation(((targets: unknown, ...args: unknown[]) => {
            if (String(targets).includes("#effectOverlay"))
                seq.push("reset");
            return realSet(targets, ...args);
        }) as unknown as typeof gsap.set);
        exposedMockRouter?.navigate("/user/main_hero/comments");
        await waitFor(() => expect(seq.filter((v) => v === "recover").length).toBe(2));
        expect(seq.filter((v) => v === "reset").length).toBe(1);
        expect(seq.indexOf("reset")).toBeLessThan(seq.indexOf("recover"));
    });
});
