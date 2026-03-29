import { useEffect, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
interface ISubforumPostsProps { };

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    const storyInit = useStoryInit();

    useEffect(() => {
        storyInit(3, []);
    }, [])

    return (
        <div className={styles.container}>
            <Post showAuthor={"user"} />
            <Post img="placeholder.png" showAuthor={"user"} />
            <Post showAuthor={"user"} />
            <Post showAuthor={"user"} />
            <Post img="placeholder.png" showAuthor={"user"} />
            <Post img="placeholder.png" showAuthor={"user"} />
            <Post showAuthor={"user"} />
            <Spinner />
        </div>
    );
}
