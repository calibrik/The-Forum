import { useEffect, useRef, useState, type FC, type FocusEvent } from "react";
import { Terminal as TerminalIcon } from "../components/Icons";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { useNavigate, useSearchParams } from "react-router";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import systemStyles from "../scss/systemApp.module.scss";
import styles from "../scss/vim.module.scss";
import { useUserState } from "../providers/UserAuth";

const TILDE_FILL = 40;

const tildeRows = Array.from(Array(TILDE_FILL).keys());

export const Vim: FC = () => {
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const narrationBox = useRef<ITypingTextBoxHandle>(null);
    const inputRef = useRef<InputFieldHandle>(null);
    const storyInit = useStoryInit();
    const story = useStory();
    const navigate = useNavigate();
    const userState = useUserState();
    const [searchParams] = useSearchParams();
    const fileName = searchParams.get("file") ?? "The-Forum.txt";
    const [typedText, setTypedText] = useState<string>("");
    const [hasTextToType, setHasTextToType] = useState<boolean>(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const lineCount = typedText === "" ? 0 : typedText.split("\n").length;
    const byteCount = typedText.length;

    function setTextToType(text: string) {
        inputRef.current?.setStringToType(text);
        setHasTextToType(text !== "");
        if (text !== "")
            inputRef.current?.focus();
    }

    function onInputChange() {
        setTypedText(inputRef.current?.getInput() ?? "");
        if (inputRef.current?.isStringTyped()) {
            setTextToType("");
            story.resumeStoryFromHint("vim-input");
        }
    }

    function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/");
        }
    }

    function onContainerBlur(e: FocusEvent<HTMLDivElement>) {
        const target = e.relatedTarget;
        if ((target === null || !e.currentTarget.contains(target as Node)) && hasTextToType)
            inputRef.current?.focus();
    }

    useEffect(() => {
        storyInit(2, [typingBox, narrationBox], init);
        story.setVimHandle({ setTextToType });
        return () => {
            story.setVimHandle(undefined);
        };
    }, []);

    return (
        <>
            <TypingTextBox ref={narrationBox} type="terminal" />
            <div className={systemStyles.container} onBlur={onContainerBlur}>
            <div className={systemStyles.appContainer}>
                <div className={systemStyles.headerDiv}>
                    <TerminalIcon className={systemStyles.icon} />
                    <span className={systemStyles.appLabel}>vim - {fileName}</span>
                </div>
                <div ref={editorRef} className={styles.editorArea}>
                    <div className={styles.buffer}>
                        <InputField ref={inputRef} scripted textarea rows={1} onChange={onInputChange} cursorType="terminal" name="command" type="text" className={styles.bufferInput} />
                        {tildeRows.map(i => (
                            <div key={`tilde-${i}`} className={styles.line}>
                                <span className={styles.tilde}>~</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.statusBar}>
                    <span className={hasTextToType ? styles.insertMode : ""}>
                        {hasTextToType ? "-- INSERT --" : `"${fileName}" ${lineCount}L, ${byteCount}B`}
                    </span>
                    <span>1,1  All</span>
                </div>
                <div className={styles.commandLineRow}>
                    <TypingTextBox ref={typingBox} className={styles.commandLineBox} type={"terminal"} />
                </div>
            </div>
            </div>
        </>
    );
};
