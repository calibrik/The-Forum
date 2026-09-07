import { useEffect, useLayoutEffect, useRef, useState, type FC, type FocusEvent } from "react";
import { Terminal as TerminalIcon } from "../components/Icons";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { useNavigate, useSearchParams } from "react-router";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import systemStyles from "../scss/systemApp.module.scss";
import styles from "../scss/vim.module.scss";
import { useUserState } from "../providers/UserAuth";
import { commonPrefixLength, getContainerCharCapacity } from "../utils";

export const Vim: FC = () => {
    const typingBox = useRef<ITypingTextBoxHandle>(null);
    const narrationBox = useRef<ITypingTextBoxHandle>(null);
    const inputRef = useRef<InputFieldHandle>(null);
    const bufferTypingBox = useRef<ITypingTextBoxHandle>(null);
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
        const charsTyped = commonPrefixLength(bufferTypingBox.current?.getContent() ?? "", text);
        inputRef.current?.setStringToType(text, charsTyped);
    }

    function setTextToType(text: string) {
        if (text !== "") {
            textToType.current = text;
            setHasTextToType(true);
        } else {
            const content = inputRef.current?.getInput() ?? "";
            bufferTypingBox.current?.setContent(content);
            updateCounts(content);
            setHasTextToType(false);
        }
    }

    function calculateNumeratedLines() {
        if (!bufferRef.current)
            return;
        let content = "";
        if (hasTextToType)
            content = inputRef.current?.getInput() ?? "";
        else
            content = bufferTypingBox.current?.getContent() ?? "";

        const containerCapacity = getContainerCharCapacity(bufferRef.current)
        if (content == "") {
            setNumeratedLines(["1"]);
            setTildeCount(Math.max(containerCapacity.rows - 1,0));
            return;
        }

        const lines = content.split("\n");
        const newNumeratedLines: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            newNumeratedLines.push((i + 1).toString());
            let count = lines[i].length;
            while (count >= containerCapacity.cols) {
                newNumeratedLines.push(" ");
                count -= containerCapacity.cols;
            }
        }
        setNumeratedLines(newNumeratedLines);
        setTildeCount(Math.max(containerCapacity.rows - newNumeratedLines.length,0));
    }

    function setVimContent(content: string) {
        bufferTypingBox.current?.setContent(content);
        calculateNumeratedLines();
        updateCounts(content);
        setHasTextToType(false);
    }

    function onInputChange() {
        calculateNumeratedLines();
        if (inputRef.current?.isStringTyped()) {
            setTextToType("");
            story.resumeStoryFromHint("vim-input");
        }
    }

    async function init() {
        // if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
        //     navigate("/");
        // }
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
        storyInit(2, [typingBox, narrationBox], init);
        story.setVimHandle({ setTextToType, setVimContent });
        setTextToType("// hey there! 👋 I read the code you sent and I found the problems - don't worry, we'll fix them together! 💪\n// since you're just starting out, I'll explain each one simply, no fancy words ✨\n//\n// 1) class vs className: you wrote class on your boxes, but that's the old HTML way. React wants className instead! I changed them all 🙈\n// 2) onclick vs onClick: same idea - it's onClick with a big O in React. I fixed the spelling everywhere (even on your Delete button)!\n// 3) small typos: postContaner, returnContaner, authorContaner, postTitel and contant were spelled wrong. they're now postContainer, returnContainer, authorContainer, postTitle and postContent 🙂\n// 4) author header order: you had them swapped - the subforum name (f/zero) goes first and the username (u/fartsniffer69) after it. I flipped them back!\n// 5) title vs post text: you put the long text in the headline and the headline inside the paragraph. I moved them where they belong 🎯\n// 6) the Delete button: yours was always visible even when the menu was closed! now it only shows after you press the ⋯ button, like a real dropdown menu 😅\n// 7) the Delete click: you wrote navigate(...) right away, so the page was sending you to the login screen all by itself! I wrapped it in an arrow function, so it only happens when you actually click Delete 🙂\n// 8) the counters: you had 3 likes and 0 views, but it's 0 likes and 3 views. I fixed the numbers!\n//\n// and here's the corrected page, with little notes on what each part does so you can learn 🚀\n// just copy it into your file and save - you got this! 💪\nimport { useState } from \"react\"; // this lets the page remember things (like an open menu)\nimport { useNavigate } from \"react-router\"; // this helps us move between pages\n\nexport const PostPage = () => {\n    const navigate = useNavigate(); // a little helper that lets us jump to other pages\n    const [isMenuOpen, setIsMenuOpen] = useState(false); // remembers if the ⋯ menu is open (it starts closed)\n\n    return (\n        <div className=\"postContainer\"> {/* the box that holds the whole post page */}\n            {/* 👉 the back button - when you click it, you go back to the previous page */}\n            <div className=\"returnContainer\">\n                <button onClick={() => navigate(-1)}>← back</button>\n            </div>\n\n            {/* 👉 who wrote the post - click the forum name or the username to visit them */}\n            <div className=\"authorContainer\">\n                <span className=\"subforumName\" onClick={() => navigate(\"/subforum/zero\")}>f/zero</span>\n                <span className=\"username\" onClick={() => navigate(\"/user/fartsniffer69\")}>u/fartsniffer69</span>\n            </div>\n\n            {/* 👉 the ⋯ menu button - click it to make the Delete option appear */}\n            <div className=\"menuWrapper\">\n                <button onClick={() => setIsMenuOpen(prev => !prev)}>⋯</button>\n                {isMenuOpen && (\n                    /* 👉 Delete - clicking it takes you to the login page (this is the trick!) */\n                    <button className=\"deleteOption\" onClick={() => navigate(\"/login?expired=true\")}>Delete</button>\n                )}\n            </div>\n\n            {/* 👉 the post title (the headline of the post) */}\n            <h1 className=\"postTitle\">fuck zero and spearhead, all my homies hate spearhead</h1>\n\n            {/* 👉 the post text (the main body of the post) */}\n            <p className=\"postContent\">zero is mid, spearhead is a scam studio ran by actual clowns. anyone who likes this game has zero iq. mods are powertripping losers who ban anyone with an opinion. delete this post, i dare u.</p>\n\n            {/* 👉 the little counters below the post */}\n            <div className=\"reactions\">\n                <span>0 likes</span>\n                <span>0 comments</span>\n                <span>3 views</span>\n            </div>\n        </div>\n    );\n};")
        // setVimContent("// hey there! 👋 I read the code you sent and I found the problems - don't worry, we'll fix them together! 💪\n// since you're just starting out, I'll explain each one simply, no fancy words ✨\n//\n// 1) class vs className: you wrote class on your boxes, but that's the old HTML way. React wants className instead! I changed them all 🙈\n// 2) onclick vs onClick: same idea - it's onClick with a big O in React. I fixed the spelling everywhere (even on your Delete button)!\n// 3) small typos: postContaner, returnContaner, authorContaner, postTitel and contant were spelled wrong. they're now postContainer, returnContainer, authorContainer, postTitle and postContent 🙂\n// 4) author header order: you had them swapped - the subforum name (f/zero) goes first and the username (u/fartsniffer69) after it. I flipped them back!\n// 5) title vs post text: you put the long text in the headline and the headline inside the paragraph. I moved them where they belong 🎯\n// 6) the Delete button: yours was always visible even when the menu was closed! now it only shows after you press the ⋯ button, like a real dropdown menu 😅\n// 7) the Delete click: you wrote navigate(...) right away, so the page was sending you to the login screen all by itself! I wrapped it in an arrow function, so it only happens when you actually click Delete 🙂\n// 8) the counters: you had 3 likes and 0 views, but it's 0 likes and 3 views. I fixed the numbers!\n//\n// and here's the corrected page, with little notes on what each part does so you can learn 🚀\n// just copy it into your file and save - you got this! 💪\nimport { useState } from \"react\"; // this lets the page remember things (like an open menu)\nimport { useNavigate } from \"react-router\"; // this helps us move between pages\n\nexport const PostPage = () => {\n    const navigate = useNavigate(); // a little helper that lets us jump to other pages\n    const [isMenuOpen, setIsMenuOpen] = useState(false); // remembers if the ⋯ menu is open (it starts closed)\n\n    return (\n        <div className=\"postContainer\"> {/* the box that holds the whole post page */}\n            {/* 👉 the back button - when you click it, you go back to the previous page */}\n            <div className=\"returnContainer\">\n                <button onClick={() => navigate(-1)}>← back</button>\n            </div>\n\n            {/* 👉 who wrote the post - click the forum name or the username to visit them */}\n            <div className=\"authorContainer\">\n                <span className=\"subforumName\" onClick={() => navigate(\"/subforum/zero\")}>f/zero</span>\n                <span className=\"username\" onClick={() => navigate(\"/user/fartsniffer69\")}>u/fartsniffer69</span>\n            </div>\n\n            {/* 👉 the ⋯ menu button - click it to make the Delete option appear */}\n            <div className=\"menuWrapper\">\n                <button onClick={() => setIsMenuOpen(prev => !prev)}>⋯</button>\n                {isMenuOpen && (\n                    /* 👉 Delete - clicking it takes you to the login page (this is the trick!) */\n                    <button className=\"deleteOption\" onClick={() => navigate(\"/login?expired=true\")}>Delete</button>\n                )}\n            </div>\n\n            {/* 👉 the post title (the headline of the post) */}\n            <h1 className=\"postTitle\">fuck zero and spearhead, all my homies hate spearhead</h1>\n\n            {/* 👉 the post text (the main body of the post) */}\n            <p className=\"postContent\">zero is mid, spearhead is a scam studio ran by actual clowns. anyone who likes this game has zero iq. mods are powertripping losers who ban anyone with an opinion. delete this post, i dare u.</p>\n\n            {/* 👉 the little counters below the post */}\n            <div className=\"reactions\">\n                <span>0 likes</span>\n                <span>0 comments</span>\n                <span>3 views</span>\n            </div>\n        </div>\n    );\n};")
        const observer = new ResizeObserver(calculateNumeratedLines);
        observer.observe(bufferRef.current!);
        return () => {
            story.setVimHandle(undefined);
            observer.disconnect()
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
                            <div className={styles.bufferGutter} aria-hidden>
                                {Array.from(numeratedLines).map((v,i) => (
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
                                <InputField typeSpeed={10} ref={inputRef} scripted textarea rows={1} onChange={onInputChange} cursorType="terminal" name="command" type="text" className={`${styles.bufferInput} ${hasTextToType ? "" : styles.hidden}`} />
                                <TypingTextBox ref={bufferTypingBox} type="terminal" className={`${styles.bufferContent} ${hasTextToType ? styles.hidden : ""}`} />
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
                        <TypingTextBox ref={typingBox} className={styles.commandLineBox} type={"terminal"} />
                    </div>
                </div>
            </div>
        </>
    );
};
