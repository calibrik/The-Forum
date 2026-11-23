import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../hooks/useStoryInit";
import { db, type IPost, type ISubforum } from "../misc/db";
import { useOutletContext, useParams } from "react-router";
import { bridge } from "../misc/utils";
import { HintHolder, useHintHolders } from "../components/HintHolder";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
interface ISubforumPostsProps { };

export const SubforumPosts: FC<ISubforumPostsProps> = (_) => {
    const storyInit = useStoryInit();
    const { name } = useParams<{ name: string }>();
    const [posts, setPosts] = useState<IPost[]>([]);
    const { transferHints, setHintHolder } = useHintHolders();
    const [, typingBoxes] = useOutletContext<[ISubforum | undefined, Map<string, ITypingTextBoxHandle>]>();

    async function init() {
        const [buffered, saved] = await Promise.all([
            db.postsBuffer.where("subforum").equals(name ?? "").toArray(),
            db.posts.where("subforum").equals(name ?? "").toArray()
        ]);
        const postsMap = new Map<string, IPost>();
        for (const post of saved) {
            if (post.isVisible !== false)
                postsMap.set(post.id, post);
        }
        for (const post of buffered)
            postsMap.set(post.id, post);
        setPosts(Array.from(postsMap.values()).sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime()));
    }

    useEffect(() => {
        bridge.exec(storyInit, 3, typingBoxes, init);
    }, [name])

    useEffect(() => {
        if (posts.length == 0)
            return;
        transferHints();
    }, [posts]);


    return (
        <>
            <div data-fall="true" className={styles.container}>
                {posts.map((v, i) => (
                    <div data-fall="true" key={i}>
                        <Post showAuthor={"user"} id={v.id} post={v} />
                    </div>
                ))}
                <HintHolder id="dlc-moved" ref={setHintHolder("dlc-moved")} />
                <HintHolder id="vault" ref={setHintHolder("vault")} />
                <HintHolder id="spoilers" ref={setHintHolder("spoilers")} />
                <Spinner />
            </div>
        </>
    );
}