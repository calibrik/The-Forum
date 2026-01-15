import type { FC } from "react";
import styles from "../scss/comment.module.scss";
import { SMEntry } from "./SMEntry";
import { LikeButton } from "./Reactions";
interface ICommentProps { };

export const Comment: FC<ICommentProps> = (_) => {
    return (
        <div className={styles.container}>
            <SMEntry name={"user"} type={"user"} />
            <p className={styles.comment}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. </p>
            <div>
                <LikeButton />
            </div>
        </div>
    );
}
