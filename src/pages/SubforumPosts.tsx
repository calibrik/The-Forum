import type { FC } from "react";
import styles from "../scss/subforumPostsPage.module.scss"
import { Post } from "../components/Post";
interface ISubforumPostsProps {};

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    return (
        <div className={styles.container}>
            <Post/>
            <Post img="placeholder"/>
            <Post/>
            <Post/>
            <Post img="placeholder"/>
            <Post img="placeholder"/>
            <Post/>
        </div>
    );
}
