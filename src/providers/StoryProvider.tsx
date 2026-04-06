import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type RefObject, createContext, useContext } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, type IAction, type IDestination, type IMessage, type IScriptLine } from "../backend/db";
import gsap from 'gsap';
import { Outlet, useLocation, useNavigate } from "react-router";
import type { FC } from "react";
import { EffectOverlay } from "../components/EffectOverlay";
import styles from "../scss/storyProvider.module.scss";
import { useUserState } from "./UserAuth";
import type { ISearchFieldHandle } from "../components/SearchField";
import { delay } from "../utils";
interface IStoryProviderProps {
};
interface IStoryProvider {
    setTypingBoxes: (tbs: RefObject<ITypingTextBoxHandle | null>[], level: number) => void,
    showStory: (fromId: number) => Promise<void>
    getAnim: (anim: string) => gsap.core.Timeline | undefined
    initReady: (level: number) => void
    resumeStoryFromHint: (e: React.MouseEvent) => boolean
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: (level: number) => void
    customizeStory: (nickname: string) => Promise<void>
    goBackHintNavPath: (clickedId: string) => void,
    goForwardHintNavPath: (clickedId: string) => void,
    setHeaderSearch: (ref: ISearchFieldHandle | null) => void,
    addMessage(message:IMessage,timeToWait:number):Promise<void>;
    setChatHandle(ch:IChatHandle):void;
}

// interface IAdditionalNavParameters{
//     chatId?:string
// }

const NAVIGATE_TO_PAGE: Record<string, (location: string[], targetLocation: string[], mismatchedLevel: number, searchField?: ISearchFieldHandle) => string[]> = {
    "user": (_location, targetLocation, mismatchedLevel) => {
        if (mismatchedLevel == 3) {
            return [targetLocation[3]];
        }
        return ["user-icon-text"];
    },
    "subforum": (_location, targetLocation, mismatchedLevel, searchField) => {
        if (mismatchedLevel == 3) {
            return [targetLocation[3]];
        }
        searchField?.setSuggestionHint(`f/${targetLocation[2]}`);
        return ["header-search", ""];
    },
    "chat": (location, targetLocation, mismatchedLevel) => {
        if (mismatchedLevel == 2) {
            if (location.length >= 3)
                return ["back-text"];
            return [targetLocation[2]];
        }
        return ["menu-icon-text", "chat-menu"];
    },
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


function useHintNavPath() {
    const currIndex = useRef<number>(-1);//current index in path for chained nav
    const currNavPath = useRef<string[]>([]);//current calculated nav path, if length==0 means it wasn't calculated
    const headerSearch = useRef<ISearchFieldHandle>(null);

    function setHeaderSearch(ref: ISearchFieldHandle | null) {
        headerSearch.current = ref;
    }

    function hint(id: string) {
        if (id == "")
            return;
        let el = document.querySelector(`#${id}`);
        if (!el) {
            console.error(`No element with id ${id}`)
            return;
        }
        el.classList.add(id.includes("text") ? styles.hintText : styles.hint);
    }

    function goForwardHintNavPath(clickedId: string) {
        if (currNavPath.current.length > 1 && clickedId == currNavPath.current[currIndex.current]) {
            const id = currNavPath.current[currIndex.current];
            document.querySelector(`#${id}`)?.classList.remove(id.includes("text") ? styles.hintText : styles.hint);
            // if (++currIndex.current >= currNavPath.current.length) {
            //     // currNavPath.current=[];
            //     return;
            // }
            hint(currNavPath.current[++currIndex.current]);

        }
    }

    function hintNavPath(target?: IDestination) {
        if (!target || currNavPath.current.length != 0) {
            return;
        }
        const location = window.location.pathname.split('/').slice(0, target.level + 1);
        const targetLocation = target.where.split('/');
        let mismatchedLevel = 0;
        const minLength = Math.min(location.length, targetLocation.length);
        for (; mismatchedLevel < minLength; mismatchedLevel++) {
            if (location[mismatchedLevel] != targetLocation[mismatchedLevel])
                break;
        }
        if (mismatchedLevel > target.level)
            return;
        currNavPath.current = NAVIGATE_TO_PAGE[targetLocation[1]](location, targetLocation, mismatchedLevel, headerSearch.current ?? undefined);
        currIndex.current = 0
        hint(currNavPath.current[currIndex.current]);
    }

    function goBackHintNavPath(clickedId: string) {
        if (currNavPath.current.length > 1 && clickedId == currNavPath.current[currIndex.current]) {
            const id = currNavPath.current[currIndex.current--];
            if (id != "")
                document.querySelector(`#${id}`)?.classList.remove(id.includes("text") ? styles.hintText : styles.hint);
            hint(currNavPath.current[currIndex.current]);
        }
    }

    function resetHintNavPath() {
        if (currNavPath.current.length == 0)
            return;
        const id = currNavPath.current[currIndex.current];
        currNavPath.current = [];
        headerSearch.current?.setSuggestionHint(undefined);
        if (id == "")
            return;
        document.querySelector(`#${id}`)?.classList.remove(id.includes("text") ? styles.hintText : styles.hint);
    }

    return { hint, hintNavPath, goBackHintNavPath, goForwardHintNavPath, resetHintNavPath, setHeaderSearch };
}

interface IChatHandle{
    setStringToType:(string:string)=>void;
    addTypingUser:(username:string)=>void;
    removeTypingUser:(username:string)=>void;
    addMessage:(message:IMessage)=>void;
}

function useChat() {
    const messages=useRef<IMessage[]>([]);
    const chatHandle=useRef<IChatHandle>(undefined);
    const userState=useUserState();

    async function addMessage(message:IMessage,timeToType:number) {
        if (message.from==userState.userLoggedIn.current){
            messages.current.push(message);
            return;
        }
        chatHandle.current?.addTypingUser(message.from);
        await delay(timeToType);
        chatHandle.current?.removeTypingUser(message.from);
        messages.current.push(message);
        chatHandle.current?.addMessage(message);
    }

    async function sinkMessages(){
        await db.storyMessages.bulkAdd(messages.current);
    }

    function setChatHandle(ch:IChatHandle){
        chatHandle.current=ch;
    }

    return {addMessage, sinkMessages, setChatHandle}
}

const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const typingBoxes = useRef<RefObject<ITypingTextBoxHandle | null>[]>([]);//boxes for showing text
    const isMounted = useRef<boolean>(true);//is provider mounted
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);//protection against strict mode
    const navigate = useNavigate();
    const masterRef = useRef<gsap.core.Timeline>(undefined);//timeline with the story (undefined if nothing is being played at the moment)
    const isStoryNavRef = useRef<boolean>(false);//flag for story navigation to protect from animation reset if navigation is made by the story and not user
    const pageInitResolveRef = useRef<() => void>(undefined);//resolve for page
    const currHintId = useRef<string>("NON_EXISTENT_ID");//holds last hinted id
    const currStoryId = useRef<number>(1);//points at next action to continue after user pressed story hint
    const savedStoryId = useRef<number>(1);//points at save action to recover story from
    const pageStoryId = useRef<number>(1);//points at next action after page navigation to recover on page from
    const locationRef = useRef<IDestination>(undefined);//current location for the story
    const location = useLocation();
    const userState = useUserState();
    const isStoryRecovered = useRef<boolean>(false);//has story been recovered from target page yet  
    const { hint, hintNavPath, goBackHintNavPath, goForwardHintNavPath, resetHintNavPath, setHeaderSearch } = useHintNavPath();
    const {addMessage, sinkMessages, setChatHandle}=useChat();

    function waitForInit() {
        return new Promise<void>((resolve) => pageInitResolveRef.current = resolve);
    }

    function initReady(level: number) {
        if (level != locationRef.current?.level)
            return;
        if (pageInitResolveRef.current)
            pageInitResolveRef.current();
    }

    function isStoryGoing() {
        return masterRef.current != undefined;
    }

    const resetAnims = contextSafe(() => {
        if (isStoryNavRef.current)
            return;
        if (locationRef.current) {
            const location = window.location.pathname.split('/').slice(0, locationRef.current.level + 1).join('/');
            const targetLocation = locationRef.current.where.split('/').slice(0, locationRef.current.level + 1).join('/');
            if (location == targetLocation)
                return;
        }
        resetHintNavPath();
        if (isStoryRecovered.current) {
            currStoryId.current = savedStoryId.current + 1;
            isStoryRecovered.current = false;
        }
        if (masterRef.current) {
            masterRef.current.kill();
            masterRef.current = undefined;
            gsap.set("#container,#textBox,[data-istransition='true'],#effectOverlay1,#dissapear,#appContainer,#contentDiv", {
                clearProps: "all"
            })
            for (let tb of typingBoxes.current) {
                tb.current?.reset();
            }
        }
        typingBoxes.current = [];
        document.querySelector(`#${currHintId.current}`)?.classList.remove(currHintId.current.includes("text") ? styles.hintText : styles.hint);
    });

    async function processAction(action: IAction) {
        switch (action.name) {
            case "NAVIGATE":
                isStoryNavRef.current = true;
                pageStoryId.current = (action.storyId ?? 1) + 1;
                currHintId.current = "NON_EXISTENT_ID";
                locationRef.current = action.dest;
                sinkMessages();
                if (action.navigate) {
                    let p = waitForInit();
                    navigate(action.dest?.where ?? "");
                    if (action.dest?.level == 0)
                        window.dispatchEvent(new Event("signalLevel0"))
                    await p;
                }
                else {
                    isStoryRecovered.current = false;
                    hintNavPath(action.dest);
                }
                isStoryNavRef.current = false;
                break;
            case "SAVE":
                await db.users.where("savedStoryId").aboveOrEqual(1).modify({ savedStoryId: action.storyId ?? 1 });
                savedStoryId.current = action.storyId ?? 1;
                pageStoryId.current = action.storyId ?? 1 + 1;
                sinkMessages();
                break;
            case "HINT":
                hint(action.id as string);
                currHintId.current = action.id as string ?? "NON_EXISTENT_ID";
                break;
            case "APPLY_STYLE_TO_BOX":
                typingBoxes.current[action.id as number].current?.applyStyle(action.style ?? {});
                break;
            default:
                console.error(`Unknown action ${action.name}`)
                break;
        }
    }

    function resumeStoryFromHint(e: React.MouseEvent): boolean {
        e.preventDefault();
        if (isStoryGoing() || currHintId.current !== e.currentTarget.id)
            return false;
        e.currentTarget.classList.remove(currHintId.current.includes("text") ? styles.hintText : styles.hint);
        // currHintId.current = "NON_EXISTENT_ID";
        showStory(currStoryId.current);
        return true;
    }

    async function recoverCheckpoint(id: number, scl?: IScriptLine) {
        if (!scl)
            return;
        savedStoryId.current = id;
        currStoryId.current = id + 1;
        pageStoryId.current = id + 1;
        locationRef.current = scl.dest;
        if (scl.hintActionPos) {
            let hintScl = await db.story.get(id + scl.hintActionPos);
            currHintId.current = hintScl?.action?.id as string;
        }
        if (scl.dest?.level == 0)
            window.dispatchEvent(new Event("signalLevel0"))
        navigate(scl.dest?.where ?? "");
    }

    function recoverStoryOnPage(level: number) {
        if (!locationRef.current || !userState.isRealLoggedIn.current || isStoryRecovered.current)
            return;
        if (level != locationRef.current.level) {
            hintNavPath(locationRef.current);
            return;
        }
        if (locationRef.current && locationRef.current.level > 0) {
            const location = window.location.pathname.split('/').slice(0, locationRef.current.level + 1).join('/');
            const targetLocation = locationRef.current.where.split('/').slice(0, locationRef.current.level + 1).join('/');
            if (location != targetLocation) {
                hintNavPath(locationRef.current);
                return;
            }
        }
        resetHintNavPath();
        isStoryRecovered.current = true;
        if (currHintId.current !== "NON_EXISTENT_ID") {
            hint(currHintId.current);
            return;
        }
        showStory(pageStoryId.current)
    }

    async function customizeStory(nickname: string) {
        const users = await db.users.where("savedStoryId").aboveOrEqual(0).toArray();
        const regex = new RegExp(users[0].nickname, 'gi');
        await db.story.toCollection().modify((scl) => {
            const sclString = JSON.stringify(scl);
            if (!sclString.includes(users[0].nickname)) {
                return false;
            }
            Object.assign(scl, JSON.parse(sclString.replace(regex, nickname)));
        });
        await db.posts.toCollection().modify((post) => {
            const postString = JSON.stringify(post);
            if (!postString.includes(users[0].nickname)) {
                return false;
            }
            Object.assign(post, JSON.parse(postString.replace(regex, nickname)));
        });
        await db.chats.toCollection().modify((chat) => {
            const chatString = JSON.stringify(chat);
            if (!chatString.includes(users[0].nickname)) {
                return false;
            }
            Object.assign(chat, JSON.parse(chatString.replace(regex, nickname)));
        });
        await db.subforums.toCollection().modify((subforum) => {
            const subforumString = JSON.stringify(subforum);
            if (!subforumString.includes(users[0].nickname)) {
                return false;
            }
            Object.assign(subforum, JSON.parse(subforumString.replace(regex, nickname)));
        });
        await db.storyMessages.toCollection().modify((message) => {
            const messageString = JSON.stringify(message);
            if (!messageString.includes(users[0].nickname)) {
                return false;
            }
            Object.assign(message, JSON.parse(messageString.replace(regex, nickname)));
        });
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
        currStoryId.current = id;
        masterRef.current = undefined;
    });

    const getAnim = contextSafe((anim: string) => {
        if (!EFFECTS_MAP[anim]) {
            console.error(`No anim called ${anim}`);
            return;
        }
        return EFFECTS_MAP[anim](typingBoxes);
    })

    function setTypingBoxes(tbs: RefObject<ITypingTextBoxHandle | null>[], level: number) {
        if (level == locationRef.current?.level)
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
            setTypingBoxes,
            showStory,
            getAnim,
            initReady,
            resumeStoryFromHint,
            recoverCheckpoint,
            customizeStory,
            recoverStoryOnPage,
            goBackHintNavPath,
            goForwardHintNavPath,
            setHeaderSearch,
            addMessage,
            setChatHandle
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
        if (ticket != loopTicket.current)
            return;
        story.setTypingBoxes(typingBoxes, childLevel);
        story.initReady(childLevel);
        story.recoverStoryOnPage(childLevel);
    }

    return storyInit;
}