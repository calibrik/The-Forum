import { useCallback, useEffect, useRef, useState, type FC, type FocusEvent } from "react";
import { Terminal as TerminalIcon } from "../components/Icons";
import { Textarea } from "../components/Textarea";
import { type IInputFieldHandle } from "../components/InputField";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { useNavigate, useSearchParams } from "react-router";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import systemStyles from "../scss/systemApp.module.scss";
import styles from "../scss/vim.module.scss";
import { useUserState } from "../providers/UserAuth";
import { commonPrefixLength, getContainerCharCapacity } from "../utils";

export const Vim: FC = () => {
    const inputRef = useRef<IInputFieldHandle>(null);
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
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
    const bufferRef = useRef<HTMLDivElement>(null);
    const textToType = useRef<string>("")
    const [numeratedLines, setNumeratedLines] = useState<string[]>(["1"]);
    const [tildeCount, setTildeCount] = useState<number>(0);

    function updateCounts(content: string) {
        setLineCount(content === "" ? 0 : content.split("\n").length);
        setByteCount(content.length);
    }

    function applyTextToType(text: string) {
        const charsTyped = commonPrefixLength(getTypingBoxes().get("buffer")?.getContent() ?? "", text);
        inputRef.current?.setStringToType(text, charsTyped);
    }

    function setTextToType(text: string) {
        if (text !== "") {
            const content = getTypingBoxes().get("buffer")?.getContent() ?? "";
            textToType.current = content+text;
            setHasTextToType(true);
        } else {
            const content = inputRef.current?.getInput() ?? "";
            getTypingBoxes().get("buffer")?.setContent(content);
            updateCounts(content);
            setHasTextToType(false);
        }
    }

    const calculateNumeratedLines = useCallback(() => {
        if (!bufferRef.current)
            return;
        let content = "";
        if (hasTextToType)
            content = inputRef.current?.getInput() ?? "";
        else
            content = getTypingBoxes().get("buffer")?.getContent() ?? "";

        const containerCapacity = getContainerCharCapacity(bufferRef.current)
        if (content == "") {
            setNumeratedLines(["1"]);
            setTildeCount(Math.max(containerCapacity.rows - 1, 0));
            return;
        }

        const lines = content.split("\n");
        const newNumeratedLines: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            newNumeratedLines.push((i + 1).toString());
            let count = lines[i].length;
            if (i == lines.length - 1)
                count++;
            while (count > containerCapacity.cols) {
                newNumeratedLines.push(" ");
                count -= containerCapacity.cols;
            }
        }
        setNumeratedLines(newNumeratedLines);
        setTildeCount(Math.max(containerCapacity.rows - newNumeratedLines.length, 0));
    }, [hasTextToType]);

    function onBufferContentSet(content: string) {
        calculateNumeratedLines();
        updateCounts(content);
    }

    function onInputChange() {
        calculateNumeratedLines();
        if (inputRef.current?.isStringTyped()) {
            setTextToType("");
            story.resumeStoryFromHint("vim-input");
        }
    }

    async function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/");
        }
        await document.fonts.ready;
        calculateNumeratedLines();
    }

    function onContainerBlur(e: FocusEvent<HTMLDivElement>) {
        const target = e.relatedTarget;
        if ((target === null || !e.currentTarget.contains(target as Node)) && hasTextToType)
            inputRef.current?.focus();
    }

    useEffect(() => {
        if (hasTextToType) {
            applyTextToType(textToType.current);
            inputRef.current?.focus();
        }
    }, [hasTextToType]);

    useEffect(() => {
        if (!bufferRef.current)
            return;
        const observer = new ResizeObserver(calculateNumeratedLines);
        observer.observe(bufferRef.current);
        return () => observer.disconnect();
    }, [calculateNumeratedLines]);

    useEffect(() => {
        storyInit(2, getTypingBoxes(), init);
        story.setVimHandle({ setTextToType });
        return () => {
            story.setVimHandle(undefined);
        };
    }, []);

    return (
        <>
            <TypingTextBox ref={setTypingBox("nar1")} type="terminal" />
            <div className={systemStyles.container} onBlur={onContainerBlur}>
                <div className={systemStyles.appContainer}>
                    <div className={systemStyles.headerDiv}>
                        <TerminalIcon className={systemStyles.icon} />
                        <span className={systemStyles.appLabel}>vim - {fileName}</span>
                    </div>
                    <div ref={editorRef} className={styles.editorArea}>
                        <div className={styles.buffer}>
                            <div className={styles.bufferGutter} aria-hidden>
                                {Array.from(numeratedLines).map((v, i) => (
                                    <div key={`nl-${i}`} className={styles.line}>
                                        <span className={styles.numLine}>{v}</span>
                                    </div>
                                ))}
                                {Array.from(Array(tildeCount).keys()).map(i => (
                                    <div key={`tilde-${i}`} className={styles.line}>
                                        <span className={styles.tilde}>~</span>
                                    </div>
                                ))}
                            </div>
                            <div ref={bufferRef} className={styles.bufferText}>
                                <Textarea typeSpeed={10} ref={inputRef} scripted onChange={onInputChange} cursorType="terminal" name="command" className={`${styles.bufferInput} ${hasTextToType ? "" : styles.hidden}`} />
                                <TypingTextBox ref={setTypingBox("buffer")} type="terminal" className={`${styles.bufferContent} ${hasTextToType ? styles.hidden : ""}`} onContentSet={onBufferContentSet} />
                            </div>

                        </div>
                    </div>
                    <div className={styles.statusBar}>
                        <span className={hasTextToType ? styles.insertMode : ""}>
                            {hasTextToType ? "-- INSERT --" : `"${fileName}" ${lineCount}L, ${byteCount}B`}
                        </span>
                        <span>1,1  All</span>
                    </div>
                    <div className={styles.commandLineRow}>
                        <TypingTextBox ref={setTypingBox("command")} className={styles.commandLineBox} type={"terminal"} />
                    </div>
                </div>
            </div>
        </>
    );
};
