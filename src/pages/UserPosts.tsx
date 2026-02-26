import type { FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner"; 
interface IUserPostsProps {};

export const UserPosts: FC<IUserPostsProps> = (_) => {
    return (
        <div className={styles.container}>
            <Post showAuthor={"subforum"}/>
            <Post img="placeholder.png" showAuthor={"subforum"}/>
            <Post showAuthor={"subforum"}/>
            <Post showAuthor={"subforum"}/>
            <Post img="placeholder.png" showAuthor={"subforum"}/>
            <Post img="placeholder.png" showAuthor={"subforum"}/>
            <Post showAuthor={"subforum"}/>
            <Spinner/>
        </div>
    );
}
