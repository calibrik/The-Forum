import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type RefObject, createContext, useContext } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, type IAction, type IScriptLine } from "../backend/db";
import gsap from 'gsap';
import { Outlet, useNavigate } from "react-router";
import { useUserState } from "./UserAuth";
import type { FC } from "react";
import { EffectOverlay } from "../components/EffectOverlay";
interface IStoryProviderProps {
};
interface IStoryProvider {
    setTypingBoxes: (tbs: RefObject<ITypingTextBoxHandle | null>[]) => void,
    showStory: (fromId: number) => Promise<void>
    getAnim: (anim: string) => gsap.core.Timeline | undefined
    resetTypingBoxes: () => void
}

const EFFECTS_MAP: Record<string, (typingBoxes: RefObject<RefObject<ITypingTextBoxHandle | null>[]>) => gsap.core.Timeline> = {
    "NOTEPAD_FLASH": (typingBoxes: RefObject<RefObject<ITypingTextBoxHandle | null>[]>) => {
        return gsap.timeline()
            .set("[data-istransition='true']", {
                transition: "none"
            })
            .set("#dissapear", {
                visibility: "hidden",
            })
            .set("#appContainer", {
                backgroundColor: "transparent",
                border: "none"
            })
            .set("#container", {
                backgroundColor: "white"
            })
            .set("#textBox", {
                color: "black",
                fontFamily: "Courier Prime"
            })
            .set("#contentDiv", {
                overflowY: "visible"
            })
            .add(() => (typingBoxes.current[0].current?.setCursorType("terminal")))
            .set("#container", {
                clearProps: "all"
            }, "+=0.6")
            .set("#textBox", {
                clearProps: "color"
            })
            .set("[data-istransition='true']", {
                clearProps: "transition"
            })
    },
    "FADE_OUT": (_: RefObject<RefObject<ITypingTextBoxHandle | null>[]>) => {
        return gsap.timeline()
            .set("#effectOverlay1", {
                visibility: "visible",
                opacity: 0,
                backgroundColor: "black"
            })
            .to("#effectOverlay1", {
                duration: 2,
                opacity: 1
            })
    },
    "FADE_IN": (_: RefObject<RefObject<ITypingTextBoxHandle | null>[]>) => {
        return gsap.timeline()
            .set("#effectOverlay1", {
                visibility: "visible",
                opacity: 1,
                backgroundColor: "black"
            })
            .to("#effectOverlay1", {
                duration: 2,
                opacity: 0
            }, "+=0.5")
            .set("#effectOverlay1",{
                visibility:"hidden"
            })
    },
}



const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const typingBoxes = useRef<RefObject<ITypingTextBoxHandle|null>[]>([]);
    const isMounted = useRef<boolean>(true);
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);
    const navigate = useNavigate();
    const userState = useUserState();
    const masterRef = useRef<gsap.core.Timeline>(undefined);
    const isStoryNavRef=useRef<boolean>(false);

    async function fetchScriptLine(id: number) {
        return await db.story.get(id);
    }

    const resetAnims = contextSafe(() => {
        if (!masterRef.current||isStoryNavRef.current)
            return;
        masterRef.current.kill();
        for (let tb of typingBoxes.current) {
            tb.current?.reset();
        }
        gsap.set("#container,#textBox,[data-istransition='true'],#effectOverlay1,#dissapear,#appContainer,#contentDiv", {
            clearProps: "all"
        })
    });

    async function processAction(action: IAction) {
        switch (action.name) {
            case "NAVIGATE":
                isStoryNavRef.current=true;
                navigate(action.dest ?? "");
                isStoryNavRef.current=false;
                break;
            case "SAVE":
                await db.users.where("storyId").aboveOrEqual(1).modify({ storyId: action.storyId ?? 1 });
                userState.storyId.current = action.storyId ?? 1;
                break;
            default:
                console.error(`Unknown action ${action.name}`)
                break;
        }
    }



    const showStory = contextSafe(async (fromId: number) => {
        if (masterRef.current)
            return;
        let id = fromId;
        loopTicket.current++;
        const ticket = loopTicket.current;
        let scl: IScriptLine | undefined = undefined;
        let master = gsap.timeline({ paused: true });
        while (!scl || !scl.isActionAwait) {
            scl = await fetchScriptLine(id);
            if (!isMounted.current || ticket != loopTicket.current)
                return;
            id++;
            if (!scl)
                break;
            if (scl.storyline) {
                const stl = scl.storyline;
                if (stl.typingBoxId >= typingBoxes.current.length) {
                    console.error(`No ref assigned for index ${stl.typingBoxId}.`)
                    continue;
                }
                const box = typingBoxes.current[stl.typingBoxId].current;
                if (!box) {
                    console.error(`No ref assigned for index ${stl.typingBoxId}.`)
                    continue;
                }
                master.add(box.getTimeline({
                    content: stl.content,
                    speed: stl.speed,
                    delim: stl.delim,
                    clearAfter: stl.cleanAfter
                }), scl.offset);
            }

            else if (scl.effect) {
                const anim = getAnim(scl.effect.name);
                if (!anim)
                    continue
                master.add(anim, scl.offset);
            }

            else if (scl.action) {
                const action = scl.action;
                action.storyId = id;
                master.add(() => {
                    master.pause();
                    processAction(action).then(() => master.resume());
                });
            }
        }
        masterRef.current=master;
        console.log("play anim")
        master.play();
        await master;
        masterRef.current=undefined;
    });

    const getAnim = contextSafe((anim: string) => {
        if (!EFFECTS_MAP[anim]) {
            console.error(`No anim called ${anim}`);
            return;
        }
        return EFFECTS_MAP[anim](typingBoxes);
    })

    function setTypingBoxes(tbs: RefObject<ITypingTextBoxHandle | null>[]) {
        typingBoxes.current=tbs;
    }

    function resetTypingBoxes() {
        typingBoxes.current = [];
    }

    useEffect(() => {
        isMounted.current = true;
        window.addEventListener("popstate",resetAnims);
        return () => {
            window.removeEventListener("popstate",resetAnims);
            isMounted.current = false;
        }
    }, [])

    return (
        <StoryContext.Provider value={{ setTypingBoxes, resetTypingBoxes, showStory, getAnim }}>
            <EffectOverlay id="effectOverlay1"/>
            <Outlet/>
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);

    if (!context)
        throw new Error('useStory must be used within the ModalsProvider!');

    return context;
}


