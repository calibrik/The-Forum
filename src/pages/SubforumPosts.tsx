import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { db, type IPost, type ISubforum } from "../backend/db";
import { useOutletContext, useParams } from "react-router";
import { bridge } from "../utils";
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
        setPosts(await db.posts.where("subforum").equals(name ?? "").toArray());
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
                <HintHolder id="p4" ref={setHintHolder("p4")} />
                <HintHolder id="p5" ref={setHintHolder("p5")} />
                <HintHolder id="p6" ref={setHintHolder("p6")} />
                <Spinner />
            </div>
        </>
    );
}