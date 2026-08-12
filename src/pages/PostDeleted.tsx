import { useEffect, useRef, type FC } from "react";
import styles from "../scss/postDeleted.module.scss";
import { useStoryInit } from "../providers/StoryProvider";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useUserState } from "../providers/UserAuth";
import { useNavigate } from "react-router";

interface IPostDeletedProps {};

export const PostDeleted: FC<IPostDeletedProps> = (_) => {
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const storyInit = useStoryInit();
    const userState = useUserState();
    const navigate = useNavigate();

    function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/");
        }
    }

    useEffect(() => {
        storyInit(2, [typingBox], init);
    }, []);

    return (
        <>
            <TypingTextBox ref={typingBox} type="terminal" />
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Post deleted</h1>
                    <p className={styles.message}>This post has been removed by the moderator.</p>
                </div>
            </div>
        </>
    );
};
