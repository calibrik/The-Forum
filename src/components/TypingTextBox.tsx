import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Cursor, type ICursorHandle } from "./Cursor";
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import styles from "../scss/typingTextBox.module.scss";

interface ITypingTextBoxProps {
    type: "terminal" | "normal",
    className?: string,
    id?: string
    content?: string
    addDefaultClass?: boolean
};

export interface ITypingBoxArgs {
    content: string,
    speed: number,
    delim?: string,
    clearAfter?: string
}

export interface ITypingTextBoxHandle {
    getTimeline: (args:ITypingBoxArgs) => gsap.core.Timeline
    setCursorType: (type: "terminal" | "normal") => void
    reset: () => void
};

export const TypingTextBox = forwardRef<ITypingTextBoxHandle, ITypingTextBoxProps>((props, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP(() => { }, [divRef]);
    const contentRef = useRef<string>("");
    const cursorRef = useRef<ICursorHandle>(null);

    const getTimeline = contextSafe((args:ITypingBoxArgs) => {
        let finContent = contentRef.current + (args.delim ?? "") + args.content;
        contentRef.current = finContent;
        const tl = gsap.timeline()
            .set('#cursor', {
                visibility: 'visible'
            })
            .to(`#typingText`, {
                duration: ((args.content.length + (args.delim?.length ?? 0)) * args.speed) / 1000,
                text: {
                    value: finContent,
                    type: "diff",
                    preserveSpaces: true
                },
                ease: "none"
            });
        // .set('#cursor, #typingText', {
        //     clearProps: "all",
        // })
        if (args.clearAfter) {
            contentRef.current = "";
            tl.set("#typingText", {
                text: ""
            }, args.clearAfter)
                .set('#cursor, #typingText', {
                    clearProps: "all",
                });
        }
        return tl;
    });

    const reset = contextSafe(() => {
        return gsap.timeline()
            .set('#cursor, #typingText', {
                clearProps: "all",
            })
            .set("#typingText", {
                text: ""
            });
    })

    useImperativeHandle(ref, () => ({
        getTimeline,
        setCursorType(type) {
            cursorRef.current?.setType(type);
        },
        reset: reset
    }))

    useEffect(() => {
        contentRef.current = "";
        return () => {
            contentRef.current = "";
        }
    }, [])

    let className: string;
    if (props.addDefaultClass)
        className = `${styles.default} ${props.className}`;
    else
        className = props.className ?? styles.default;

    return (
        <div ref={divRef} id={props.id} className={className}><span id="typingText">{props.content}</span><Cursor ref={cursorRef} type={props.type} /></div>
    );
});
