import { useState, type FC } from "react";
import { BaseButton } from "./BaseButton";
import { HeartFill, Heart, CommentIcon } from "./Icons";
import styles from "../scss/reactions.module.scss";
import { numberToText } from "../utils";
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

    return (
        <BaseButton onClick={onClick} icon={isLiked ? <HeartFill className={styles.iconLiked} /> : <Heart />} iconPos="start" className={`${styles.reactionButton} ${isLiked ? styles.liked : ""}`}>{numberToText(props.likes)}</BaseButton>
    );
}
export const Reactions: FC<IReactionsProps> = (props) => {
    return (
        <div className={styles.reactionsContainer}>
            <LikeButton likes={props.likes}/>
            <BaseButton icon={<CommentIcon />} iconPos="start" className={styles.reactionButton}>{numberToText(props.comments)}</BaseButton>
            <span className={styles.views}>{numberToText(props.views)} views</span>
        </div>
    );
}
