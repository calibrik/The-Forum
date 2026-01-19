import type { FC } from "react";
import styles from "../scss/sub-userPage.module.scss";
import { Outlet } from "react-router";
import { getImageUrl } from "../utils";
import { Menu } from "../components/Menu";
import { Dot } from "../components/Icons";
interface IUserPageProps { };

export const User: FC<IUserPageProps> = (_) => {
    return (
        <div className={styles.container}>
            <img src={getImageUrl("placeholder")} className={styles.pfpBg} />
            <div className={styles.subProfileContainer}>
                <div className={styles.headerContainer}>
                    <div className={styles.titleHeaderContainer}>
                        <h1 className={styles.title}>u/user</h1>
                        <div className={styles.onlineContainer}>
                            <Dot className={styles.onlineIcon}/>
                            <span className={styles.followerCount}>Online</span>
                        </div>
                    </div>
                    <p className={styles.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet</p>
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
                    }
                }} />
            </div>
            <div className={styles.contentContainer}>
                <Outlet />
            </div>
        </div>
    );
}
