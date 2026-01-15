import { useState, type FC } from "react";
import { BaseButton } from "./BaseButton";
import { HeartFill, Heart, CommentIcon } from "./Icons";
import styles from "../scss/reactions.module.scss";
interface IReactionsProps { };
interface ILikeButtonProps { };

export const LikeButton: FC<ILikeButtonProps> = (_) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);

    return (
        <BaseButton onClick={() => setIsLiked((p) => !p)} icon={isLiked ? <HeartFill className={styles.iconLiked} /> : <Heart />} iconPos="start" className={`${styles.reactionButton} ${isLiked ? styles.liked : ""}`}>1.8k</BaseButton>
    );
}
export const Reactions: FC<IReactionsProps> = (_) => {


    return (
        <div className={styles.reactionsContainer}>
            <LikeButton />
            <BaseButton icon={<CommentIcon />} iconPos="start" className={styles.reactionButton}>1.8k</BaseButton>
            <span className={styles.views}>100.1k views</span>
        </div>
    );
}
