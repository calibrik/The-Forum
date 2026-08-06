import type { FC } from "react";
import styles from "../scss/comment.module.scss";
import { SMEntry } from "./SMEntry";
import { LikeButton } from "./Reactions";
interface ICommentProps { 
    author:string,
    content:string,
    likes:number
};

export const Comment: FC<ICommentProps> = (props) => {
    return (
        <div className={styles.container}>
            <SMEntry name={props.author} type={"user"} isNav={true} />
            <p className={styles.comment}>{props.content}</p>
            <div>
                <LikeButton likes={props.likes} />
            </div>
        </div>
    );
}
