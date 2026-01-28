import type { FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
interface ISubforumPostsProps {};

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    return (
        <div className={styles.container}>
            <Post showAuthor={"user"}/>
            <Post img="placeholder" showAuthor={"user"}/>
            <Post showAuthor={"user"}/>
            <Post showAuthor={"user"}/>
            <Post img="placeholder" showAuthor={"user"}/>
            <Post img="placeholder" showAuthor={"user"}/>
            <Post showAuthor={"user"}/>
            <Spinner/>
        </div>
    );
}
