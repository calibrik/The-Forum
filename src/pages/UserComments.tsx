import type { FC } from "react";
import styles from "../scss/userCommentsPage.module.scss";
import { Comment } from "../components/Comment";
import { Spinner } from "../components/Spinner";
interface IUserCommentsProps {};

export const UserComments: FC<IUserCommentsProps> = (_) => {
    return (
        <div className={styles.container}>
            <Comment/>
            <Comment/>
            <Comment/>
            <Comment/>
            <Comment/>
            <Comment/>
            <Comment/>
            <Spinner/>
        </div>
    );
}
