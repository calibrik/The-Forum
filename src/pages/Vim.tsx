import { useEffect, useRef, useState, type FC, type FocusEvent } from "react";
import { Terminal as TerminalIcon } from "../components/Icons";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { useNavigate, useSearchParams } from "react-router";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import systemStyles from "../scss/systemApp.module.scss";
import styles from "../scss/vim.module.scss";
import { useUserState } from "../providers/UserAuth";
import { commonPrefixLength } from "../utils";

const TILDE_FILL = 0;

const tildeRows = Array.from(Array(TILDE_FILL).keys());

export const Vim: FC = () => {
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const narrationBox = useRef<ITypingTextBoxHandle>(null);
    const inputRef = useRef<InputFieldHandle>(null);
    const bufferBox = useRef<ITypingTextBoxHandle>(null);
    const storyInit = useStoryInit();
    const story = useStory();
    const navigate = useNavigate();
    const userState = useUserState();
    const [searchParams] = useSearchParams();
    const fileName = searchParams.get("file") ?? "The-Forum.txt";
    const [hasTextToType, setHasTextToType] = useState<boolean>(false);
    const [lineCount, setLineCount] = useState<number>(0);
    const [byteCount, setByteCount] = useState<number>(0);
    const editorRef = useRef<HTMLDivElement>(null);

    function updateCounts(content: string) {
        setLineCount(content === "" ? 0 : content.split("\n").length);
        setByteCount(content.length);
    }

    function applyTextToType(text: string) {
        const charsTyped = commonPrefixLength(bufferBox.current?.getContent() ?? "", text);
        inputRef.current?.setStringToType(text, charsTyped);
    }

    function setTextToType(text: string) {
        if (text !== "") {
            applyTextToType(text);
            setHasTextToType(true);
        } else {
            const content = inputRef.current?.getInput() ?? "";
            bufferBox.current?.setContent(content);
            updateCounts(content);
            setHasTextToType(false);
        }
    }

    function setVimContent(content: string) {
        bufferBox.current?.setContent(content);
        updateCounts(content);
        setHasTextToType(false);
    }

    function onInputChange() {
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
        if (hasTextToType)
            inputRef.current?.focus();
    }, [hasTextToType]);

    useEffect(() => {
        storyInit(2, [typingBox, narrationBox], init);
        story.setVimHandle({ setTextToType, setVimContent });
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
                        <InputField typeSpeed={10} ref={inputRef} scripted textarea rows={1} onChange={onInputChange} cursorType="terminal" name="command" type="text" className={`${styles.bufferInput} ${hasTextToType ? "" : styles.hidden}`} />
                        <TypingTextBox ref={bufferBox} type="terminal" className={`${styles.bufferContent} ${hasTextToType ? styles.hidden : ""}`} />
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
