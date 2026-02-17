import { useEffect, useRef, type FC } from "react";
import styles from '../scss/test-page.module.scss';
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useScriptTools } from "../backend/backend";



interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const typingBoxRef=useRef<ITypingTextBoxHandle>(null)
    const {showStory}=useScriptTools(typingBoxRef);

    useEffect(() => {
        showStory(1);
    }, [])

    return (
        <div>
            <div style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                <TypingTextBox className={styles.testText} ref={typingBoxRef} type={"normal"}/>
            </div>
        </div>
    );
}
