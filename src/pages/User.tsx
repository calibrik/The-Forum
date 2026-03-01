import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet, useNavigate } from "react-router";
import { getImageUrl } from "../utils";
import { Menu } from "../components/Menu";
import { Dot } from "../components/Icons";
import { useUserState } from "../providers/UserAuth";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IUser } from "../backend/db";
import { Spinner } from "../components/Spinner";
import { type ITypingTextBoxHandle, TypingTextBox } from "../components/TypingTextBox";
interface IUserPageProps { };
export interface IUserOutlet {
    user?: IUser
}
interface IAccInfoProps {
    nickname: string
};
interface IAccInfoHandle {
    toggle:()=>void
 };

export const AccInfo = forwardRef<IAccInfoHandle, IAccInfoProps>((props, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const divRef=useRef<HTMLDivElement>(null);

    function onBlur(e: React.FocusEvent) {
        if (!e.currentTarget.contains(e.relatedTarget)&&!e.relatedTarget?.classList.contains(styles.accLink)) {
            setIsOpen(false);
        }
    }

    useImperativeHandle(ref,()=>({
        toggle() {
            setIsOpen((p)=>!p);
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
                <span className={styles.rank}>Copper III</span>
            </div>
            <div className={styles.accSection}>
                <span className={styles.lastGames}>Match History:</span>
                <ul className={styles.lastGamesList}>
                    <li className={styles.loseGame}>Defeat 0 - 13</li>
                    <li className={styles.loseGame}>Defeat 5 - 13</li>
                    <li className={styles.loseGame}>Defeat 3 - 13</li>
                    <li className={styles.loseGame}>Defeat 4 - 13</li>
                    <li className={styles.loseGame}>Defeat 7 - 13</li>
                    <li className={styles.loseGame}>Defeat 11 - 13</li>
                    <li className={styles.loseGame}>Defeat 8 - 13</li>
                    <li className={styles.loseGame}>Defeat 8 - 13</li>
                    <li className={styles.winGame}>Victory 13 - 11</li>
                    <li className={styles.loseGame}>Defeat 1 - 13</li>
                </ul>
            </div>
        </div>
    );
});


export const User: FC<IUserPageProps> = (_) => {
    const story = useStory();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)//{nickname:"yo",imageName:"placeholder.png",id:4,description:"blow me"}
    const storyInit = useStoryInit();
    const typingBoxRef = useRef<ITypingTextBoxHandle>(null);
    const accInfoRef=useRef<IAccInfoHandle>(null);

    function onAccLinkClick(e:React.MouseEvent){
        story.resumeStory(e);
        accInfoRef.current?.toggle();
    }

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const users = await db.users.where("nickname").equals(userState.userLoggedIn.current).toArray();
        if (users.length != 1) {
            console.error(`No ${userState.userLoggedIn} found (or found too many) ${users.length}.`)
            navigate("/")
            return;
        }
        setUser(users[0]);
    }

    useEffect(() => {
        storyInit(1, [typingBoxRef], init);
    }, [])

    return (
        <>
            <TypingTextBox ref={typingBoxRef} type="terminal" />
            <div className={styles.container}>
                <img src={getImageUrl(user?.imageName ?? "placeholder.png")} className={styles.pfpBg} />
                <div className={styles.subProfileContainer}>
                    {user ?
                        <>
                            <div className={styles.headerContainer}>
                                <div className={styles.titleHeaderContainer}>
                                    <h1 className={styles.title}>u/{user.nickname}</h1>
                                    <div className={styles.onlineContainer}>
                                        <Dot className={styles.onlineIcon} />
                                        <span className={styles.followerCount}>Online</span>
                                    </div>
                                </div>
                                <p className={styles.description}>{user.description}</p>
                                {user.storyId ?
                                    <div className={styles.accDiv}>
                                        <span tabIndex={-1} onClick={onAccLinkClick} id="cs-profile-text" className={styles.accLink}>My SC2 profile</span>
                                        <AccInfo ref={accInfoRef} nickname={user.nickname} />
                                    </div>
                                    : ""}
                            </div>
                            <Menu options={{
                                posts: {
                                    name: "Posts",
                                    destination: ""
                                },
                                comments: {
                                    name: "Comments",
                                    destination: "comments"
                                },
                                settings: {
                                    name: "Settings",
                                },
                            }} />
                        </>
                        : <Spinner />}
                </div>

                <div className={styles.contentContainer}>
                    <Outlet context={{ user }} />
                </div>
            </div>
        </>
    );
}
