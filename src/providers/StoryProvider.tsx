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
    getAnim: (anim: string,options?:IEffectsOptions) => gsap.core.Timeline | undefined
    initReady: (level: number) => void
    resumeStory(): void
    resumeStoryFromHint: (clickedId: string) => boolean
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: (level: number) => void
    createUser: (nickname: string, password: string) => Promise<void>
    goBackHint: (clickedId: string) => void,
    goForwardHint: (clickedId: string) => void,
    setHeaderSearch: (ref: ISearchFieldHandle | null) => void,
    setChatHandle(ch: IChatHandle): Promise<void>;
    addMessageFromUser(content: string): Promise<void>
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

export interface IEffectsOptions {
    typingBoxes?: RefObject<RefObject<ITypingTextBoxHandle | null>[]>,
    duration?: number,
    opacity?: number
}

const EFFECTS_MAP: Record<string, (options?: IEffectsOptions) => gsap.core.Timeline> = {
    "NOTEPAD_FLASH": (options) => {
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
            .add(() => (options?.typingBoxes?.current[0].current?.setCursorType("terminal")))
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
    "RED_SCREEN": (options) => {
        return gsap.timeline()
            .fromTo("#effectOverlay1",
                {
                    opacity: 0,
                    backgroundColor: "red"
                },
                {
                    duration: options?.duration,
                    opacity: options?.opacity
                })
    },
    "FADE_OUT": (options) => {
        return gsap.timeline()
            .fromTo("#effectOverlay1",
                {
                    opacity: 0,
                    backgroundColor: "black"
                },
                {
                    duration: options?.duration,
                    opacity: 1
                })
    },
    "REVERSE_OVERLAY": (options) => {
        return gsap.timeline()
            .to("#effectOverlay1", {
                opacity: 0,
                duration: options?.duration
            })
    },
}


function useHints() {
    const currIndex = useRef<number>(-1);//current index in path for chained nav
    const currHint = useRef<string[]>([]);//curr hint, length ==0 means it's not set
    const currStoryHint = useRef<string[]>([]);//current story hint used for caching the last story hint for recover on page function
    const headerSearch = useRef<ISearchFieldHandle>(null);
    const isStoryHint = useRef<boolean>(false);//is story hint currently hunting (for nav hint to trigger)
    const isLegitStoryHint = useRef<boolean>(true)//is story hint supposed produced from hint action or artificially planted

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

    function goForwardHint(clickedId: string) {
        if (currHint.current.length > 1 && clickedId == currHint.current[currIndex.current]) {
            removeCurrHint();
            hint(currHint.current[++currIndex.current]);
        }
    }

    function setStoryHint(hints: string[], dontActivate?: boolean, isLegit?: boolean) {
        currHint.current = hints;
        currStoryHint.current = hints;
        currIndex.current = 0;
        if (!dontActivate) {
            isStoryHint.current = true;
            hint(hints[0]);
        }
        isLegitStoryHint.current = isLegit ?? true;
    }

    function resetStoryHint() {
        currStoryHint.current = []
    }

    function reactivateStoryHint() {
        if (currStoryHint.current.length == 0)
            return;
        currIndex.current = 0;
        currHint.current = currStoryHint.current;
        isStoryHint.current = true;
        hint(currHint.current[0]);
    }

    function removeCurrHint() {
        const id = currHint.current[currIndex.current];
        if (id == "")
            return;
        document.querySelector(`#${id}`)?.classList.remove(id.includes("text") ? styles.hintText : styles.hint);
    }

    function getCurrentStoryHint() {
        if (currStoryHint.current.length == 0)
            return "";
        return currStoryHint.current[currIndex.current];
    }

    function verifyStoryHint() {
        return getCurrentStoryHint() !== "" && isLegitStoryHint.current;
    }

    function hintNavPath(target?: IDestination) {
        if (!target || !isStoryHint.current && currHint.current.length != 0) {
            return;
        }
        isStoryHint.current = false;
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
        currHint.current = NAVIGATE_TO_PAGE[targetLocation[1]](location, targetLocation, mismatchedLevel, headerSearch.current ?? undefined);
        currIndex.current = 0
        hint(currHint.current[currIndex.current]);
    }

    function goBackHint(clickedId: string) {
        if (currHint.current.length > 1 && clickedId == currHint.current[currIndex.current]) {
            removeCurrHint();
            hint(currHint.current[--currIndex.current]);
        }
    }

    function resetHint() {
        if (currHint.current.length == 0)
            return;
        removeCurrHint();
        currHint.current = [];
        headerSearch.current?.setSuggestionHint(undefined);
    }

    return { hintNavPath, goBackHint, goForwardHint, resetHint, setHeaderSearch, setStoryHint, reactivateStoryHint, resetStoryHint, removeCurrHint, getCurrentStoryHint, verifyStoryHint };
}

interface IChatHandle {
    setStringToType: (string: string) => void;
    addTypingUser: (username: string) => void;
    removeTypingUser: (username: string) => void;
    addMessage: (message: IMessage) => void;
    getMessage: (id: number) => IMessage | undefined
    getId: () => string
}

function useChat() {
    const messages = useRef<IMessage[]>([]);
    const chatHandle = useRef<IChatHandle>(undefined);
    const userState = useUserState();
    const lastId = useRef<number>(0);

    async function addMessageFromUser(content: string) {
        const message: IMessage = {
            id: lastId.current++,
            from: userState.userLoggedIn.current,
            content: content,
            timeSent: new Date(),
            chatId: chatHandle.current?.getId() ?? ""
        }
        messages.current.push(message);
        chatHandle.current?.addMessage(message);
    }

    async function addMessageFromNPC(from: string, content: string, timeToType: number, isReplyDiff?: number) {
        const message: IMessage = {
            id: lastId.current++,
            from: from,
            content: content,
            timeSent: new Date(),
            isReply: isReplyDiff ? lastId.current - (isReplyDiff + 1) : undefined,
            chatId: chatHandle.current?.getId() ?? ""
        }
        chatHandle.current?.addTypingUser(message.from);
        if (timeToType)
            await delay(timeToType);
        chatHandle.current?.removeTypingUser(message.from);
        messages.current.push(message);
        chatHandle.current?.addMessage(message);
    }

    async function sinkMessages() {
        await db.storyMessages.bulkAdd(messages.current);
        resetMessages();
    }

    async function addMessagesToDb(msgs: IMessage[]) {
        await db.storyMessages.bulkAdd(msgs);
    }

    async function setChatHandle(ch: IChatHandle) {
        lastId.current = await db.storyMessages.count() + 1;
        chatHandle.current = ch;
    }

    function resetMessages() {
        messages.current = [];
    }

    function promptMessage(content: string) {
        chatHandle.current?.setStringToType(content);
    }

    return { addMessageFromNPC, addMessageFromUser, sinkMessages, setChatHandle, resetMessages, addMessagesToDb, promptMessage }
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
    // const currHintId = useRef<string>("NON_EXISTENT_ID");//holds last hinted id
    const currStoryId = useRef<number>(1);//points at next action to continue after user pressed story hint
    const savedStoryId = useRef<number>(1);//points at save action to recover story from
    const pageStoryId = useRef<number>(1);//points at next action after page navigation to recover on page from
    const locationRef = useRef<IDestination>(undefined);//current location for the story
    const location = useLocation();
    const userState = useUserState();
    const isStoryRecovered = useRef<boolean>(false);//has story been recovered from target page yet  
    const { hintNavPath, goBackHint, goForwardHint, resetHint, setHeaderSearch, setStoryHint, reactivateStoryHint, resetStoryHint, removeCurrHint, getCurrentStoryHint, verifyStoryHint } = useHints();
    const { addMessageFromNPC, addMessageFromUser, sinkMessages, setChatHandle, resetMessages, addMessagesToDb, promptMessage } = useChat();

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
        resetMessages();
        resetHint();
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
    });

    async function processAction(action: IAction, storyId: number) {
        if (action.navigateAction) {
            isStoryNavRef.current = true;
            pageStoryId.current = storyId + 1;
            resetStoryHint();
            locationRef.current = action.navigateAction.dest;
            sinkMessages();
            if (action.navigateAction.navigate) {
                let p = waitForInit();
                navigate(action.navigateAction.dest?.where ?? "");
                if (action.navigateAction.dest?.level == 0)
                    window.dispatchEvent(new Event("signalLevel0"))
                await p;
            }
            else {
                isStoryRecovered.current = false;
                hintNavPath(action.navigateAction.dest);
            }
            isStoryNavRef.current = false;
        }
        if (action.saveAction) {
            await db.users.where("savedStoryId").aboveOrEqual(1).modify({ savedStoryId: storyId });
            savedStoryId.current = storyId;
            pageStoryId.current = storyId + 1;
            sinkMessages();
        }
        if (action.hintAction) {
            setStoryHint(action.hintAction.ids)
        }
        if (action.setTextBoxStyleAction) {
            typingBoxes.current[action.setTextBoxStyleAction.id].current?.applyStyle(action.setTextBoxStyleAction.style);
        }
        if (action.sendMessageAction) {
            addMessageFromNPC(action.sendMessageAction.from, action.sendMessageAction.content, action.sendMessageAction.timeToType, action.sendMessageAction.isReplyDiff);
        }
        if (action.promptMessageAction) {
            setStoryHint(["chat-input", "chat-send"], false, false)
            promptMessage(action.promptMessageAction.content);
        }
    }

    function resumeStory() {
        showStory(currStoryId.current);
    }

    function resumeStoryFromHint(clickedId: string): boolean {
        if (isStoryGoing() || getCurrentStoryHint() !== clickedId)
            return false;
        removeCurrHint();
        showStory(currStoryId.current);
        return true;
    }

    async function recoverCheckpoint(id: number, scl?: IScriptLine) {
        if (!scl)
            return;
        savedStoryId.current = id;
        currStoryId.current = id + 1;
        pageStoryId.current = id + 1;
        locationRef.current = scl.action?.saveAction?.dest;
        if (scl.action?.saveAction?.hintActionPos) {
            let hintScl = await db.story.get(id + scl.action.saveAction.hintActionPos);
            setStoryHint(hintScl?.action?.hintAction?.ids ?? [], true);
        }
        if (locationRef.current && locationRef.current.level == 0)
            window.dispatchEvent(new Event("signalLevel0"))
        navigate(locationRef.current?.where ?? "");
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
        resetHint();
        isStoryRecovered.current = true;
        if (verifyStoryHint()) {
            reactivateStoryHint();
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
                const anim = getAnim(scl.effect.name,{...scl.effect.options,typingBoxes:typingBoxes});
                if (!anim)
                    continue
                master.add(anim, scl.offset);
            }

            else if (scl.action) {
                const action = scl.action;
                const saveId = id - 1;
                master.add(() => {
                    master.pause();
                    processAction(action, saveId).then(() => master.resume());
                }, scl.offset);
            }
        }
        if (!isMounted.current || ticket != loopTicket.current)
            return;
        masterRef.current = master;
        console.log("play anim")
        master.play();
        await master;
        currStoryId.current = id;
        masterRef.current = undefined;
    });

    const getAnim = contextSafe((anim: string, options?: IEffectsOptions) => {
        if (!EFFECTS_MAP[anim]) {
            console.error(`No anim called ${anim}`);
            return;
        }
        return EFFECTS_MAP[anim](options);
    })

    function setTypingBoxes(tbs: RefObject<ITypingTextBoxHandle | null>[], level: number) {
        if (level == locationRef.current?.level)
            typingBoxes.current = tbs;
    }

    async function createUser(nickname: string, password: string) {
        await customizeStory(nickname);
        await db.users.where("savedStoryId").aboveOrEqual(0).modify({ nickname: nickname, password: password, savedStoryId: 1 });
        await db.storyMessages.clear();
        const createdAt = new Date();
        const chats = await db.chats.toArray();
        for (let chat of chats) {
            const chatTime = new Date(createdAt);
            chatTime.setMinutes(chatTime.getMinutes() + chat.initTimeDiff);
            let msgs: IMessage[] = [];
            for (let i = 0; i < chat.pregenMessages.length; i++) {
                const msg: IMessage = {
                    id: i + 1,
                    from: chat.pregenMessages[i].from,
                    content: chat.pregenMessages[i].content,
                    timeSent: new Date(chatTime),
                    chatId: chat.id
                }
                msg.timeSent.setMinutes(msg.timeSent.getMinutes() + chat.pregenMessages[i].timeDiff);
                msgs.push(msg);
            }
            addMessagesToDb(msgs);
        }
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
            createUser,
            recoverStoryOnPage,
            goBackHint,
            goForwardHint,
            setHeaderSearch,
            setChatHandle,
            resumeStory,
            addMessageFromUser
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