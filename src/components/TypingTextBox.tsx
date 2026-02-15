import { forwardRef, useImperativeHandle, useRef } from "react";
import { Cursor } from "./Cursor";
import { useGSAP } from "@gsap/react";
import type { StoryLine } from "../backend/db";
import styles from "../scss/typingTextBox.module.scss";
import gsap from 'gsap';

interface ITypingTextBoxProps {
    type: "terminal" | "normal"
};
export interface ITypingTextBoxHandle {
    showStoryLine: (stl: StoryLine) => Promise<void>
};

export const TypingTextBox = forwardRef<ITypingTextBoxHandle, ITypingTextBoxProps>((props, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const { contextSafe } = useGSAP(() => { }, [divRef]);

    const showStoryLine = contextSafe(async (stl: StoryLine) => {
        let content = stl.content;
        if (textRef.current?.textContent != "") {
            content = textRef.current?.textContent + "\n\n" + stl.content;
        }
        return new Promise<void>(resolve => {
            gsap.timeline({
                onComplete: resolve
            })
                .set('#cursor', {
                    visibility: 'visible'
                })
                .to(`#text`, {
                    duration: (stl.content.length * stl.speed) / 1000,
                    text: {
                        value: content,
                        type: "diff",
                        preserveSpaces: true
                    },
                    ease: "none"
                })
                .set('#cursor, #text', {
                    clearProps: "all",
                }, `+=${stl.delay}`)
        })
    });

    useImperativeHandle(ref, () => ({
        showStoryLine
    }))
    return (
        <div ref={divRef} className={styles.textDiv}><span ref={textRef} id="text" className={styles.text}></span><Cursor type={props.type} /></div>
    );
});
