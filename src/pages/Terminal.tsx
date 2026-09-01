import { useEffect, useRef, useState, type FC, type FocusEvent, type FormEvent } from "react";
import { Terminal as TerminalIcon } from "../components/Icons";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { useUserState } from "../providers/UserAuth";
import { useNavigate } from "react-router";
import systemStyles from "../scss/systemApp.module.scss";
import styles from "../scss/terminal.module.scss";

type HistoryEntry =
    | { type: "cmd"; command: string }
    | { type: "out"; text: string };

export const Terminal: FC = () => {
    const inputRef = useRef<InputFieldHandle>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const storyInit = useStoryInit();
    const story = useStory();
    const userState = useUserState();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [objectiveHint, setObjectiveHint] = useState<string>("");
    const expectedCommand = useRef<string>("");
    const expectedOutput = useRef<string>("");

    const username = userState.userLoggedIn.current || "guest";
    const userPart = `${username}@the-forum`;
    const pathPart = ":~";
    const dollarPart = "$";

    function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/");
        }
    }

    useEffect(() => {
        storyInit(1, [typingBox], init);
        story.setTerminalHandle({
            setExpectedCommand: function (command: string, output?: string): void {
                expectedCommand.current = command;
                expectedOutput.current = output ?? "";
            },
        });
        return () => {
            story.setTerminalHandle(undefined);
        };
    }, []);

    useEffect(() => {
        function onStoryHintText(e: Event) {
            setObjectiveHint((e as CustomEvent<string>).detail);
        }
        window.addEventListener("storyHintText", onStoryHintText);
        return () => {
            window.removeEventListener("storyHintText", onStoryHintText);
        };
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function onContainerBlur(e: FocusEvent<HTMLDivElement>) {
        const target = e.relatedTarget;
        if (target === null || !e.currentTarget.contains(target as Node))
            inputRef.current?.focus();
    }

    useEffect(() => {
        outputRef.current?.scrollTo?.(0, outputRef.current.scrollHeight);
    }, [history]);

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inputRef.current)
            return;
        const cmd = inputRef.current.getInput();
        e.currentTarget.reset();
        if (cmd === "")
            return;
        const expectedCmd = expectedCommand.current;
        let output: string;
        if (cmd === "help") {
            output = objectiveHint !== ""
                ? `Current objective: ${objectiveHint}`
                : "No current objective.";
        }
        else if (expectedCmd !== "" && cmd === expectedCmd) {
            output = expectedOutput.current;
            story.resumeStoryFromHint("terminal-input");
        }
        else {
            output = `bash: ${cmd}: command not found`;
        }
        setHistory(h => [...h, { type: "cmd", command: cmd }, { type: "out", text: output }]);
    }

    return (
        <>
            <TypingTextBox ref={typingBox} type="terminal" />
            <div className={systemStyles.container} onBlur={onContainerBlur}>
                <div className={systemStyles.appContainer}>
                    <div className={systemStyles.headerDiv}>
                        <TerminalIcon className={systemStyles.icon} />
                        <span className={systemStyles.appLabel}>Terminal</span>
                    </div>
                    <div className={styles.body}>
                        <div ref={outputRef} className={styles.output}>
                            <div className={styles.outputLine}>Type "help" to find out the current objective.</div>
                            {history.map((entry, index) => (
                                entry.type === "cmd" ? (
                                    <div key={index} className={styles.outputLine}>
                                        <span className={styles.promptUser}>{userPart}</span>
                                        <span className={styles.promptPath}>{pathPart}</span>
                                        <span className={styles.promptDollar}>{dollarPart}</span>
                                        <span>{" "}{entry.command}</span>
                                    </div>
                                ) : (
                                    <div key={index} className={styles.outputLine}>{entry.text}</div>
                                )
                            ))}
                            <form className={styles.promptRow} onSubmit={onSubmit}>
                                <span className={styles.promptPrefix}>
                                    <span className={styles.promptUser}>{userPart}</span>
                                    <span className={styles.promptPath}>{pathPart}</span>
                                    <span className={styles.promptDollar}>{dollarPart}</span>
                                </span>
                                <InputField ref={inputRef} name="command" type="text" cursorType="terminal" className={styles.promptInput} />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
