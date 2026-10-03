import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type RefObject, createContext, useContext } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, seedTables, type IAction, type IChat, type IDestination, type IHistoryEntry, type IMessage, type IScriptLine, type IShowPlaceholderField } from "../backend/db";
import gsap from 'gsap';
import { Outlet, useLocation, useNavigate } from "react-router";
import type { FC } from "react";
import { EffectOverlay } from "../components/EffectOverlay";
import styles from "../scss/storyProvider.module.scss";
import { useUserState } from "./UserAuth";
import type { ISearchFieldHandle } from "../components/SearchField";
import { bridge, delay } from "../utils";
interface IStoryProviderProps {
};

interface IStoryHook {
    getAnim: (anim: string, options?: IEffectsOptions) => gsap.core.Timeline | undefined
    // initReady: (level: number) => void
    resumeStoryFromHint: (clickedId: string) => boolean
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: (level: number, tbs: Map<string, ITypingTextBoxHandle>) => void
    createUser: (nickname: string, password: string) => Promise<void>
    goBackwardHint: (clickedId: string) => void,
    goForwardHint: (clickedId: string) => void,
    setHeaderSearch: (ref: ISearchFieldHandle | null) => void,
    setChatHandle(ch: IChatHandle | undefined): Promise<void>;
    setLoginHandle(h: ILoginHandle | undefined): void;
    setTerminalHandle(h: ITerminalHandle | undefined): void;
    setVimHandle(h: IVimHandle | undefined): void;
    addMessageFromUser(content: string): Promise<void>
    getMessages(chatId: string): Promise<IMessage[]>,
}
type StoryFuncsType = ReturnType<typeof useStoryFuncs>;
interface IStoryProvider extends IStoryHook {
    _getStoryHook: () => StoryFuncsType | undefined
}

interface INavHintContext {
    location: string[];
    targetLocation: string[];
    mismatchedLevel: number;
    userLoggedIn: string;
    searchField?: ISearchFieldHandle;
}

const NAVIGATE_TO_PAGE: Record<string, (ctx: INavHintContext) => string[]> = {
    "user": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        if (ctx.mismatchedLevel == 3) {
            return [ctx.targetLocation[3] ?? "posts"];
        }
        if (ctx.userLoggedIn == ctx.targetLocation[2])
            return ["user-icon-text"];
        ctx.searchField?.setSuggestionHint(`u/${ctx.targetLocation[2]}`);
        return ["header-search", ""];
    },
    "subforum": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        if (ctx.mismatchedLevel == 3) {
            return [ctx.targetLocation[3] ?? "posts"];
        }
        ctx.searchField?.setSuggestionHint(`f/${ctx.targetLocation[2]}`);
        return ["header-search", ""];
    },
    "chat": (ctx) => {
        if (ctx.mismatchedLevel == 2) {
            if (ctx.location.length >= 3)
                return ["back-text"];
            return [ctx.targetLocation[2]];
        }
        return ["menu-icon-text", "chat-menu"];
    },
    "post": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        return [ctx.targetLocation[2]];
    },
}

const NAV_HINT_FALLBACK = "You can't get back to the story flow, you will have to reload the page or quit game and log in again.";

export interface IEffectsOptions {
    typingBoxes?: RefObject<Map<string, ITypingTextBoxHandle>>,
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
            .add(() => (options?.typingBoxes?.current.get("nar1")?.setCursorType("terminal")))
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
    const userState = useUserState();

    function setHeaderSearch(ref: ISearchFieldHandle | null) {
        headerSearch.current = ref;
    }

    function hint(id: string) {
        if (id == "")
            return;
        const els = document.querySelectorAll(`#${id}`);
        if (els.length == 0) {
            console.error(`No element with id ${id}`)
            return;
        }
        const hintClass = id.includes("text") ? styles.hintText : styles.hint;
        els.forEach((el) => el.classList.add(hintClass));
    }

    function goForwardHint(clickedId: string) {
        if (currHint.current.length > 1 && clickedId == currHint.current[currIndex.current]) {
            removeCurrHint();
            hint(currHint.current[++currIndex.current]);
        }
    }

    function setStoryHint(hints: string[], dontActivate?: boolean) {
        currHint.current = hints;
        currStoryHint.current = hints;
        currIndex.current = 0;
        if (!dontActivate) {
            isStoryHint.current = true;
            hint(hints[0]);
        }
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
        const hintClass = id.includes("text") ? styles.hintText : styles.hint;
        document.querySelectorAll(`#${id}`).forEach((el) => el.classList.remove(hintClass));
    }

    function getCurrentStoryHint() {
        if (currStoryHint.current.length == 0)
            return "";
        return currStoryHint.current[currIndex.current];
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
        currHint.current = navFunc({
            location,
            targetLocation,
            mismatchedLevel,
            userLoggedIn: userState.userLoggedIn.current,
            searchField: headerSearch.current ?? undefined
        });
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
    const _hint = process.env.NODE_ENV == 'test' ? hint : undefined;

    return { hintNavPath, goBackwardHint, goForwardHint, resetHint, setHeaderSearch, setStoryHint, reactivateStoryHint, resetStoryHint, removeCurrHint, getCurrentStoryHint, _getCurrHint, _getCurrIndex, _hint, _getIsStoryHint };
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

export function useBuffers() {
    const preserveBuffers = useRef<boolean>(false);

    async function enablePreserveBuffers() {
        const counts = await Promise.all([db.postsBuffer.count(), db.chatsBuffer.count(), db.usersBuffer.count(), db.storyMessagesBuffer.count()]);
        if (counts.every((c) => c == 0))
            return;
        preserveBuffers.current = true;
    }

    async function resetBuffers() {
        await Promise.all([db.postsBuffer.clear(), db.chatsBuffer.clear(), db.usersBuffer.clear(), db.storyMessagesBuffer.clear()]);
    }

    async function sinkBuffers() {
        await db.posts.bulkPut(await db.postsBuffer.toArray());
        await db.chats.bulkPut(await db.chatsBuffer.toArray());
        await db.users.bulkPut(await db.usersBuffer.toArray());
        await db.storyMessages.bulkPut(await db.storyMessagesBuffer.toArray());
        await resetBuffers();
        preserveBuffers.current = false;
    }

    async function onNavigateAway() {
        if (preserveBuffers.current)
            return;
        await resetBuffers();
    }

    return { enablePreserveBuffers, resetBuffers, sinkBuffers, onNavigateAway };
}

export function useChat() {
    const chatHandle = useRef<IChatHandle>(undefined);
    const userState = useUserState();
    const lastId = useRef<number>(0);

    async function addChat(id: string, owner: string[], type: IChat["type"]) {
        const chat: IChat = {
            id: id,
            owner: owner,
            type: type,
            pregenMessages: [],
            isRead: true,
            initTimeDiff: 0,
        }
        await db.chatsBuffer.put(chat);
    }

    async function addMessageFromUser(content: string) {
        const message: IMessage = {
            id: lastId.current++,
            from: userState.userLoggedIn.current,
            content: content,
            timeSent: new Date(),
            chatId: chatHandle.current?.getId() ?? ""
        }
        await db.storyMessagesBuffer.put(message);
        chatHandle.current?.addMessage(message);
    }

    async function addMessageFromNPC(from: string, content: string, timeToType?: number, isReplyDiff?: number) {
        const message: IMessage = {
            id: lastId.current++,
            from: from,
            content: content,
            chatId: chatHandle.current?.getId() ?? "",
            timeSent: new Date()
        }
        message.isReply = isReplyDiff ? message.id + isReplyDiff : undefined;
        chatHandle.current?.addTypingUser(message.from);
        if (timeToType)
            await delay(timeToType);
        message.timeSent=new Date();
        await db.storyMessagesBuffer.put(message);
        chatHandle.current?.removeTypingUser(message.from);
        chatHandle.current?.addMessage(message);
    }

    async function addMessagesToDb(msgs: IMessage[]) {
        await db.storyMessages.bulkAdd(msgs);
    }

    async function setChatHandle(ch?: IChatHandle) {
        chatHandle.current = ch;
        lastId.current = await db.storyMessages.count() + await db.storyMessagesBuffer.count() + 1;
    }

    async function getMessages(chatId: string) {
        const messages = await db.storyMessages.where("chatId").equals(chatId).toArray();
        const bufferedMessages = await db.storyMessagesBuffer.where("chatId").equals(chatId).toArray();
        return [...messages, ...bufferedMessages];
    }

    function promptMessage(content: string) {
        chatHandle.current?.setStringToType(content);
    }

    return { addMessageFromNPC, addMessageFromUser, addChat, setChatHandle, addMessagesToDb, getMessages, promptMessage }
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
    addHistory: (history: IHistoryEntry[]) => void;
    setPromptVisible: (visible: boolean) => void;
}

export function useTerminal() {
    const terminalHandle = useRef<ITerminalHandle>(undefined);

    function setTerminalHandle(handle?: ITerminalHandle) {
        terminalHandle.current = handle;
    }

    function setTerminalCommand(command: string, output?: string) {
        terminalHandle.current?.setExpectedCommand(command, output);
    }

    function addTerminalHistory(history: IHistoryEntry[]) {
        terminalHandle.current?.addHistory(history);
    }

    function setPromptVisibility(visible: boolean) {
        terminalHandle.current?.setPromptVisible(visible);
    }

    return { setTerminalHandle, setTerminalCommand, addTerminalHistory, setPromptVisibility };
}

export interface IVimHandle {
    setTextToType: (text: string) => void;
}

export function useVim() {
    const vimHandle = useRef<IVimHandle>(undefined);

    function setVimHandle(handle?: IVimHandle) {
        vimHandle.current = handle;
    }

    function setVimType(content: string) {
        vimHandle.current?.setTextToType(content);
    }

    return { setVimHandle, setVimType };
}

export function useStoryFuncs() {
    const typingBoxes = useRef<Map<string, ITypingTextBoxHandle>>(new Map());//boxes for showing text
    const isMounted = useRef<boolean>(true);//is provider mounted
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);//protection against strict mode
    const navigate = useNavigate();
    const masterRef = useRef<gsap.core.Timeline>(undefined);//timeline with the story (undefined if nothing is being played at the moment)
    const isStoryNavRef = useRef<boolean>(false);//flag for story navigation to protect from animation reset if navigation is made by the story and not user
    const currStoryId = useRef<number>(1);//points at next action to continue after user pressed story hint
    const savedStoryId = useRef<number>(1);//points at save action to recover story from
    const pageStoryId = useRef<number>(1);//points at next action after page navigation or save to recover on page from
    const locationRef = useRef<IDestination>(undefined);//current location for the story
    const location = useLocation();
    const userState = useUserState();
    const isStoryRecovered = useRef<boolean>(false);//has story been recovered from target page yet  
    const persistedOverlayIds = useRef<Set<string>>(new Set());//overlays that survive navigation until REVERSE_OVERLAY
    const hintFunc = useElementHints();
    const objectiveHints = useObjectiveHints();
    const bufferFunc = useBuffers();
    const chatFunc = useChat();
    const loginFunc = useLogin();
    const terminalFunc = useTerminal();
    const vimFunc = useVim();

    function isStoryGoing() {
        return masterRef.current != undefined;
    }

    const resetAnims = contextSafe(async () => {
        if (isStoryNavRef.current)
            return;
        if (locationRef.current && isOnLocation(locationRef.current)) {
            return;
        }
        hintFunc.resetHint();
        objectiveHints.showNavHint();
        if (isStoryRecovered.current) {
            currStoryId.current = pageStoryId.current;
            isStoryRecovered.current = false;
        }
        if (masterRef.current) {
            masterRef.current.kill();
            masterRef.current = undefined;
            for (let tb of typingBoxes.current.values()) {
                await tb.reset();
            }
        }
        const resetSelectors = ["#container", "#textBox", "[data-istransition='true']", "#effectOverlay1", "#effectOverlay2", "#effectOverlay3", "#effectOverlayBlur", "#dissapear", "#appContainer", "#contentDiv"]
            .filter((sel) => !(sel.startsWith("#effectOverlay") && persistedOverlayIds.current.has(sel.slice(1))));
        gsap.set(resetSelectors.join(","), {
            clearProps: "all"
        })
        typingBoxes.current = new Map(); 
        await bufferFunc.onNavigateAway();
    });

    async function processAction(action: IAction, storyId: number) {
        if (action.navigateAction) {
            await bufferFunc.enablePreserveBuffers();
            isStoryNavRef.current = true;
            isStoryRecovered.current = false;
            pageStoryId.current = storyId + 1;
            hintFunc.resetStoryHint();
            objectiveHints.resetObjectiveHint();
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
            await bufferFunc.sinkBuffers();
        }
        if (action.hintAction) {
            hintFunc.setStoryHint(action.hintAction.ids)
        }
        if (action.setTextBoxStyleAction) {
            typingBoxes.current.get(action.setTextBoxStyleAction.id)?.applyStyle(action.setTextBoxStyleAction.style);
        }
        if (action.sendMessageAction) {
            chatFunc.addMessageFromNPC(action.sendMessageAction.from, action.sendMessageAction.content, action.sendMessageAction.timeToType, action.sendMessageAction.isReplyDiff);
        }
        if (action.addNewChat) {
            await chatFunc.addChat(action.addNewChat.id, action.addNewChat.owner, action.addNewChat.type);
        }
        if (action.promptMessageAction) {
            hintFunc.setStoryHint(["chat-input", "chat-send"], false)
            const { content, isLink } = action.promptMessageAction;
            chatFunc.promptMessage(isLink ? window.location.origin + content : content);
        }
        if (action.setShowPlaceholdersAction) {
            loginFunc.setShowPlaceholders(action.setShowPlaceholdersAction.field, action.setShowPlaceholdersAction.show);
        }
        if (action.setTerminalCommandAction) {
            hintFunc.setStoryHint(["terminal-input"], true);
            terminalFunc.setTerminalCommand(action.setTerminalCommandAction.command, action.setTerminalCommandAction.output);
        }
        if (action.addTerminalHistoryAction) {
            terminalFunc.addTerminalHistory(action.addTerminalHistoryAction.history);
        }
        if (action.setPromptVisibilityAction) {
            terminalFunc.setPromptVisibility(action.setPromptVisibilityAction.visible);
        }
        if (action.vimTypeAction) {
            hintFunc.setStoryHint(["vim-input"], true);
            vimFunc.setVimType(action.vimTypeAction.content);
        }
        if (action.setTypingBoxContentAction) {
            typingBoxes.current.get(action.setTypingBoxContentAction.typingBoxId)?.setContent(action.setTypingBoxContentAction.content);
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
        const scl = await db.story.get(id);
        if (!scl)
            return;
        savedStoryId.current = id;
        currStoryId.current = id + 1;
        pageStoryId.current = id + 1;
        locationRef.current = scl.action?.saveAction?.dest;
        if (scl.action?.saveAction?.lastNavPos != undefined) {
            let navScl = await db.story.get(id + scl.action.saveAction.lastNavPos);
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

    function recoverStoryOnPage(level: number, tbs: Map<string, ITypingTextBoxHandle>) {
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
        bridge.exec(showStory, pageStoryId.current);
    }

    async function customizeStory(nickname: string) {
        await seedTables(nickname);
    }

    function addScriptlineToTimeline(scl: IScriptLine, tl: gsap.core.Timeline) {
        console.log("adding", scl);
        if (scl.storyline) {
            const stl = scl.storyline;
            const box = typingBoxes.current.get(stl.typingBoxId);
            if (!box) {
                console.error(`No ref assigned for id ${stl.typingBoxId}.`)
                return;
            }
            tl.add(box.getTypingTimeline({
                content: stl.content,
                speed: stl.speed,
                delim: stl.delim,
                clearAfter: stl.clearAfter,
                hideCursorAfter: stl.hideCursorAfter,
                clearBefore: stl.clearBefore
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
                    addScriptlineToTimeline(action, branch);
                }
                tl.add(branch, `${scl.addParallelExec.name}+=0`);
            }
        }

        if (scl.deleteTextFromTypingBox) {
            const box = typingBoxes.current.get(scl.deleteTextFromTypingBox.typingBoxId);
            if (box)
                tl.add(box.getDeleteTimeline({
                    symbolsCount: scl.deleteTextFromTypingBox.symbolsCount,
                    speed: scl.deleteTextFromTypingBox.speed
                }), scl.offset);
        }

        if (scl.clearTypingTextBoxes) {
            for (let id of scl.clearTypingTextBoxes.ids) {
                const box = typingBoxes.current.get(id);
                if (!box)
                    continue;
                tl.add(box.reset(), scl.offset);
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
        let navHint: string | undefined = undefined;
        objectiveHints.dispatchHint("");
        while ((!scl || !scl.isActionAwait) && !scl?.action?.navigateAction?.navigate) {
            scl = await db.story.get(id);
            if (!isMounted.current || ticket != loopTicket.current)
                return;
            id++;
            if (!scl)
                break;
            addScriptlineToTimeline(scl, master);
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
        if (!isMounted.current || ticket != loopTicket.current || masterRef.current !== master) {
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
        await db.users.where("savedStoryId").aboveOrEqual(0).modify({ password: password, savedStoryId: 216 });//1 is orig
        await db.storyMessages.clear();
        const createdAt = new Date();
        let chats = await db.chats.toArray();
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
    const _getBuffersHook = process.env.NODE_ENV == 'test' ? () => bufferFunc : undefined;
    const _getIsStoryRecovered = process.env.NODE_ENV == 'test' ? () => isStoryRecovered : undefined;
    const _getCurrStoryId = process.env.NODE_ENV == 'test' ? () => currStoryId : undefined;
    const _getSavedStoryId = process.env.NODE_ENV == 'test' ? () => savedStoryId : undefined;
    const _getMasterRef = process.env.NODE_ENV == 'test' ? () => masterRef : undefined;
    const _getPageStoryIdRef = process.env.NODE_ENV == 'test' ? () => pageStoryId : undefined;
    const _showStory = process.env.NODE_ENV == 'test' ? showStory : undefined;
    const _customizeStory = process.env.NODE_ENV == 'test' ? customizeStory : undefined;
    const _isOnLocation = process.env.NODE_ENV == 'test' ? isOnLocation : undefined;

    return {
        getAnim,
        resumeStoryFromHint,
        recoverCheckpoint,
        createUser,
        recoverStoryOnPage,
        getMessages: chatFunc.getMessages,
        resetBuffers: bufferFunc.resetBuffers,
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
        _getBuffersHook,
        _getHintHook,
        _getObjectiveHintsHook,
        _getIsStoryRecovered,
        _getCurrStoryId,
        _getSavedStoryId,
        _getMasterRef,
        _getPageStoryIdRef,
        _showStory,
        _customizeStory,
        _isOnLocation
    }
}

const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const storyFunc = useStoryFuncs();

    useEffect(() => {
        storyFunc.resetBuffers();
    }, []);

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

    async function storyInit(childLevel: number, typingBoxes: Map<string, ITypingTextBoxHandle>, pageInit?: () => Promise<void> | void) {
        loopTicket.current++;
        const ticket = loopTicket.current;
        if (pageInit)
            await pageInit();
        if (ticket != loopTicket.current)
            return;
        bridge.exec(story.recoverStoryOnPage, childLevel, typingBoxes);
    }

    return storyInit;
}