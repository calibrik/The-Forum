import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Cursor, type ICursorHandle } from "./Cursor";
import { useGSAP } from "@gsap/react";
import type { IStoryLine } from "../backend/db";
import gsap from 'gsap';
import styles from "../scss/typingTextBox.module.scss";

interface ITypingTextBoxProps {
    type: "terminal" | "normal",
    className?: string,
    id?:string
};
export interface ITypingTextBoxHandle {
    getTimeline: (stl: IStoryLine) => gsap.core.Timeline
    setCursorType:(type: "terminal" | "normal")=>void
};

export const TypingTextBox = forwardRef<ITypingTextBoxHandle, ITypingTextBoxProps>((props, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP(() => { }, [divRef]);
    const contentRef = useRef<string>("");
    const cursorRef=useRef<ICursorHandle>(null);

    const getTimeline = contextSafe((stl: IStoryLine) => {
        let content = contentRef.current + (stl.delim ?? "") + stl.content;
        contentRef.current=content;
        return gsap.timeline()
            .set('#cursor', {
                visibility: 'visible'
            })
            .to(`#typingText`, {
                duration: (stl.content.length * stl.speed) / 1000,
                text: {
                    value: content,
                    type: "diff",
                    preserveSpaces: true
                },
                ease: "none"
            })
            .set('#cursor, #typingText', {
                clearProps: "all",
            })
    });

    useImperativeHandle(ref, () => ({
        getTimeline,
        setCursorType(type) {
            cursorRef.current?.setType(type);
        },
    }))

    useEffect(()=>{
        contentRef.current="";
        return ()=>{
            contentRef.current="";
        }
    },[])

    return (
        <div ref={divRef} id={props.id} className={props.className??styles.default}><span id="typingText"></span><Cursor ref={cursorRef} type={props.type} /></div>
    );
});
