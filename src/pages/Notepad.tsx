import { useEffect, useRef, type FC } from "react";
import { Notepad as NotepadIcon } from "../components/Icons";
import styles from "../scss/systemApp.module.scss";
import { useStory } from "../providers/StoryProvider";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useUserState } from "../providers/UserAuth";
import { useNavigate } from "react-router";
import { db } from "../backend/db";

interface INotepadProps { }

export const Notepad: FC<INotepadProps> = () => {
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const story = useStory();
    const userState = useUserState();
    let navigate = useNavigate();

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/");
            return;
        }
        let scl = await db.story.get(userState.storyId.current);
        if (!scl || scl.where != window.location.pathname) {
            navigate(scl?.where ?? "/");
            return;
        }
        story.setTypingBoxes([typingBox]);
        story.showStory(userState.storyId.current);
    }

    useEffect(() => {
        init();
        return()=>{
            story.resetTypingBoxes();
        }
    }, [])

    return (
        <div id="container" className={styles.container}>
            <div id="appContainer" className={styles.appContainer}>
                <div id="dissapear" className={styles.headerDiv}>
                    <NotepadIcon className={styles.icon} />
                    <span className={styles.appLabel}>Notepad</span>
                </div>
                <div id="dissapear" className={styles.actionsDiv}>
                    <span className={styles.action}>File</span>
                    <span className={styles.action}>Edit</span>
                    <span className={styles.action}>View</span>
                </div>
                <div id="contentDiv" className={styles.contentDiv}>
                    <TypingTextBox id="textBox" ref={typingBox} className={styles.contentNotepad} type={"normal"} />
                </div>
            </div>
        </div>
    );
}
