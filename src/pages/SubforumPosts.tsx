import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { db, type IPost } from "../backend/db";
import { useParams } from "react-router";
interface ISubforumPostsProps { };

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    const storyInit = useStoryInit();
    const { name } = useParams<{ name: string }>();
    const [posts, setPosts] = useState<IPost[]>([]);

    async function init() {
        setPosts(await db.posts.where("subforum").equals(name ?? "").toArray());
    }

    useEffect(() => {
        storyInit(3, [],init);
    }, [])

    return (
        <div className={styles.container}>
            {posts.map((v, i) => (
                <Post showAuthor={"user"} key={i} post={v} />
            ))}
            <Spinner />
        </div>
    );
}
