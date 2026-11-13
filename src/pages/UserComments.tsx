import { useEffect, useState, type FC } from "react";
import styles from "../scss/userCommentsPage.module.scss";
import { Comment } from "../components/Comment";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { bridge } from "../misc/utils";
import { useParams } from "react-router";
import { db, type IComment, type IPost } from "../misc/db";
interface IUserCommentsProps { };

export const UserComments: FC<IUserCommentsProps> = (_) => {
    const storyInit = useStoryInit();
    const {username}=useParams<{username:string}>();
    const [comments,setComments]=useState<IComment[]>([])

    async function init(){
        const postsMap=new Map<string, IPost>();
        const postsPerm=await db.posts.toArray();
        const postsBuffer=await db.postsBuffer.toArray();
        for (const post of postsPerm){
            postsMap.set(post.id,post);
        }
        for (const post of postsBuffer){
            postsMap.set(post.id,post);
        }
        const posts=Array.from(postsMap.values());
        let comments:IComment[]=[];
        for (const post of posts){
            comments=[...comments,...post.commentsDetailed.filter((c)=>c.author==username)]
        }
        setComments(comments);
    }

    useEffect(() => {
        bridge.exec(storyInit,3, new Map(),init);
    }, [username])

    return (
        <div className={styles.container}>
            {comments.map((c,i)=>(
                <Comment key={i} author={c.author} content={c.content} likes={c.likes} />
            ))}
            <Spinner/>
        </div>
    );
}
