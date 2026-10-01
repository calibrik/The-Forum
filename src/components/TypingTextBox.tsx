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
    style?: React.CSSProperties
    onContentSet?: (content: string) => void
};

export interface ITypingBoxArgs {
    content: string,
    speed: number,
    delim?: string,
    clearAfter?: string
    hideCursorAfter?: boolean
    clearBefore?: boolean
    style?: React.CSSProperties
}

export interface ITypingBoxDeleteArgs {
    symbolsCount: number,
    speed: number,
}

export interface ITypingTextBoxHandle {
    getTypingTimeline: (args: ITypingBoxArgs) => gsap.core.Timeline
    getDeleteTimeline: (args: ITypingBoxDeleteArgs) => gsap.core.Timeline
    setCursorType: (type: "terminal" | "normal") => void
    reset: () => gsap.core.Timeline
    applyStyle: (style: React.CSSProperties) => void
    setContent: (content: string) => void
    getContent: () => string
};

export const TypingTextBox = forwardRef<ITypingTextBoxHandle, ITypingTextBoxProps>((props, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: divRef });
    const contentRef = useRef<string>("");
    const cursorRef = useRef<ICursorHandle>(null);
    const typingTextRef = useRef<HTMLSpanElement>(null);

    const getTypingTimeline = contextSafe((args: ITypingBoxArgs) => {
        const tl = gsap.timeline();
        tl.add(()=>console.log("exec typing",args.content,props.className));
        if (args.clearBefore)
            tl.add(reset());
        const finContent = contentRef.current + (args.delim ?? "") + args.content;
        contentRef.current = finContent;
        tl.set(divRef.current, {
            display: "block"
        });
        tl.set('#cursor', {
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
        if (args.hideCursorAfter) {
            tl.set('#cursor', {
                visibility: 'hidden'
            });
        }
        if (args.clearAfter) {
            tl.add(reset(), args.clearAfter);
        }
        return tl;
    });

    const getDeleteTimeline = contextSafe((args: ITypingBoxDeleteArgs) => {
        const tl = gsap.timeline();
        const startContent = contentRef.current;
        const finContent = startContent.slice(0, startContent.length - args.symbolsCount);
        const counter = { i: startContent.length };
        contentRef.current = finContent;
        tl.set(divRef.current, {
            display: "block"
        });
        tl.set('#cursor', {
            visibility: 'visible'
        })
            .to(counter, {
                i: finContent.length,
                duration: (args.symbolsCount * args.speed) / 1000,
                ease: "none",
                onUpdate: () => { typingTextRef.current!.textContent = startContent.slice(0, counter.i); }
            });
        return tl;
    });

    const reset = contextSafe(() => {
        contentRef.current = "";
        return gsap.timeline()
            .set("#typingText", {
                text: "",
            })
            .add(() => { typingTextRef.current!.textContent = ""; })
            .set(`#cursor, #typingText`, {
                clearProps: "all",
            })
            .add(() => {
                if (divRef.current) {
                    divRef.current.style.display = "none";
                }
            })
    })

    useImperativeHandle(ref, () => ({
        getTypingTimeline,
        getDeleteTimeline,
        setCursorType(type) {
            cursorRef.current?.setType(type);
        },
        reset,
        applyStyle(style) {
            if (divRef.current) {
                divRef.current.style.cssText = Object.entries(style).map(([key, value]) => `${key}: ${value}`).join(';');
            }
        },
        setContent(content) {
            contentRef.current = content;
            if (typingTextRef.current)
                typingTextRef.current.innerText = content;
            props.onContentSet?.(content);
        },
        getContent() {
            return contentRef.current;
        },
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
        <div id={props.id} style={props.style} ref={divRef} className={className}>
            <span ref={typingTextRef} id="typingText">{props.content}</span><Cursor ref={cursorRef} type={props.type} />
        </div>
    );
});

