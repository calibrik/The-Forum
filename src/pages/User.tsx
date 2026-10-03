import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet, useNavigate, useParams } from "react-router";
import { bridge, getImageUrl } from "../utils";
import { Menu, type IMenuOption } from "../components/Menu";
import { Dot, Message } from "../components/Icons";
import { useUserState } from "../providers/UserAuth";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IUser } from "../backend/db";
import { Spinner } from "../components/Spinner";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { HintHolder, useHintHolders } from "../components/HintHolder";
import { BaseButton } from "../components/BaseButton";
import baseButtonStyles from "../scss/baseButton.module.scss";

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

export const AccInfo = forwardRef<IAccInfoHandle, IAccInfoProps>((props, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const divRef = useRef<HTMLDivElement>(null);

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
                <span className={styles.rank}>Level 117</span>
            </div>
            <div className={styles.accSection}>
                <span className={styles.lastGames}>Recent Contracts:</span>
                <ul className={styles.lastGamesList}>
                    <li className={styles.loseGame}>Failed extraction 5:12</li>
                    <li className={styles.loseGame}>Failed extraction 10:14</li>
                    <li className={styles.loseGame}>Failed extraction 8:48</li>
                    <li className={styles.loseGame}>Failed extraction 15:01</li>
                    <li className={styles.loseGame}>Failed extraction 40:16</li>
                    <li className={styles.loseGame}>Failed extraction 8:34</li>
                    <li className={styles.loseGame}>Failed extraction 6:25</li>
                    <li className={styles.loseGame}>Failed extraction 29:30</li>
                    <li className={styles.winGame}>Successful extraction 35:04</li>
                    <li className={styles.loseGame}>Failed extraction 13:16</li>
                </ul>
            </div>
        </div>
    );
});


export const User: FC<IUserPageProps> = (_) => {
    const story = useStory();
    const { username } = useParams<{ username: string }>();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)//{nickname:"yo",imageName:"placeholder.png",id:4,description:"blow me"}
    const storyInit = useStoryInit();
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
    const accInfoRef = useRef<IAccInfoHandle>(null);
    const { transferHints, setHintHolder } = useHintHolders();

    function onAccLinkClick(e: React.MouseEvent) {
        e.preventDefault();
        story.resumeStoryFromHint(e.currentTarget.id);
        accInfoRef.current?.toggle();
    }

    async function onMessageClick() {
        if (!userState.isRealLoggedIn||userState.userLoggedIn.current==""||story.resumeStoryFromHint("send-message"))
            return;
        const [buffered, saved] = await Promise.all([db.chatsBuffer.where("owner").equals(userState.userLoggedIn.current).toArray(), db.chats.where("owner").equals(userState.userLoggedIn.current).toArray()]);
        const chats = [...buffered, ...saved];
        const chat=chats.find(c=>c.owner.find(u=>u==username));
        if (chat)
            navigate(`/chat/${chat.id}`);
    }

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const user = await db.users.where("nickname").equals(username ?? "").first();
        if (!user) {
            navigate("/404", { replace: true })
            return;
        }
        setUser(user);
    }

    useEffect(() => {
        bridge.exec(storyInit, 2, getTypingBoxes(), init);
    }, [username])

    useEffect(() => {
        if (!user)
            return;
        transferHints();
    }, [user]);

    let menuOptions: IMenuOption[] = [
        {
            name: "Posts",
            destination: "",
            id: "posts"
        },
        {
            name: "Comments",
            destination: "comments",
            id: "comments"
        },
    ]

    if (user && user.nickname == userState.userLoggedIn.current) {
        menuOptions.push({
            name: "Settings",
            id: "settings"
        });
    }

    return (
        <>
            <TypingTextBox ref={setTypingBox("nar1")} type="terminal" />
            <div className={styles.container}>
                <img src={getImageUrl(user?.imageName ?? "pfp1.png")} className={styles.pfpBg} />
                <div className={styles.subProfileContainer}>
                    {user ?
                        <div className={styles.headerContainer}>
                            <div className={styles.titleHeaderContainer}>
                                <div className={styles.titleRow}>
                                    <h1 className={styles.title}>u/{user.nickname}</h1>
                                    {username == userState.userLoggedIn.current ? "" :
                                        <BaseButton icon={<Message/>} type="button" id={"send-message"} onClick={onMessageClick} className={`${styles.messageButton} ${baseButtonStyles.primaryButton}`}>Message</BaseButton>
                                    }
                                </div>
                                <div className={styles.onlineContainer}>
                                    <Dot className={styles.onlineIcon} />
                                    <span className={styles.followerCount}>Online</span>
                                </div>
                            </div>
                            <p className={styles.description}>{user.description}</p>
                            {user.savedStoryId ?
                                <div className={styles.accDiv}>
                                    <span tabIndex={-1} onClick={onAccLinkClick} id="cd-profile-text" className={styles.accLink}>My Cyberdivers profile</span>
                                    <AccInfo ref={accInfoRef} nickname={user.nickname} />
                                </div>
                                : ""}
                        </div>
                        : <Spinner />}
                    <HintHolder ref={setHintHolder("cd-profile-text")} id="cd-profile-text" />
                    <HintHolder ref={setHintHolder("send-message")} id={"send-message"} />
                    <Menu options={menuOptions} />
                </div>
                <div className={styles.contentContainer}>
                    <Outlet context={user} />
                </div>
            </div>
        </>
    );
}
