import { useEffect, type FC } from "react";
import styles from "../scss/userCommentsPage.module.scss";
import { Comment } from "../components/Comment";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { bridge } from "../utils";
interface IUserCommentsProps { };

export const UserComments: FC<IUserCommentsProps> = (_) => {
    const storyInit = useStoryInit();

    useEffect(() => {
        bridge.exec(storyInit,3, []);
    }, [])

    return (
        <div className={styles.container}>
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Comment author={""} content={""} likes={0} />
            <Spinner />
        </div>
    );
}
