import type { FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
interface IUserPostsProps {};

export const UserPosts: FC<IUserPostsProps> = (_) => {
    return (
        <div className={styles.container}>
            <Post/>
            <Post img="placeholder"/>
            <Post/>
            <Post/>
            <Post img="placeholder"/>
            <Post img="placeholder"/>
            <Post/>
            <Spinner/>
        </div>
    );
}
