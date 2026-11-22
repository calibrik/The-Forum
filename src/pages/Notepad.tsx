import { useEffect, type FC } from "react";
import { Notepad as NotepadIcon } from "../components/Icons";
import styles from "../scss/systemApp.module.scss";
import { useStoryInit } from "../hooks/useStoryInit";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { useUserState } from "../providers/UserAuth";
import { useNavigate } from "react-router";
import { useStory } from "../providers/StoryProvider";

interface INotepadProps { }

export const Notepad: FC<INotepadProps> = () => {
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
    const storyInit = useStoryInit();
    const userState = useUserState();
    let navigate = useNavigate();
    const { t } = useStory();


    function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/");
            return;
        }
    }

    useEffect(() => {
        storyInit(1, getTypingBoxes(), init);
    }, [])

    return (
        <div id="container" className={styles.container}>
            <div id="appContainer" className={styles.appContainer}>
                <div id="dissapear" className={styles.headerDiv}>
                    <NotepadIcon className={styles.icon} />
                    <span className={styles.appLabel}>{t("notepad.title")}</span>
                </div>
                <div id="dissapear" className={styles.actionsDiv}>
                    <span className={styles.action}>{t("notepad.file")}</span>
                    <span className={styles.action}>{t("notepad.edit")}</span>
                    <span className={styles.action}>{t("notepad.view")}</span>
                </div>
                <div id="contentDiv" className={styles.contentDiv}>
                    <TypingTextBox id="textBox" ref={setTypingBox("nar1")} className={styles.contentNotepad} type={"normal"} />
                </div>
            </div>
        </div>
    );
}
