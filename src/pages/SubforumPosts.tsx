import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { db, type IPost } from "../backend/db";
import { useParams } from "react-router";
import { addHashToUserNickname, bridge, sanitizeDbFetch } from "../utils";
import { HintHolder, useHintHolders } from "../components/HintHolder";
interface ISubforumPostsProps { };

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    const storyInit = useStoryInit();
    const { name } = useParams<{ name: string }>();
    const [posts, setPosts] = useState<IPost[]>([]);
    const { hintHolders, setHintHolder } = useHintHolders();

    async function init() {
        setPosts(await sanitizeDbFetch(await db.posts.where("subforum").equals(await addHashToUserNickname(name ?? "")).toArray()));
    }

    useEffect(() => {
        bridge.exec(storyInit, 3, [], init);
    }, [])

    useEffect(() => {
        if (posts.length==0)
            return;
        let hint = hintHolders.current.get("p4")?.getHintClass();
        if (hint)
            document.getElementById("p4")?.classList.add(hint);
        hint = hintHolders.current.get("p5")?.getHintClass();
        if (hint)
            document.getElementById("p5")?.classList.add(hint);
        hint = hintHolders.current.get("p6")?.getHintClass();
        if (hint)
            document.getElementById("p6")?.classList.add(hint);
    }, [posts]);


    return (
        <div className={styles.container}>
            {posts.map((v, i) => (
                <Post showAuthor={"user"} id={v.id} key={i} post={v} />
            ))}
            <HintHolder id="p4" ref={setHintHolder("p4")} />
            <HintHolder id="p5" ref={setHintHolder("p5")} />
            <HintHolder id="p6" ref={setHintHolder("p6")} />
            <Spinner />
        </div>
    );
}
