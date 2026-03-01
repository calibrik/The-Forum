import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type RefObject, createContext, useContext } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, type IAction, type IDestination, type IScriptLine } from "../backend/db";
import gsap from 'gsap';
import { Outlet, useLocation, useNavigate } from "react-router";
import type { FC } from "react";
import { EffectOverlay } from "../components/EffectOverlay";
import styles from "../scss/storyProvider.module.scss";
import { useUserState } from "./UserAuth";
interface IStoryProviderProps {
};
interface IStoryProvider {
    setTypingBoxes: (tbs: RefObject<ITypingTextBoxHandle | null>[]) => void,
    showStory: (fromId: number) => Promise<void>
    getAnim: (anim: string) => gsap.core.Timeline | undefined
    getChildLevel: () => number;
    // resetAnims: () => void
    initReady: (level:number) => void
    resumeStory: (e: React.MouseEvent) => boolean
    storyId: RefObject<number>
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: () => void
    customizeStory: (nickname: string) => Promise<void>
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
            .set("#effectOverlay1", {
                visibility: "hidden"
            })
    },
}



const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const typingBoxes = useRef<RefObject<ITypingTextBoxHandle | null>[]>([]);
    const isMounted = useRef<boolean>(true);
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);
    const navigate = useNavigate();
    const masterRef = useRef<gsap.core.Timeline>(undefined);
    const isStoryNavRef = useRef<boolean>(false);
    const pageInitResolveRef = useRef<() => void>(undefined);
    const currHintId = useRef<string>("NON_EXISTENT_ID");
    const storyId = useRef<number>(1);
    const destRef = useRef<IDestination>(undefined);
    const location = useLocation();
    const userState = useUserState();

    function waitForInit() {
        return new Promise<void>((resolve) => pageInitResolveRef.current = resolve);
    }

    function initReady(level:number) {
        if (level!=destRef.current?.level)
            return;
        if (pageInitResolveRef.current)
            pageInitResolveRef.current();
    }

    function isStoryGoing() {
        return masterRef.current != undefined;
    }

    const resetAnims = contextSafe(() => {
        if (!masterRef.current || isStoryNavRef.current)
            return;
        if (destRef.current) {
            const location = window.location.pathname.split('/').slice(0, destRef.current.level + 1).join('/');
            const targetLocation = destRef.current.where.split('/').slice(0, destRef.current.level + 1).join('/');
            if (location == targetLocation)
                return;
        }
        masterRef.current.kill();
        masterRef.current = undefined;
        for (let tb of typingBoxes.current) {
            tb.current?.reset();
        }
        typingBoxes.current = [];
        document.querySelector(`#${currHintId.current}`)?.classList.remove(currHintId.current.includes("text") ? styles.hintText : styles.hint);
        gsap.set("#container,#textBox,[data-istransition='true'],#effectOverlay1,#dissapear,#appContainer,#contentDiv", {
            clearProps: "all"
        })
    });

    async function processAction(action: IAction) {
        switch (action.name) {
            case "NAVIGATE":
                isStoryNavRef.current = true;
                destRef.current = action.dest;
                if (action.dest?.where != "SAME") {
                    let p = waitForInit();
                    navigate(action.dest?.where ?? "");
                    if (action.dest?.level == 0)
                        window.dispatchEvent(new Event("signalLevel0"))
                    await p;
                }
                isStoryNavRef.current = false;
                break;
            case "SAVE":
                await db.users.where("storyId").aboveOrEqual(1).modify({ storyId: action.storyId ?? 1 });
                storyId.current = action.storyId ?? 1;
                break;
            case "HINT":
                let el = document.querySelector(`#${action.id ?? ""}`);
                if (!el) {
                    console.error(`No element with id ${action.id}`)
                    return;
                }
                currHintId.current = action.id as string ?? "NON_EXISTENT_ID";
                el.classList.add(currHintId.current.includes("text") ? styles.hintText : styles.hint);
                break;
            case "APPLY_STYLE_TO_BOX":
                typingBoxes.current[action.id as number].current?.applyStyle(action.style ?? {});
                break;
            default:
                console.error(`Unknown action ${action.name}`)
                break;
        }
    }

    function resumeStory(e: React.MouseEvent): boolean {
        e.preventDefault();
        if (isStoryGoing() || currHintId.current !== e.currentTarget.id)
            return false;
        e.currentTarget.classList.remove(currHintId.current.includes("text") ? styles.hintText : styles.hint);
        // currHintId.current = "NON_EXISTENT_ID";
        showStory(storyId.current + 1);
        return true;
    }

    async function recoverCheckpoint(id: number, scl?: IScriptLine) {
        if (!scl)
            return;
        storyId.current = id;
        destRef.current = scl.dest;
        if (scl.hintActionPos) {
            let hintScl = await db.story.get(id + scl.hintActionPos);
            currHintId.current = hintScl?.action?.id as string;
        }
        if (scl.dest?.level == 0)
            window.dispatchEvent(new Event("signalLevel0"))
        navigate(scl.dest?.where ?? "");
    }

    function recoverStoryOnPage() {
        if (isStoryNavRef.current || !userState.isRealLoggedIn.current)
            return;
        if (destRef.current && destRef.current.level > 0) {
            const location = window.location.pathname.split('/').slice(0, destRef.current.level + 1).join('/');
            const targetLocation = destRef.current.where.split('/').slice(0, destRef.current.level + 1).join('/');
            if (location != targetLocation)
                return;
        }
        if (currHintId.current !== "NON_EXISTENT_ID") {
            processAction({
                name: "HINT",
                id: currHintId.current
            });
            return;
        }
        showStory(storyId.current)
    }

    async function customizeStory(nickname: string) {
        let story = await db.story.toArray();
        for (let scl of story) {
            if (!scl.storyline)
                continue;
            const content = scl.storyline.content.replace(/main_hero/g, nickname);
            if (content == scl.storyline.content)
                continue;
            scl.storyline.content = content;
            await db.story.update(scl.id, { storyline: scl.storyline });
        }
    }

    const showStory = contextSafe(async (fromId: number) => {
        if (isStoryGoing())
            return;
        let id = fromId;
        loopTicket.current++;
        const ticket = loopTicket.current;
        let scl: IScriptLine | undefined = undefined;
        let master = gsap.timeline({ paused: true });
        while (!scl || !scl.isActionAwait) {
            scl = await db.story.get(id);
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
                    clearAfter: stl.clearAfter
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
                action.storyId = id - 1;
                master.add(() => {
                    master.pause();
                    processAction(action).then(() => master.resume());
                }, scl.offset);
            }
        }
        masterRef.current = master;
        console.log("play anim")
        master.play();
        await master;
        masterRef.current = undefined;
    });

    const getAnim = contextSafe((anim: string) => {
        if (!EFFECTS_MAP[anim]) {
            console.error(`No anim called ${anim}`);
            return;
        }
        return EFFECTS_MAP[anim](typingBoxes);
    })

    function setTypingBoxes(tbs: RefObject<ITypingTextBoxHandle | null>[]) {
        typingBoxes.current = tbs;
    }

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        }
    }, [])

    useEffect(() => {
        resetAnims();
    }, [location.pathname])

    return (
        <StoryContext.Provider value={{
            setTypingBoxes, showStory, getAnim, initReady, resumeStory, storyId, recoverCheckpoint, customizeStory, recoverStoryOnPage, getChildLevel() {
                return destRef.current?.level ?? 0;
            },
        }}>
            <EffectOverlay id="effectOverlay1" />
            <Outlet />
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);

    if (!context)
        throw new Error('useStory must be used within the ModalsProvider!');

    return context;
}


export function useStoryInit() {
    const story = useStory();
    const loopTicket = useRef<number>(0);

    async function storyInit(childLevel: number, typingBoxes: RefObject<ITypingTextBoxHandle | null>[], pageInit?: () => Promise<void> | void) {
        loopTicket.current++;
        const ticket = loopTicket.current;
        if (pageInit)
            await pageInit();
        story.setTypingBoxes(typingBoxes);
        if (ticket != loopTicket.current)
            return;
        story.initReady(childLevel);
        if (childLevel == story.getChildLevel())
            story.recoverStoryOnPage();
    }

    return storyInit;
}