import { useEffect, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
interface IUserPostsProps { };

export const UserPosts: FC<IUserPostsProps> = (_) => {
    const storyInit=useStoryInit();

    useEffect(()=>{
        storyInit(2,[]);
    },[])

    return (
            <div className={styles.container}>
                <Post showAuthor={"subforum"} />
                <Post img="placeholder.png" showAuthor={"subforum"} />
                <Post showAuthor={"subforum"} />
                <Post showAuthor={"subforum"} />
                <Post img="placeholder.png" showAuthor={"subforum"} />
                <Post img="placeholder.png" showAuthor={"subforum"} />
                <Post showAuthor={"subforum"} />
                <Spinner />
            </div>
    );
}
