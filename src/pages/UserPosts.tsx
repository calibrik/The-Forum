import { useEffect, useState, type FC } from "react";
import styles from "../scss/sub-userPostsPage.module.scss"
import { Post } from "../components/Post";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { useParams } from "react-router";
import { db, type IPost } from "../backend/db";
interface IUserPostsProps { };

export const UserPosts: FC<IUserPostsProps> = (_) => {
    const storyInit=useStoryInit();
    const {username}=useParams<{username:string}>();
    const [posts,setPosts]=useState<IPost[]>([]);

    async function init(){
        setPosts(await db.posts.where("author").equals(username??"").toArray());
    }

    useEffect(()=>{
        storyInit(3,[],init);
    },[])

    return (
            <div className={styles.container}>
                {posts.map((v,i)=>(
                    <Post showAuthor={"subforum"} key={i} post={v} />
                ))}
                <Spinner />
            </div>
    );
}
