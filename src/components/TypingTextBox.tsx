import { forwardRef, useImperativeHandle, useRef } from "react";
import { Cursor, type ICursorHandle } from "./Cursor";
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import styles from "../scss/typingTextBox.module.scss";
import { audioPlayer, type TSoundName } from "../misc/AudioPlayer";

export const TYPING_SPEEDS = {
    fast: { msPerChar: 60, sfx: "typingFast" },
    slow: { msPerChar: 140, sfx: "typingSlow" },
    superSlow: { msPerChar: 670, sfx: "typingSuperSlow" },
} as const satisfies Record<string, { msPerChar: number, sfx: TSoundName }>;

export type TTypingSpeed = keyof typeof TYPING_SPEEDS;

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
    speed: TTypingSpeed,
    delim?: string,
    clearAfter?: string
    hideCursorAfter?: boolean
    clearBefore?: boolean
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
    const cursorRef = useRef<ICursorHandle>(null);
    const typingTextRef = useRef<HTMLSpanElement>(null);
    const typingSfx = useRef<HTMLAudioElement>(undefined);

    function stopTypingSfx() {
        typingSfx.current?.pause();
        typingSfx.current = undefined;
    }

    const getTypingTimeline = contextSafe((args: ITypingBoxArgs) => {
        const tl = gsap.timeline();
        if (args.clearBefore)
            tl.add(reset());
        const added = (args.delim ?? "") + args.content;
        const { msPerChar, sfx } = TYPING_SPEEDS[args.speed];
        const counter = { i: 0 };
        let written = 0;
        tl.set(divRef.current, {
            display: "block"
        });
        tl.set('#cursor', {
            visibility: 'visible'
        })
            .to(counter, {
                i: added.length,
                duration: (added.length * msPerChar) / 1000,
                ease: "none",
                onStart: () => {
                    typingSfx.current = audioPlayer.playSfx(sfx, 0.5, true);
                },
                onComplete: stopTypingSfx,
                onInterrupt: stopTypingSfx,
                onUpdate: () => {
                    const count = Math.floor(counter.i);
                    if (count > written) {
                        typingTextRef.current!.textContent = (typingTextRef.current!.textContent ?? "") + added.slice(written, count);
                        written = count;
                    }
                }
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
        const counter = { i: 0 };
        let removed = 0;
        tl.set(divRef.current, {
            display: "block"
        });
        tl.set('#cursor', {
            visibility: 'visible'
        })
            .to(counter, {
                i: args.symbolsCount,
                duration: (args.symbolsCount * args.speed) / 1000,
                ease: "none",
                onUpdate: () => {
                    const count = Math.floor(counter.i);
                    const toRemove = count - removed;
                    if (toRemove > 0) {
                        const text = typingTextRef.current!.textContent ?? "";
                        typingTextRef.current!.textContent = text.slice(0, Math.max(text.length - toRemove, 0));
                        removed = count;
                    }
                }
            });
        return tl;
    });

    const reset = contextSafe(() => {
        return gsap.timeline()
            .add(() => {
                stopTypingSfx();
                typingTextRef.current!.textContent = "";
            })
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
            if (typingTextRef.current)
                typingTextRef.current.textContent = content;
            props.onContentSet?.(content);
        },
        getContent() {
            return typingTextRef.current?.textContent ?? "";
        },
    }))

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

export function useTypingBoxes() {
    const typingBoxes = useRef<Map<string, ITypingTextBoxHandle>>(new Map());

    function setTypingBox(key: string) {
        return (ref: ITypingTextBoxHandle | null) => {
            if (ref) {
                typingBoxes.current.set(key, ref);
            }
            else {
                typingBoxes.current.delete(key);
            }
        }
    }

    function getTypingBoxes() {
        return typingBoxes.current;
    }

    return { setTypingBox, getTypingBoxes };
}

