import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLocation, useNavigate } from "react-router";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, mapPosts, seedTables, type IAction, type IDestination, type IEffectsOptions, type IMessage, type IScriptLine } from "../misc/db";
import { bridge } from "../misc/utils";
import { useUserState } from "../providers/UserAuth";
import { useBuffers } from "./useBuffers";
import { useChat } from "./useChat";
import { useElementHints } from "./useElementHints";
import { useLocale } from "./useLocale";
import { useLogin } from "./useLogin";
import { useObjectiveHints } from "./useObjectiveHints";
import { useSubforumSettings } from "./useSubforumSettings";
import { useTerminal } from "./useTerminal";
import { useVim } from "./useVim";

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
                fontFamily: 'var(--terminal-font)'
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
        const tl = gsap.timeline();
        if (options?.duration == 0)
            tl.set(`#effectOverlay${options?.overlayNumber?.[0] ?? "1"}`, {
                zIndex: options?.zIndex,
                backgroundColor: options?.backgroundColor,
                opacity: options?.opacity ?? 1,
            })
        else
            tl.set(`#effectOverlay${options?.overlayNumber?.[0] ?? "1"}`,
                {
                    zIndex: options?.zIndex,
                    opacity: options?.fromOpacity ?? 0,
                    backgroundColor: options?.backgroundColor
                })
                .to(`#effectOverlay${options?.overlayNumber?.[0] ?? "1"}`,
                    {
                        backgroundColor: options?.backgroundColor,
                        duration: options?.duration,
                        opacity: options?.opacity ?? 1,
                    })

        tl.add(() => {
            if (options?.persistOverNavigation)
                persistOverlayIds?.add(`#effectOverlay${options?.overlayNumber?.[0] ?? "1"}`);
        })
        return tl;
    },
    "BLUR": (options, persistOverlayIds) => {
        const tl = gsap.timeline();
        if (options?.duration == 0)
            tl.set(`#effectOverlayBlur`, {
                zIndex: options?.zIndex,
                backdropFilter: `blur(${options?.blurPx}px)`,
                opacity: 1,
            })
        else
            tl.fromTo(`#effectOverlayBlur`, {
                zIndex: options?.zIndex,
                backdropFilter: `blur(${options?.blurPx}px)`,
                opacity: 0,
            },
                {
                    opacity: 1,
                    duration: options?.duration,
                })

        tl.add(() => {
            if (options?.persistOverNavigation)
                persistOverlayIds?.add("#effectOverlayBlur");
        })
        return tl;
    },
    "REVERSE_OVERLAY": (options, persistOverlayIds) => {
        const tl = gsap.timeline().add(() => {
            for (let v of options?.overlayNumber ?? [])
                persistOverlayIds?.delete(`#effectOverlay${v}`);
        }, 0)
        if (options?.duration == 0)
            tl.set(options?.overlayNumber?.map((v) => `#effectOverlay${v}`).join(", ") ?? "",
                {
                    opacity: 0,
                });
        else
            tl.to(options?.overlayNumber?.map((v) => `#effectOverlay${v}`).join(", ") ?? "",
                {
                    backgroundColor: options?.backgroundColor, //for manual fade ins
                    opacity: 0,
                    duration: options?.duration
                })
        return tl;
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

export function useStoryFuncs() {
    const typingBoxes = useRef<Map<string, ITypingTextBoxHandle>>(new Map());//boxes for showing text
    const isMounted = useRef<boolean>(true);//is provider mounted
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);//protection against strict mode
    const navigate = useNavigate();
    const masterRef = useRef<gsap.core.Timeline>(undefined);//timeline with the story (undefined if nothing is being played at the moment)
    const currStoryId = useRef<number>(1);//points at next action to continue after user pressed story hint
    const savedStoryId = useRef<number>(1);//points at save action to recover story from
    const pageStoryId = useRef<number>(1);//points at next action after page navigation or save to recover on page from
    const locationRef = useRef<IDestination>(undefined);//current location for the story
    const location = useLocation();
    const userState = useUserState();
    const { t, locale, setLocale } = useLocale();
    const isStoryRecovered = useRef<boolean>(false);//has story been recovered from target page yet  
    const persistedOverlayIds = useRef<Set<string>>(new Set());//overlays that survive navigation until REVERSE_OVERLAY
    const lastExecutedPath = useRef<string>(undefined);//path resetAnims has already been executed for
    const hintFunc = useElementHints();
    const objectiveHints = useObjectiveHints();
    const bufferFunc = useBuffers();
    const chatFunc = useChat();
    const loginFunc = useLogin();
    const terminalFunc = useTerminal();
    const vimFunc = useVim();
    const subforumSettingsFunc = useSubforumSettings();

    function isStoryGoing() {
        return masterRef.current != undefined;
    }

    const resetAnims = contextSafe(async () => {
        if (lastExecutedPath.current === location.pathname)
            return;
        lastExecutedPath.current = location.pathname;
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
        typingBoxes.current = new Map();
        await bufferFunc.onNavigateAway();
        const resetSelectors = ["#container", "#textBox", "[data-istransition='true']", "#effectOverlay1", "#effectOverlay2", "#effectOverlay3", "#effectOverlayBlur", "#dissapear", "#appContainer", "#contentDiv"]
            .filter((sel) => !persistedOverlayIds.current.has(sel));
        await gsap.set(resetSelectors.join(","), {
            clearProps: "all"
        })
    });

    async function processAction(action: IAction, storyId: number) {
        if (action.navigateAction) {
            await bufferFunc.enablePreserveBuffers();
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
        if (action.sendMessageAction) {
            chatFunc.addMessageFromNPC(action.sendMessageAction.from, action.sendMessageAction.content, action.sendMessageAction.timeToType, action.sendMessageAction.isReplyDiff);
        }
        if (action.addNewChat) {
            await chatFunc.addChat(action.addNewChat.id, action.addNewChat.owner, action.addNewChat.type);
        }
        if (action.addPosts) {
            const existing = [...(await db.postsBuffer.toArray()), ...(await db.posts.toArray())];
            await db.postsBuffer.bulkPut(mapPosts(action.addPosts.posts, existing.length + 1));
        }
        if (action.addPasswordFor) {
            const { nickname, password } = action.addPasswordFor;
            const user = await db.usersBuffer.where("nickname").equals(nickname).first()
                ?? await db.users.where("nickname").equals(nickname).first();
            if (user)
                await db.usersBuffer.put({ ...user, password: password });
        }
        if (action.banUser) {
            const { nickname } = action.banUser;
            const buffered = await db.usersBuffer.where("nickname").equals(nickname).first();
            if (buffered)
                await db.usersBuffer.put({ ...buffered, isBanned: true });
            else {
                const user = await db.users.where("nickname").equals(nickname).first();
                if (user && !user.isBanned)
                    await db.usersBuffer.put({ ...user, isBanned: true });
            }
        }
        if (action.promptMessageAction) {
            hintFunc.setStoryHint(["chat-input", "chat-send"], false)
            const { content, isLink } = action.promptMessageAction;
            chatFunc.promptMessage(isLink ? window.location.origin + content : content);
        }
        if (action.setShowPlaceholdersAction) {
            loginFunc.setShowPlaceholders(action.setShowPlaceholdersAction.field, action.setShowPlaceholdersAction.show);
        }
        if (action.setModsToRemove) {
            const targetSubforum = await db.subforumsBuffer.where("name").equals(action.setModsToRemove.subforum).first()
                ?? await db.subforums.where("name").equals(action.setModsToRemove.subforum).first();
            if (targetSubforum) {
                await db.subforumsBuffer.put(targetSubforum);
                hintFunc.setStoryHint(["demote-search", "", "demote-submit"]);
                subforumSettingsFunc.setDemoteTarget(targetSubforum.mods);
            }
        }
        if (action.setTransferTo) {
            const targetSubforum = await db.subforumsBuffer.where("name").equals(action.setTransferTo.subforum).first()
                ?? await db.subforums.where("name").equals(action.setTransferTo.subforum).first();
            if (targetSubforum) {
                await db.subforumsBuffer.put(targetSubforum);
                hintFunc.setStoryHint(["transfer-search", "", "transfer-submit"]);
                subforumSettingsFunc.setTransferTarget(action.setTransferTo.user);
            }
        }
        if (action.setTerminalCommandAction) {
            hintFunc.setStoryHint(["terminal-input", ""]);
            terminalFunc.setTerminalCommand(action.setTerminalCommandAction.command, action.setTerminalCommandAction.output);
        }
        if (action.addTerminalHistoryAction) {
            terminalFunc.addTerminalHistory(action.addTerminalHistoryAction.history);
        }
        if (action.setPromptVisibilityAction) {
            terminalFunc.setPromptVisibility(action.setPromptVisibilityAction.visible);
        }
        if (action.vimTypeAction) {
            hintFunc.setStoryHint(["vim-input", ""]);
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
        const dest = scl.action?.saveAction?.dest
        if (!dest) {
            console.error(scl, "This scriptline is not a save action.")
            return;
        }
        locationRef.current = dest;
        userState.userLoggedIn.current = dest.user;
        if (scl.action?.saveAction?.lastNavPos != undefined) {
            let navScl = await db.story.get(id + scl.action.saveAction.lastNavPos);
            objectiveHints.setNavHint(navScl?.hint ?? t("story.navHintFallback"));
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
        if (target.user !== userState.userLoggedIn.current)
            return false;
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
                style: stl.style,
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
            const parallelExecTl = gsap.timeline();
            console.log("adding parallel", scl.addParallelExec.name)
            const branches = scl.addParallelExec.branches;
            for (let i = 0; i < branches.length; i++) {
                const branch = gsap.timeline();
                for (let action of branches[i]) {
                    addScriptlineToTimeline(action, branch);
                }
                parallelExecTl.add(branch, 0);
            }
            console.log("added parallel", scl.addParallelExec.name)
            tl.add(parallelExecTl, scl.offset)
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
            const t = gsap.timeline();
            for (let id of scl.clearTypingTextBoxes.ids) {
                const box = typingBoxes.current.get(id);
                if (!box)
                    continue;
                t.add(box.reset(), ">");
            }
            tl.add(t, scl.offset);
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
            objectiveHints.setNavHint(navHint ?? t("story.navHintFallback"));
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
        await db.users.where("savedStoryId").aboveOrEqual(0).modify({ password: password, savedStoryId: 1 });//1 is orig
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

    async function login(nickname: string, password: string): Promise<{ nickname?: string; password?: string }> {
        const errors: { nickname?: string; password?: string } = {};
        nickname = nickname.trim();
        password = password.trim();
        if (nickname === "")
            errors.nickname = t("login.error.empty");
        if (password === "")
            errors.password = t("login.error.empty");
        if (errors.nickname || errors.password)
            return errors;
        const user = await db.usersBuffer.where("nickname").equals(nickname).first() ?? await db.users.where("nickname").equals(nickname).first();
        if (!user || user.savedStoryId == 0) {
            errors.nickname = t("story.error.nicknameNotFound");
            return errors;
        }
        if (!user.password || user.password != password || !userState.isRealLoggedIn.current && user.savedStoryId === undefined) {
            errors.password = t("story.error.wrongPassword");
            return errors;
        }
        userState.userLoggedIn.current = nickname;
        if (!userState.isRealLoggedIn.current) {
            await bridge.exec(getAnim, "COLOR_OVERLAY", { duration: 2, backgroundColor: "black", overlayNumber: ["1"] });
            window.dispatchEvent(new Event("loggedIn"));
            userState.isRealLoggedIn.current = true;
            await recoverCheckpoint(user.savedStoryId ?? 0);
            await bridge.exec(getAnim, "REVERSE_OVERLAY", { duration: 2, backgroundColor: "black", overlayNumber: ["1"] });
            return errors;
        }
        window.dispatchEvent(new Event("loggedIn"));
        navigate(`/user/${nickname}`);
        return errors;
    }

    function logout() {
        userState.userLoggedIn.current = "";
        window.dispatchEvent(new Event("loggedOut"));
        navigate("/login");
    }

    const quitGame = contextSafe(async (playAnim = true, nav = true) => {
        if (playAnim)
            await bridge.exec(getAnim, "COLOR_OVERLAY", { duration: 2, backgroundColor: "black", overlayNumber: ["1"] });
        userState.userLoggedIn.current = "";
        userState.isRealLoggedIn.current = false;
        window.dispatchEvent(new Event("loggedOut"));
        if (nav)
            navigate("/");
        await bufferFunc.resetBuffers();
        if (playAnim)
            await bridge.exec(getAnim, "REVERSE_OVERLAY", { duration: 2, backgroundColor: "black", overlayNumber: ["1"] });
    });

    function getExpectedUser() {
        return locationRef.current?.user;
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

    const _processAction = process.env.NODE_ENV == 'test' ? processAction : undefined;
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
    const _getLastExecutedPath = process.env.NODE_ENV == 'test' ? () => lastExecutedPath : undefined;
    const _showStory = process.env.NODE_ENV == 'test' ? showStory : undefined;
    const _customizeStory = process.env.NODE_ENV == 'test' ? customizeStory : undefined;
    const _isOnLocation = process.env.NODE_ENV == 'test' ? isOnLocation : undefined;

    return {
        getAnim,
        resumeStoryFromHint,
        recoverCheckpoint,
        createUser,
        login,
        logout,
        quitGame,
        getExpectedUser,
        recoverStoryOnPage,
        resetAnims,
        getMessages: chatFunc.getMessages,
        resetBuffers: bufferFunc.resetBuffers,
        addMessageFromUser: chatFunc.addMessageFromUser,
        setChatHandle: chatFunc.setChatHandle,
        setLoginHandle: loginFunc.setLoginHandle,
        setSubforumSettingsHandle: subforumSettingsFunc.setSubforumSettingsHandle,
        setTerminalHandle: terminalFunc.setTerminalHandle,
        setVimHandle: vimFunc.setVimHandle,
        goBackwardHint: hintFunc.goBackwardHint,
        goForwardHint: hintFunc.goForwardHint,
        setHeaderSearch: hintFunc.setHeaderSearch,
        locale,
        setLocale,
        t,
        _processAction,
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
        _getLastExecutedPath,
        _showStory,
        _customizeStory,
        _isOnLocation
    }
}

