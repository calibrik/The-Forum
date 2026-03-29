import { useState, type FC } from "react";
import { BaseButton } from "./BaseButton";
import { HeartFill, Heart, CommentIcon } from "./Icons";
import styles from "../scss/reactions.module.scss";
interface IReactionsProps {
    likes:number
    comments:number
    views:number
 };
interface ILikeButtonProps {
    likes:number
 };

export const LikeButton: FC<ILikeButtonProps> = (props) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);

    function onClick(e?: React.MouseEvent<HTMLButtonElement>) {
        e?.stopPropagation();
        setIsLiked((p) => !p)
    }

    const likes=props.likes>999?`${(props.likes/1000).toFixed(1)}k`:props.likes.toString();

    return (
        <BaseButton onClick={onClick} icon={isLiked ? <HeartFill className={styles.iconLiked} /> : <Heart />} iconPos="start" className={`${styles.reactionButton} ${isLiked ? styles.liked : ""}`}>{likes}</BaseButton>
    );
}
export const Reactions: FC<IReactionsProps> = (props) => {
    const comments=props.comments>999?`${(props.comments/1000).toFixed(1)}k`:props.comments.toString();
    const views=props.views>999?`${(props.views/1000).toFixed(1)}k`:props.views.toString();

    return (
        <div className={styles.reactionsContainer}>
            <LikeButton likes={props.likes}/>
            <BaseButton icon={<CommentIcon />} iconPos="start" className={styles.reactionButton}>{comments}</BaseButton>
            <span className={styles.views}>{views} views</span>
        </div>
    );
}
