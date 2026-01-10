import type { FC } from "react";
import { getImageUrl } from "../utils";
import { Outlet } from "react-router";
import styles from "../scss/sub-profilePage.module.scss";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { BaseButton } from "../components/BaseButton";
import { Plus } from "../components/Icons";
import { Menu } from "../components/Menu";
interface ISubforumProps { };

export const Subforum: FC<ISubforumProps> = (_) => {
    return (
        <div className={styles.container}>
            <img src={getImageUrl("placeholder")} className={styles.pfpBg} />
            <div className={styles.subProfileContainer}>
                <div className={styles.headerContainer}>
                    <div className={styles.titleHeaderContainer}>
                        <h1 className={styles.title}>f/subforum</h1>
                        <span className={styles.followerCount}>100.1k followers</span>
                    </div>
                    <p className={styles.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet</p>
                </div>
                <Menu options={{
                    posts: {
                        name: "Posts",
                        destination: ""
                    },
                    members: {
                        name: "Members",
                        destination: "members"
                    },
                    settings: {
                        name: "Settings",
                        destination: "settings"
                    }
                }} />
                <div className={styles.createPostContainer}>
                    <BaseButton icon={<Plus />} iconPos="start" className={`${styles.createPost} ${baseButtonStyles.primaryButton}`}>Create Post</BaseButton>
                </div>
            </div>
            <div className={styles.contentContainer}>
                <Outlet />
            </div>
        </div>
    );
}
