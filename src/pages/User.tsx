import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet, useNavigate, useParams } from "react-router";
import { getImageUrl } from "../utils";
import { Menu, type IMenuOption } from "../components/Menu";
import { Dot } from "../components/Icons";
import { useUserState } from "../providers/UserAuth";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IUser } from "../backend/db";
import { Spinner } from "../components/Spinner";
import { type ITypingTextBoxHandle, TypingTextBox } from "../components/TypingTextBox";
import { HintHolder, useHintHolders } from "../components/HintHolder";
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
                <span className={styles.lastGames}>Recent Sprints:</span>
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
    const {username}=useParams<{username:string}>();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)//{nickname:"yo",imageName:"placeholder.png",id:4,description:"blow me"}
    const storyInit = useStoryInit();
    const typingBoxRef = useRef<ITypingTextBoxHandle>(null);
    const accInfoRef = useRef<IAccInfoHandle>(null);
    const {hintHolders,setHintHolder}=useHintHolders();

    function onAccLinkClick(e: React.MouseEvent) {
        story.resumeStoryFromHint(e);
        accInfoRef.current?.toggle();
    }

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const users = await db.users.where("nickname").equals(username??"").toArray();
        if (users.length != 1) {
            console.error(`No ${username} user found (or found too many) ${users.length}.`)
            navigate("/404")
            return;
        }
        setUser(users[0]);
    }

    useEffect(() => {
        storyInit(2, [typingBoxRef], init);
    }, [username])

    useEffect(() => {
        if (!user)
            return;
        if (user.savedStoryId) {
            const hint=hintHolders.current.get("cd-profile-text")?.getHintClass();
            if (!hint)
                return;
            document.getElementById("cd-profile-text")?.classList.add(hint);
        }
    },[user]);

    let menuOptions: IMenuOption[] = [
            {
                name: "Posts",
                destination: ""
            },
            {
                name: "Comments",
                destination: "comments"
            },
        ]
        
        if (user && user.nickname == userState.userLoggedIn.current) {
            menuOptions.push({
                name: "Settings"
            });
        }

    return (
        <>
            <TypingTextBox ref={typingBoxRef} type="terminal" />
            <div className={styles.container}>
                <img src={getImageUrl(user?.imageName ?? "placeholder.png")} className={styles.pfpBg} />
                <div className={styles.subProfileContainer}>
                    {user ?
                        <div className={styles.headerContainer}>
                            <div className={styles.titleHeaderContainer}>
                                <h1 className={styles.title}>u/{user.nickname}</h1>
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
                    <HintHolder ref={setHintHolder("cd-profile-text")} id="cd-profile-text"/>
                    <Menu options={menuOptions} />
                </div>
                <div className={styles.contentContainer}>
                    <Outlet context={{ user }} />
                </div>
            </div>
        </>
    );
}
