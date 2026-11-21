import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { bridge, getImageUrl } from "../misc/utils";
import { Menu, type IMenuOption } from "../components/Menu";
import { Dot, Hammer, Message } from "../components/Icons";
import { useUserState } from "../providers/UserAuth";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IUser } from "../misc/db";
import { Spinner } from "../components/Spinner";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { HintHolder, useHintHolders } from "../components/HintHolder";
import { BaseButton } from "../components/BaseButton";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { useLocale } from "../providers/Locale";

interface IUserPageProps { };
export interface IUserOutlet {
    user?: IUser
}
interface IAccInfoProps {
    nickname: string
};
interface IAccInfoHandle {
    toggle: () => void
};

const RECENT_GAMES = [
    { time: "5:12", win: false },
    { time: "10:14", win: false },
    { time: "8:48", win: false },
    { time: "15:01", win: false },
    { time: "40:16", win: false },
    { time: "8:34", win: false },
    { time: "6:25", win: false },
    { time: "29:30", win: false },
    { time: "35:04", win: true },
    { time: "13:16", win: false },
];

export const AccInfo = forwardRef<IAccInfoHandle, IAccInfoProps>((props, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement>(null);
    const { t } = useLocale();

    function onBlur(e: React.FocusEvent) {
        if (!e.currentTarget.contains(e.relatedTarget) && !e.relatedTarget?.classList.contains(styles.accLink)) {
            setIsOpen(false);
        }
    }

    useImperativeHandle(ref, () => ({
        toggle() {
            setIsOpen((p) => !p);
        }
    }))

    useEffect(() => {
        if (isOpen) {
            divRef.current?.focus();
        }
    }, [isOpen])

    return (
        <div ref={divRef} tabIndex={-1} onBlur={onBlur} className={`${styles.accToolTipContainer} ${isOpen ? styles.open : styles.close}`}>
            <div className={styles.accSection}>
                <span className={styles.playerName}>{props.nickname}</span>
                <span className={styles.rank}>{t("user.level")}</span>
            </div>
            <div className={styles.accSection}>
                <span className={styles.lastGames}>{t("user.recentContracts")}</span>
                <ul className={styles.lastGamesList}>
                    {RECENT_GAMES.map((game) => (
                        <li key={game.time} className={game.win ? styles.winGame : styles.loseGame}>
                            {t(game.win ? "user.successfulExtraction" : "user.failedExtraction", { time: game.time })}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});


export const User: FC<IUserPageProps> = (_) => {
    const story = useStory();
    const location = useLocation();
    const { username } = useParams<{ username: string }>();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)//{nickname:"yo",imageName:"placeholder.png",id:4,description:"blow me"}
    const storyInit = useStoryInit();
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
    const accInfoRef = useRef<IAccInfoHandle>(null);
    const { transferHints, setHintHolder } = useHintHolders();
    const { t } = useLocale();

    function onAccLinkClick(e: React.MouseEvent) {
        e.preventDefault();
        story.resumeStoryFromHint(e.currentTarget.id);
        accInfoRef.current?.toggle();
    }

    async function onMessageClick() {
        if (!userState.isRealLoggedIn || userState.userLoggedIn.current == "" || story.resumeStoryFromHint("send-message"))
            return;
        const [buffered, saved] = await Promise.all([db.chatsBuffer.where("owner").equals(userState.userLoggedIn.current).toArray(), db.chats.where("owner").equals(userState.userLoggedIn.current).toArray()]);
        const chats = [...buffered, ...saved];
        const chat = chats.find(c => c.owner.find(u => u == username));
        if (chat)
            navigate(`/chat/${chat.id}`);
    }

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const user = await db.usersBuffer.where("nickname").equals(username ?? "").first()
            ?? await db.users.where("nickname").equals(username ?? "").first();
        if (!user) {
            navigate("/404", { replace: true })
            return;
        }
        setUser(user);
    }

    useEffect(() => {
        bridge.exec(storyInit, 2, getTypingBoxes(), init);
    }, [location.pathname])

    useEffect(() => {
        if (!user)
            return;
        transferHints();
    }, [user]);

    let menuOptions: IMenuOption[] = [
        {
            name: t("common.posts"),
            destination: "",
            id: "posts"
        },
        {
            name: t("common.comments"),
            destination: "comments",
            id: "comments"
        },
    ]

    if (user && user.nickname == userState.userLoggedIn.current) {
        menuOptions.push({
            name: t("common.settings"),
            destination: "settings",
            id: "settings"
        });
    }

    return (
        <>
            <TypingTextBox ref={setTypingBox("nar1")} type="terminal" />
            <div className={styles.container}>
                <img src={getImageUrl(user?.imageName ?? "pfp1.png")} className={styles.pfpBg} />
                <div className={`${styles.subProfileContainer} ${user?.isBanned ? styles.banned : ""}`}>
                    {user && !user.isBanned ?
                        <div className={styles.headerContainer}>
                            <div className={styles.titleHeaderContainer}>
                                <div className={styles.titleRow}>
                                    <h1 className={styles.title}>u/{user.nickname}</h1>
                                    {username == userState.userLoggedIn.current ? "" :
                                        <BaseButton icon={<Message />} type="button" id={"send-message"} onClick={onMessageClick} className={`${styles.messageButton} ${baseButtonStyles.primaryButton}`}>{t("common.message")}</BaseButton>
                                    }
                                </div>
                                <div className={styles.onlineContainer}>
                                    <Dot className={styles.onlineIcon} />
                                    <span className={styles.followerCount}>{t("common.online")}</span>
                                </div>
                            </div>
                            <p className={styles.description}>{user.description}</p>
                            {user.savedStoryId ?
                                <div className={styles.accDiv}>
                                    <span tabIndex={-1} onClick={onAccLinkClick} id="cd-profile-text" className={styles.accLink}>{t("user.cyberdiversProfile")}</span>
                                    <AccInfo ref={accInfoRef} nickname={user.nickname} />
                                </div>
                                : ""}
                        </div>
                        : user ?
                            <div className={styles.bannedContainer}>
                                <Hammer className={styles.bannedIcon} />
                                <h1 className={styles.bannedTitle}>{t("user.bannedTitle")}</h1>
                                <p className={styles.bannedMessage}>{t("user.bannedMessage")}<span className={styles.bannedLink}>{t("user.contactUs")}</span></p>
                            </div>
                            : <Spinner />}
                    <HintHolder ref={setHintHolder("cd-profile-text")} id="cd-profile-text" />
                    <HintHolder ref={setHintHolder("send-message")} id={"send-message"} />
                    {!user?.isBanned && <Menu options={menuOptions} />}
                </div>
                {!user?.isBanned ?
                    <div className={styles.contentContainer}>
                        <Outlet context={user} />
                    </div>
                    : ""}
            </div>
        </>
    );
}
