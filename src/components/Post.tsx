import { useState, type FC } from "react";
import styles from "../scss/post.module.scss";
import { getImageUrl } from "../utils";
import { BaseButton } from "./BaseButton";
import { Heart, Comment, HeartFill } from "./Icons";
import { SMEntry } from "./SMEntry";
interface IPostProps {
    img?: string
    postId?: string;
};

export const Post: FC<IPostProps> = (props) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);

    return (
        <div className={styles.cardContainer}>
            <SMEntry name={"user"} type={"user"} />
            <h1 className={styles.title}>Title</h1>
            <p className={props.img ? styles.contentWithImg : styles.content}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet. Quisque ultrices porta diam egestas faucibus. Vivamus ac dapibus sem, eu pulvinar nunc. Maecenas a diam risus. Morbi molestie ac velit quis tristique. Aenean vel augue maximus, laoreet tortor nec, vulputate nulla. In sodales erat sed condimentum finibus.</p>
            {props.img ?
                <div className={styles.postImgWrapper}>
                    <img className={styles.postImg} src={getImageUrl(props.img)} />
                </div>
                : ""}
            <div className={styles.reactionsContainer}>
                <BaseButton onClick={() => setIsLiked((p) => !p)} icon={isLiked ? <HeartFill className={styles.iconLiked} /> : <Heart />} iconPos="start" className={`${styles.reactionButton} ${isLiked ? styles.liked : ""}`}>1.8k</BaseButton>
                <BaseButton icon={<Comment />} iconPos="start" className={styles.reactionButton}>1.8k</BaseButton>
                <span className={styles.views}>100.1k views</span>
            </div>
        </div>
    );
}
