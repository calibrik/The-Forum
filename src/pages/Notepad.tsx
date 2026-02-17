import { useEffect, useRef, type FC } from "react";
import { Notepad as NotepadIcon } from "../components/Icons";
import styles from "../scss/systemApp.module.scss";
import { useScriptTools } from "../backend/backend";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";

interface INotepadProps { }

export const Notepad: FC<INotepadProps> = () => {
    const typingBox=useRef<ITypingTextBoxHandle>(null);
    const {showStory}=useScriptTools(typingBox);

    useEffect(()=>{
        showStory(1);
    },[])

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
                    <TypingTextBox id="textBox" ref={typingBox} className={styles.contentNotepad} type={"normal"}/>
                </div>
            </div>
        </div>
    );
}
