import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet, useNavigate } from "react-router";
import { getImageUrl } from "../utils";
import { Menu } from "../components/Menu";
import { Dot } from "../components/Icons";
import { useUserState } from "../providers/UserAuth";
import { useStory } from "../providers/StoryProvider";
import { db, type IUser } from "../backend/db";
import { Spinner } from "../components/Spinner";
interface IUserPageProps { };

export const User: FC<IUserPageProps> = (_) => {
    const story = useStory();
    const userState = useUserState();
    let navigate = useNavigate();
    const [user, setUser] = useState<IUser | undefined>(undefined)

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const users = await db.users.where("nickname").equals(userState.userLoggedIn).toArray();
        if (users.length != 1) {
            console.error(`No ${userState.userLoggedIn} found (or found too many) ${users.length}.`)
            navigate("/")
            return;
        }
        setUser(users[0]);
        if (userState.startStory.current) {
            await story.getAnim("FADE_IN");
            story.showStory(userState.storyId.current);
            return;
        }
        story.initReady();
    }

    useEffect(() => {
        init();
    }, [])

    if (!user)
        return (
            <div className={styles.container}>
                <img src={getImageUrl("placeholder.png")} className={styles.pfpBg} />
                <div className={styles.subProfileContainer}>
                    <Spinner />
                </div>
            </div>
        )

    return (
        <div className={styles.container}>
            <img src={getImageUrl(user.imageName ?? "placeholder.png")} className={styles.pfpBg} />
            <div className={styles.subProfileContainer}>
                <div className={styles.headerContainer}>
                    <div className={styles.titleHeaderContainer}>
                        <h1 className={styles.title}>u/{user.nickname}</h1>
                        <div className={styles.onlineContainer}>
                            <Dot className={styles.onlineIcon} />
                            <span className={styles.followerCount}>Online</span>
                        </div>
                    </div>
                    <p className={styles.description}>{user.description}</p>
                    {user.storyId?<span className={styles.accLink}>My SC2 profile</span>:""}
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
            </div>
            <div className={styles.contentContainer}>
                <Outlet />
            </div>
        </div>
    );
}
