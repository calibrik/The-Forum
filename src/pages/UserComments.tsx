import { useEffect, type FC } from "react";
import styles from "../scss/userCommentsPage.module.scss";
import { Comment } from "../components/Comment";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
interface IUserCommentsProps { };

export const UserComments: FC<IUserCommentsProps> = (_) => {
    const storyInit = useStoryInit();

    useEffect(() => {
        storyInit(2, []);
    }, [])

    return (
        <div className={styles.container}>
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Spinner />
        </div>
    );
}
