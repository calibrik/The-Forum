import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { useParams } from "react-router";
import { db, type IPost } from "../backend/db";
import { bridge } from "../utils";
interface IUserPostsProps { };

export const UserPosts: FC<IUserPostsProps> = (_) => {
    const storyInit=useStoryInit();
    const {username}=useParams<{username:string}>();
    const [posts,setPosts]=useState<IPost[]>([]);

    async function init(){
        const [buffered, saved] = await Promise.all([
            db.postsBuffer.where("author").equals(username ?? "").toArray(),
            db.posts.where("author").equals(username ?? "").toArray()
        ]);
        setPosts([...buffered, ...saved].sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime()));
    }

    useEffect(()=>{
        bridge.exec(storyInit,3, new Map(), init);
    },[username])

    return (
            <div className={styles.container}>
                {posts.map((v,i)=>(
                    <Post showAuthor={"subforum"} id={v.id} key={i} post={v} />
                ))}
                <Spinner />
            </div>
    );
}
