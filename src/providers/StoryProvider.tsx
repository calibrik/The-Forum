import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type RefObject, createContext, useContext } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, type IAction, type IDestination, type IMessage, type IScriptLine, type IShowPlaceholderField } from "../backend/db";
import gsap from 'gsap';
import { Outlet, useLocation, useNavigate } from "react-router";
import type { FC } from "react";
import { EffectOverlay } from "../components/EffectOverlay";
import styles from "../scss/storyProvider.module.scss";
import { useUserState } from "./UserAuth";
import type { ISearchFieldHandle } from "../components/SearchField";
import { bridge, delay, sanitizeDbFetch } from "../utils";
interface IStoryProviderProps {
};

interface IStoryHook {
    getAnim: (anim: string, options?: IEffectsOptions) => gsap.core.Timeline | undefined
    // initReady: (level: number) => void
    resumeStoryFromHint: (clickedId: string) => boolean
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: (level: number, tbs: RefObject<ITypingTextBoxHandle | null>[]) => void
    createUser: (nickname: string, password: string) => Promise<void>
    goBackwardHint: (clickedId: string) => void,
    goForwardHint: (clickedId: string) => void,
    setHeaderSearch: (ref: ISearchFieldHandle | null) => void,
    setChatHandle(ch: IChatHandle | undefined): Promise<void>;
    setLoginHandle(h: ILoginHandle | undefined): void;
    setTerminalHandle(h: ITerminalHandle | undefined): void;
    setVimHandle(h: IVimHandle | undefined): void;
    addMessageFromUser(content: string): Promise<void>
    getMessageBuffer(): IMessage[],
}
type StoryFuncsType = ReturnType<typeof useStoryFuncs>;
interface IStoryProvider extends IStoryHook {
    _getStoryHook: () => StoryFuncsType | undefined
}

const NAVIGATE_TO_PAGE: Record<string, (location: string[], targetLocation: string[], mismatchedLevel: number, searchField?: ISearchFieldHandle) => string[]> = {
    "user": (location, targetLocation, mismatchedLevel) => {
        if (location[1] == "post")
            return ["back-text"];
        if (mismatchedLevel == 3) {
            return [targetLocation[3] ?? "posts"];
        }
        return ["user-icon-text"];
    },
    "subforum": (location, targetLocation, mismatchedLevel, searchField) => {
        if (location[1] == "post")
            return ["back-text"];
        if (mismatchedLevel == 3) {
            return [targetLocation[3] ?? "posts"];
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
    "post": (location, targetLocation, _mismatchedLevel) => {
        if (location[1] == "post")
            return ["back-text"];
        return [targetLocation[2]];
    },
}

const NAV_HINT_FALLBACK = "You can't get back to the story flow, you will have to reload the page or quit game and log in again.";

export interface IEffectsOptions {
    typingBoxes?: RefObject<RefObject<ITypingTextBoxHandle | null>[]>,
    duration?: number,
    opacity?: number
    backgroundColor?: string
    overlayNumber?: string[]
    fromOpacity?: number,
    blurPx?: number
    zIndex?: number
    persistOverNavigation?: boolean
}

const EFFECTS_MAP: Record<string, (options?: IEffectsOptions, persistOverlayIds?: Set<string>) => gsap.core.Timeline> = {
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
    "COLOR_OVERLAY": (options, persistOverlayIds) => {
        return gsap.timeline()
            .fromTo(`#effectOverlay${options?.overlayNumber?.[0] ?? "1"}`,
                {
                    zIndex: options?.zIndex,
                    opacity: options?.fromOpacity ?? 0,
                    backgroundColor: options?.backgroundColor
                },
                {
                    duration: options?.duration,
                    opacity: options?.opacity,
                })
            .add(() => {
                if (options?.persistOverNavigation)
                    persistOverlayIds?.add(`effectOverlay${options?.overlayNumber?.[0] ?? "1"}`);
            })
    },
    "BLUR": (options, persistOverlayIds) => {
        return gsap.timeline()
            .set(`#effectOverlayBlur`, {
                zIndex: options?.zIndex,
                backdropFilter: `blur(${options?.blurPx}px)`,
                opacity: 0,
            })
            .to(`#effectOverlayBlur`,
                {
                    opacity: 1,
                    duration: options?.duration,
                })
            .add(() => {
                if (options?.persistOverNavigation)
                    persistOverlayIds?.add("effectOverlayBlur");
            })
    },
    "REVERSE_OVERLAY": (options, persistOverlayIds) => {
        return gsap.timeline()
            .add(() => {
                for (let v of options?.overlayNumber ?? [])
                    persistOverlayIds?.delete(`effectOverlay${v}`);
            }, 0)
            .to(options?.overlayNumber?.map((v) => `#effectOverlay${v}`).join(", ") ?? "", {
                backgroundColor: options?.backgroundColor,//for fade ins after login/logout, for some reason overlay loses color without it
                opacity: 0,
                duration: options?.duration
            })
    },
    "POSTS_FALL": () => {
        const elements = gsap.utils.toArray("#subforumContainer [data-fall]").reverse() as Element[];
        const tl = gsap.timeline();
        const duration = 1.5;
        const stagger = 1.5;
        elements.forEach((el, i) => {
            const start = i * stagger;
            tl.to(el, {
                y: window.innerHeight,
                rotateZ: gsap.utils.random(-25, 25),
                ease: "power2.in",
                duration,
                position: start,
            }, start);
            tl.set(el, { opacity: 0, visibility: "hidden" }, start + duration);
        });
        return tl;
    },
    "POSTS_RISE": (options) => {
        const elements = gsap.utils.toArray("#subforumContainer [data-fall]") as Element[];
        return gsap.timeline()
            .set(elements, {
                opacity: 1,
                visibility: "visible",
            })
            .to(elements, {
                y: 0,
                rotateZ: 0,
                ease: "power2.out",
                duration: options?.duration ?? 2,
            })
            .set(elements, {
                clearProps: "transform,opacity,visibility",
            });
    },
}


export function useElementHints() {
    const currIndex = useRef<number>(-1);//current index in path for chained nav
    const currHint = useRef<string[]>([]);//curr hint, length ==0 means it's not set
    const currStoryHint = useRef<string[]>([]);//current story hint used for caching the last story hint for recover on page function
    const headerSearch = useRef<ISearchFieldHandle>(null);
    const isStoryHint = useRef<boolean>(false);//is story hint currently hinting (for nav hint to trigger)
    const isLegitStoryHint = useRef<boolean>(true)//is story hint produced from hint action or artificially planted

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
        const navFunc = NAVIGATE_TO_PAGE[targetLocation[1]];
        if (!navFunc) {
            currHint.current = [];
            return;
        }
        currHint.current = navFunc(location, targetLocation, mismatchedLevel, headerSearch.current ?? undefined);
        currIndex.current = 0;
        bridge.exec(hint, currHint.current[currIndex.current]);
    }

    function goBackwardHint(clickedId: string) {
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

    const _getCurrHint = process.env.NODE_ENV == 'test' ? () => currHint : undefined;
    const _getCurrIndex = process.env.NODE_ENV == 'test' ? () => currIndex : undefined;
    const _getIsStoryHint = process.env.NODE_ENV == 'test' ? () => isStoryHint : undefined;
    const _getisLegitStoryHint = process.env.NODE_ENV == 'test' ? () => isLegitStoryHint : undefined;
    const _hint = process.env.NODE_ENV == 'test' ? hint : undefined;

    return { hintNavPath, goBackwardHint, goForwardHint, resetHint, setHeaderSearch, setStoryHint, reactivateStoryHint, resetStoryHint, removeCurrHint, getCurrentStoryHint, verifyStoryHint, _getCurrHint, _getCurrIndex, _hint, _getIsStoryHint, _getisLegitStoryHint };
}

export function useObjectiveHints() {
    const hintText = useRef<string>("");//cache of the latest objective hint (the "Current objective" text in the side menu) to restore on recovery on the target page
    const lastNavHint = useRef<string>("");//last navigation hint (from navigate false) to show in the side menu when the user navigates away from the target page

    function dispatchHint(text: string) {
        window.dispatchEvent(new CustomEvent<string>("storyHintText", { detail: text }));
    }

    function setObjectiveHint(text: string) {
        hintText.current = text;
    }

    function resetObjectiveHint() {
        hintText.current = "";
    }

    function restoreObjectiveHint() {
        dispatchHint(hintText.current);
    }

    function setNavHint(text: string) {
        lastNavHint.current = text;
    }

    function showNavHint() {
        dispatchHint(lastNavHint.current);
    }

    const _lastNavHint = process.env.NODE_ENV == 'test' ? () => lastNavHint : undefined;
    return { dispatchHint, setObjectiveHint, resetObjectiveHint, restoreObjectiveHint, setNavHint, showNavHint, _lastNavHint };
}

export interface IChatHandle {
    setStringToType: (string: string) => void;
    addTypingUser: (username: string) => void;
    removeTypingUser: (username: string) => void;
    addMessage: (message: IMessage) => void;
    getMessage: (id: number) => IMessage | undefined
    getId: () => string
}

export function useChat() {
    const messagesBuffer = useRef<IMessage[]>([]);
    const chatHandle = useRef<IChatHandle>(undefined);
    const userState = useUserState();
    const lastId = useRef<number>(0);
    const preserveMessagesBuffer = useRef<boolean>(false);

    async function addMessageFromUser(content: string) {
        const message: IMessage = {
            id: lastId.current++,
            from: userState.userLoggedIn.current,
            content: content,
            timeSent: new Date(),
            chatId: chatHandle.current?.getId() ?? ""
        }
        messagesBuffer.current.push(message);
        chatHandle.current?.addMessage(message);
    }

    async function addMessageFromNPC(from: string, content: string, timeToType?: number, isReplyDiff?: number) {
        const message: IMessage = {
            id: lastId.current++,
            from: from,
            content: content,
            timeSent: new Date(),
            chatId: chatHandle.current?.getId() ?? ""
        }
        message.isReply = isReplyDiff ? message.id + isReplyDiff : undefined;
        chatHandle.current?.addTypingUser(message.from);
        if (timeToType)
            await delay(timeToType);
        messagesBuffer.current.push(message);
        chatHandle.current?.removeTypingUser(message.from);
        chatHandle.current?.addMessage(message);
    }

    async function sinkMessages() {
        await db.storyMessages.bulkAdd(messagesBuffer.current);
        preserveMessagesBuffer.current = false;
        resetMessages();
    }

    async function addMessagesToDb(msgs: IMessage[]) {
        await db.storyMessages.bulkAdd(msgs);
    }

    async function setChatHandle(ch?: IChatHandle) {
        chatHandle.current = ch;
        lastId.current = await db.storyMessages.count() + messagesBuffer.current.length + 1;
    }

    function enablePreserveMessagesBuffer() {
        if (messagesBuffer.current.length == 0)
            return;
        preserveMessagesBuffer.current = true;
    }

    function resetMessages() {
        messagesBuffer.current = [];
    }

    function onNavigateAway() {
        if (preserveMessagesBuffer.current)
            return;
        resetMessages();
    }

    function promptMessage(content: string) {
        chatHandle.current?.setStringToType(content);
    }

    function getMessageBuffer() {
        return messagesBuffer.current;
    }

    return { addMessageFromNPC, addMessageFromUser, sinkMessages, setChatHandle, addMessagesToDb, promptMessage, enablePreserveMessagesBuffer, onNavigateAway, getMessageBuffer }
}

export interface ILoginHandle {
    setShowNicknamePlaceholder: (show: boolean) => void;
    setShowPasswordPlaceholder: (show: boolean) => void;
}

export function useLogin() {
    const loginHandle = useRef<ILoginHandle>(undefined);

    function setLoginHandle(handle?: ILoginHandle) {
        loginHandle.current = handle;
    }

    function setShowPlaceholders(field: IShowPlaceholderField, show: boolean) {
        if (field == "nickname")
            loginHandle.current?.setShowNicknamePlaceholder(show);
        else
            loginHandle.current?.setShowPasswordPlaceholder(show);
    }

    return { setLoginHandle, setShowPlaceholders };
}

export interface ITerminalHandle {
    setExpectedCommand: (command: string, output?: string) => void;
}

export function useTerminal() {
    const terminalHandle = useRef<ITerminalHandle>(undefined);

    function setTerminalHandle(handle?: ITerminalHandle) {
        terminalHandle.current = handle;
    }

    function setTerminalCommand(command: string, output?: string) {
        terminalHandle.current?.setExpectedCommand(command, output);
    }

    return { setTerminalHandle, setTerminalCommand };
}

export interface IVimHandle {
    setTextToType: (text: string) => void;
    setVimContent: (content: string) => void;
}

export function useVim() {
    const vimHandle = useRef<IVimHandle>(undefined);

    function setVimHandle(handle?: IVimHandle) {
        vimHandle.current = handle;
    }

    function setVimType(content: string) {
        vimHandle.current?.setTextToType(content);
    }

    function setVimContent(content: string) {
        vimHandle.current?.setVimContent(content);
    }

    return { setVimHandle, setVimType, setVimContent };
}

export function useStoryFuncs() {
    const typingBoxes = useRef<RefObject<ITypingTextBoxHandle | null>[]>([]);//boxes for showing text
    const isMounted = useRef<boolean>(true);//is provider mounted
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);//protection against strict mode
    const navigate = useNavigate();
    const masterRef = useRef<gsap.core.Timeline>(undefined);//timeline with the story (undefined if nothing is being played at the moment)
    const isStoryNavRef = useRef<boolean>(false);//flag for story navigation to protect from animation reset if navigation is made by the story and not user
    // const pageInitResolveRef = useRef<() => void>(undefined);//resolve for page
    const currStoryId = useRef<number>(1);//points at next action to continue after user pressed story hint
    const savedStoryId = useRef<number>(1);//points at save action to recover story from
    const pageStoryId = useRef<number>(1);//points at next action after page navigation to recover on page from
    const locationRef = useRef<IDestination>(undefined);//current location for the story
    const location = useLocation();
    const userState = useUserState();
    const isStoryRecovered = useRef<boolean>(false);//has story been recovered from target page yet  
    const persistedOverlayIds = useRef<Set<string>>(new Set());//overlays that survive navigation until REVERSE_OVERLAY
    const hintFunc = useElementHints();
    const objectiveHints = useObjectiveHints();
    const chatFunc = useChat();
    const loginFunc = useLogin();
    const terminalFunc = useTerminal();
    const vimFunc = useVim();

    // function initReady(level: number) {
    //     if (level != locationRef.current?.level)
    //         return;
    //     if (pageInitResolveRef.current)
    //         pageInitResolveRef.current();
    // }

    function isStoryGoing() {
        return masterRef.current != undefined;
    }

    const resetAnims = contextSafe(async () => {
        if (isStoryNavRef.current)
            return;
        if (locationRef.current && isOnLocation(locationRef.current)) {
            return;
        }
        chatFunc.onNavigateAway();
        hintFunc.resetHint();
        objectiveHints.showNavHint();
        if (isStoryRecovered.current) {
            currStoryId.current = savedStoryId.current + 1;
            isStoryRecovered.current = false;
        }
        if (masterRef.current) {
            masterRef.current.kill();
            masterRef.current = undefined;
            for (let tb of typingBoxes.current) {
                await tb.current?.reset();
            }
        }
        const resetSelectors = ["#container", "#textBox", "[data-istransition='true']", "#effectOverlay1", "#effectOverlay2", "#effectOverlay3", "#effectOverlayBlur", "#dissapear", "#appContainer", "#contentDiv"]
            .filter((sel) => !(sel.startsWith("#effectOverlay") && persistedOverlayIds.current.has(sel.slice(1))));
        gsap.set(resetSelectors.join(","), {
            clearProps: "all"
        })
        typingBoxes.current = [];
    });

    async function processAction(action: IAction, storyId: number) {
        if (action.navigateAction) {
            isStoryNavRef.current = true;
            isStoryRecovered.current = false;
            pageStoryId.current = storyId + 1;
            hintFunc.resetStoryHint();
            objectiveHints.resetObjectiveHint();
            chatFunc.enablePreserveMessagesBuffer();
            locationRef.current = action.navigateAction.dest;
            if (action.navigateAction.navigate) {
                navigate(action.navigateAction.dest?.where ?? "");
                if (action.navigateAction.dest?.level == 0)
                    window.dispatchEvent(new Event("signalLevel0"))
            }
            else {
                if (action.navigateAction.dest.from && !isOnLocation(action.navigateAction.dest.from))
                    hintFunc.hintNavPath(action.navigateAction.dest.from);
                hintFunc.hintNavPath(action.navigateAction.dest);
            }
            isStoryNavRef.current = false;
        }
        if (action.saveAction) {
            await db.users.where("savedStoryId").aboveOrEqual(1).modify({ savedStoryId: storyId });
            savedStoryId.current = storyId;
            pageStoryId.current = storyId + 1;
            chatFunc.sinkMessages();
        }
        if (action.hintAction) {
            hintFunc.setStoryHint(action.hintAction.ids)
        }
        if (action.setTextBoxStyleAction) {
            typingBoxes.current[action.setTextBoxStyleAction.id].current?.applyStyle(action.setTextBoxStyleAction.style);
        }
        if (action.sendMessageAction) {
            chatFunc.addMessageFromNPC(action.sendMessageAction.from, action.sendMessageAction.content, action.sendMessageAction.timeToType, action.sendMessageAction.isReplyDiff);
        }
        if (action.promptMessageAction) {
            hintFunc.setStoryHint(["chat-input", "chat-send"], false, false)
            chatFunc.promptMessage(action.promptMessageAction.content);
        }
        if (action.setShowPlaceholdersAction) {
            loginFunc.setShowPlaceholders(action.setShowPlaceholdersAction.field, action.setShowPlaceholdersAction.show);
        }
        if (action.setTerminalCommandAction) {
            hintFunc.setStoryHint(["terminal-input"], true, false);
            terminalFunc.setTerminalCommand(action.setTerminalCommandAction.command, action.setTerminalCommandAction.output);
        }
        if (action.vimTypeAction) {
            hintFunc.setStoryHint(["vim-input"], true, false);
            vimFunc.setVimType(action.vimTypeAction.content);
        }
        if (action.setVimContentAction) {
            vimFunc.setVimContent(action.setVimContentAction.content);
        }
    }

    function resumeStoryFromHint(clickedId: string): boolean {
        if (isStoryGoing() || hintFunc.getCurrentStoryHint() !== clickedId)
            return false;
        hintFunc.removeCurrHint();
        bridge.exec(showStory, currStoryId.current);
        return true;
    }

    async function recoverCheckpoint(id: number) {
        const scl = await sanitizeDbFetch(await db.story.get(id));
        if (!scl)
            return;
        savedStoryId.current = id;
        currStoryId.current = id + 1;
        pageStoryId.current = id + 1;
        locationRef.current = scl.action?.saveAction?.dest;
        if (scl.action?.saveAction?.hintActionPos) {
            let hintScl = await sanitizeDbFetch(await db.story.get(id + scl.action.saveAction.hintActionPos));
            hintFunc.setStoryHint(hintScl?.action?.hintAction?.ids ?? [], true);
        }
        if (scl.action?.saveAction?.lastNavPos != undefined) {
            let navScl = await sanitizeDbFetch(await db.story.get(id + scl.action.saveAction.lastNavPos));
            objectiveHints.setNavHint(navScl?.hint ?? NAV_HINT_FALLBACK);
        }
        if (scl.hint != undefined)
            objectiveHints.setObjectiveHint(scl.hint);
        if (locationRef.current && locationRef.current.level == 0)
            window.dispatchEvent(new Event("signalLevel0"))
        if (!locationRef.current) {
            console.error("No dest on checkpoint recovery.");
            navigate("/");
            return;
        }
        navigate(locationRef.current.from?.where ?? locationRef.current.where);
    }

    function isOnLocation(target: IDestination) {
        if (target.level > 0) {
            const location = (window.location.pathname + window.location.search).split('/').slice(0, target.level + 1).join('/');
            const targetLocation = target.where.split('/').slice(0, target.level + 1).join('/');
            return location === targetLocation;
        }
        return true;
    }

    function recoverStoryOnPage(level: number, tbs: RefObject<ITypingTextBoxHandle | null>[]) {
        if (!locationRef.current || !userState.isRealLoggedIn.current || isStoryRecovered.current)
            return;
        if (level != locationRef.current.level || !isOnLocation(locationRef.current)) {
            objectiveHints.showNavHint();
            if (locationRef.current.from && !isOnLocation(locationRef.current.from)) {
                hintFunc.hintNavPath(locationRef.current.from);
            }
            hintFunc.hintNavPath(locationRef.current);
            return;
        }
        hintFunc.resetHint();
        objectiveHints.restoreObjectiveHint();
        isStoryRecovered.current = true;
        typingBoxes.current = tbs;
        if (hintFunc.verifyStoryHint()) {
            hintFunc.reactivateStoryHint();
            return;
        }
        bridge.exec(showStory, pageStoryId.current);
    }

    async function customizeStory(nickname: string) {
        const users = await db.users.where("savedStoryId").aboveOrEqual(0).toArray();
        const regex = new RegExp(`#${users[0].nickname}`, 'g');
        nickname = `#${nickname}`
        await db.story.toCollection().modify((scl) => {
            const sclString = JSON.stringify(scl);
            if (!regex.test(sclString)) {
                return false;
            }
            Object.assign(scl, JSON.parse(sclString.replace(regex, nickname)));
        });
        await db.posts.toCollection().modify((post) => {
            const postString = JSON.stringify(post);
            if (!regex.test(postString)) {
                return false;
            }
            Object.assign(post, JSON.parse(postString.replace(regex, nickname)));
        });
        await db.chats.toCollection().modify((chat) => {
            const chatString = JSON.stringify(chat);
            if (!regex.test(chatString)) {
                return false;
            }
            Object.assign(chat, JSON.parse(chatString.replace(regex, nickname)));
        });
        await db.subforums.toCollection().modify((subforum) => {
            const subforumString = JSON.stringify(subforum);
            if (!regex.test(subforumString)) {
                return false;
            }
            Object.assign(subforum, JSON.parse(subforumString.replace(regex, nickname)));
        });
    }

    async function addScriptlineToTimeline(scl: IScriptLine, tl: gsap.core.Timeline) {
        scl = await sanitizeDbFetch(scl);
        if (scl.storyline) {
            const stl = scl.storyline;
            if (stl.typingBoxId >= typingBoxes.current.length) {
                console.error(`No ref assigned for index ${stl.typingBoxId}.`)
                return;
            }
            const box = typingBoxes.current[stl.typingBoxId].current;
            if (!box) {
                console.error(`No ref assigned for index ${stl.typingBoxId}.`)
                return;
            }
            tl.add(box.getTimeline({
                content: stl.content,
                speed: stl.speed,
                delim: stl.delim,
                clearAfter: stl.clearAfter,
                hideCursorAfter: stl.hideCursorAfter
            }), scl.offset);
        }

        if (scl.effect) {
            const anim = getAnim(scl.effect.name, { ...scl.effect.options, typingBoxes: typingBoxes });
            if (!anim)
                return;
            tl.add(anim, scl.offset);
        }

        if (scl.action) {
            const action = scl.action;
            const saveId = scl.id;
            tl.add(() => {
                tl.pause();
                processAction(action, saveId).then(() => {
                    if (action.navigateAction?.navigate)
                        tl.progress(1);
                    else
                        tl.resume();
                });
            }, scl.offset);
        }

        if (scl.addParallelExec) {
            tl.addLabel(scl.addParallelExec.name);
            const branches = scl.addParallelExec.branches;
            for (let i = 0; i < branches.length; i++) {
                const branch = gsap.timeline();
                for (let action of branches[i]) {
                    await addScriptlineToTimeline(action, branch);
                }
                tl.add(branch, `${scl.addParallelExec.name}+=0`);
            }
        }

        if (scl.clearTypingTextBoxes) {
            for (let id of scl.clearTypingTextBoxes.ids) {
                if (!typingBoxes.current[id].current)
                    continue;
                tl.add(typingBoxes.current[id].current.reset(), scl.offset);
            }
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
        let navPending = false;
        let navHint:string|undefined = undefined;
        objectiveHints.dispatchHint("");
        while ((!scl || !scl.isActionAwait) && !scl?.action?.navigateAction?.navigate) {
            scl = await db.story.get(id);
            if (!isMounted.current || ticket != loopTicket.current)
                return;
            id++;
            if (!scl)
                break;
            await addScriptlineToTimeline(scl, master);
            if (scl.action?.navigateAction) {
                navPending = true;
                navHint = scl.hint;
            }
        }
        if (!isMounted.current || ticket != loopTicket.current)
            return;
        masterRef.current = master;
        console.log("play anim")
        master.play();
        await master;
        if (!isMounted.current || ticket != loopTicket.current || masterRef.current !== master)
        {
            console.log("interrupted")
            return;
        }
        currStoryId.current = id;
        masterRef.current = undefined;
        if (navPending) {
            objectiveHints.setNavHint(navHint ?? NAV_HINT_FALLBACK);
            objectiveHints.showNavHint();
        } else {
            objectiveHints.setObjectiveHint(scl?.hint ?? "");
            objectiveHints.dispatchHint(scl?.hint ?? "");
        }
    });

    const getAnim = contextSafe((anim: string, options?: IEffectsOptions) => {
        if (!EFFECTS_MAP[anim]) {
            console.error(`No anim called ${anim}`);
            return;
        }
        return EFFECTS_MAP[anim](options, persistedOverlayIds.current);
    })

    async function createUser(nickname: string, password: string) {
        await bridge.exec(customizeStory, nickname);
        await db.users.where("savedStoryId").aboveOrEqual(0).modify({ nickname: nickname, password: password, savedStoryId: 153 });//1 is orig
        await db.storyMessages.clear();
        const createdAt = new Date();
        let chats = await sanitizeDbFetch(await db.chats.toArray());
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
                    chatId: chat.id,
                    isReply: chat.pregenMessages[i].isReply
                }
                msg.timeSent.setMinutes(msg.timeSent.getMinutes() + chat.pregenMessages[i].timeDiff);
                msgs.push(msg);
            }
            chatFunc.addMessagesToDb(msgs);
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

    const _resetAnims = process.env.NODE_ENV == 'test' ? resetAnims : undefined;
    const _processAction = process.env.NODE_ENV == 'test' ? processAction : undefined;
    const _getIsStoryNavRef = process.env.NODE_ENV == 'test' ? () => isStoryNavRef : undefined;
    const _getLocationRef = process.env.NODE_ENV == 'test' ? () => locationRef : undefined;
    const _getTypingBoxes = process.env.NODE_ENV == 'test' ? () => typingBoxes : undefined;
    const _getHintHook = process.env.NODE_ENV == 'test' ? () => hintFunc : undefined;
    const _getObjectiveHintsHook = process.env.NODE_ENV == 'test' ? () => objectiveHints : undefined;
    const _getChatHook = process.env.NODE_ENV == 'test' ? () => chatFunc : undefined;
    const _getIsStoryRecovered = process.env.NODE_ENV == 'test' ? () => isStoryRecovered : undefined;
    const _getCurrStoryId = process.env.NODE_ENV == 'test' ? () => currStoryId : undefined;
    const _getSavedStoryId = process.env.NODE_ENV == 'test' ? () => savedStoryId : undefined;
    const _getMasterRef = process.env.NODE_ENV == 'test' ? () => masterRef : undefined;
    const _getPageStoryIdRef = process.env.NODE_ENV == 'test' ? () => pageStoryId : undefined;
    // const _getPageInitResolveRef = process.env.NODE_ENV == 'test' ? () => pageInitResolveRef : undefined;
    const _showStory = process.env.NODE_ENV == 'test' ? showStory : undefined;
    const _customizeStory = process.env.NODE_ENV == 'test' ? customizeStory : undefined;
    const _isOnLocation = process.env.NODE_ENV == 'test' ? isOnLocation : undefined;

    return {
        // setTypingBoxes,
        getAnim,
        // initReady,
        resumeStoryFromHint,
        recoverCheckpoint,
        createUser,
        recoverStoryOnPage,
        getMessageBuffer: chatFunc.getMessageBuffer,
        addMessageFromUser: chatFunc.addMessageFromUser,
        setChatHandle: chatFunc.setChatHandle,
        setLoginHandle: loginFunc.setLoginHandle,
        setTerminalHandle: terminalFunc.setTerminalHandle,
        setVimHandle: vimFunc.setVimHandle,
        goBackwardHint: hintFunc.goBackwardHint,
        goForwardHint: hintFunc.goForwardHint,
        setHeaderSearch: hintFunc.setHeaderSearch,
        _resetAnims,
        _processAction,
        _getIsStoryNavRef,
        _getLocationRef,
        _getLastNavHint: objectiveHints._lastNavHint,
        _getTypingBoxes,
        _getChatHook,
        _getHintHook,
        _getObjectiveHintsHook,
        _getIsStoryRecovered,
        _getCurrStoryId,
        _getSavedStoryId,
        _getMasterRef,
        _getPageStoryIdRef,
        // _getPageInitResolveRef,
        _showStory,
        _customizeStory,
        _isOnLocation
    }
}

const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const storyFunc = useStoryFuncs();

    return (
        <StoryContext.Provider value={{
            ...storyFunc, _getStoryHook() {
                return storyFunc;
            },
        }}>
            <EffectOverlay id="effectOverlay1" />
            <EffectOverlay id="effectOverlayBlur" />
            <EffectOverlay id="effectOverlay2" />
            <EffectOverlay id="effectOverlay3" />
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
        // bridge.exec(story.initReady, childLevel);
        bridge.exec(story.recoverStoryOnPage, childLevel, typingBoxes);
    }

    return storyInit;
}