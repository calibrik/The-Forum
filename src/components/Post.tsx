import { type FC } from "react";
import styles from "../scss/post.module.scss";
import { getImageUrl } from "../utils";
import { SMEntry } from "./SMEntry";
import { Reactions } from "./Reactions";
import { useNavigate } from "react-router";
import type { IPost } from "../backend/db";

interface IPostProps {
    id?:string
    post:IPost
    showAuthor:"user"|"subforum",
    className?:string
};

export const Post: FC<IPostProps> = (props) => {
    let navigate=useNavigate();
    
    const author=props.showAuthor=="subforum"?props.post.subforum:props.post.author;
    return (
        <div id={props.id} onClick={()=>navigate("/post/test")} data-istransition="true" className={`${styles.cardContainer} ${props.className}`}>
            <SMEntry isNav name={author} type={props.showAuthor} />
            <h1 className={styles.title}>{props.post.title}</h1>
            <p className={props.post.imageName ? styles.contentWithImg : styles.content}>{props.post.content}</p>
            {props.post.imageName ?
                <div className={styles.postImgWrapper}>
                    <img className={styles.postImg} src={getImageUrl(props.post.imageName)} />
                </div>
                : ""}
            <Reactions likes={props.post.likes} comments={props.post.comments} views={props.post.views} />
        </div>
    );
}
