import { useEffect, useRef, useState, type FC } from "react";
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

export const User: FC<IUserPageProps> = (_) => {
    const story = useStory();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)//{nickname:"yo",imageName:"placeholder.png",id:4,description:"blow me"}
    const storyInit = useStoryInit();
    const typingBoxRef = useRef<ITypingTextBoxHandle>(null);

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
                                {user.storyId ? <span onClick={story.resumeStory} id="cs-profile-text" className={styles.accLink}>My SC2 profile</span> : ""}
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
