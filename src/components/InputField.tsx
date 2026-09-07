import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import styles from "../scss/inputField.module.scss";
import { Eye, EyeSlash } from "./Icons";
interface IInputFieldProps {
    type: string;
    name?: string;
    placeholder?: string;
    className?: string;
    scripted?: boolean;
    disabled?: boolean;
    onChange?: (value: string) => void | Promise<void>
    onSuggestionClick?: (name: string) => void | Promise<void>
    onFocus?: () => void | Promise<void>
    onBlur?: () => void | Promise<void>
    onKeyDown?: (e: React.KeyboardEvent) => void | Promise<void>
    icon?: ReactNode;
    id?: string
    autocomplete?: boolean
    cursorType?: "normal" | "terminal"
    textarea?: boolean
    rows?: number
    resizable?: boolean
    typeSpeed?: number
    style?:CSSProperties
};
export type InputFieldHandle = {
    setError: (msg: string) => void;
    getInput: () => string;
    getError: () => string;
    focus: () => void;
    blur: () => void;
    setStringToType: (string: string, charsTyped?: number) => void;
    isStringTyped: () => boolean;
    setInput:(value:string)=>void
}

export const InputField = forwardRef<InputFieldHandle, IInputFieldProps>((props, ref) => {
    const [errMsg, setErrMsg] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [type, setType] = useState<string>(props.type);
    const isFocused = useRef<boolean>(false);
    const placeholder = useRef<HTMLSpanElement>(null);
    const stringToType = useRef<string>("");
    const currTyped = useRef<number>(0);
    const [caretText, setCaretText] = useState<string>("");
    const [hasSelection, setHasSelection] = useState<boolean>(false);
    const isMouseDown = useRef<boolean>(false);
    const isTerminal = (props.cursorType ?? "normal") === "terminal";
    const isTextarea = props.textarea ?? false;
    const isResizable = props.resizable ?? false;

    const autoResize = useCallback(() => {
        const el = inputRef.current;
        if (!isTextarea || isResizable || !el)
            return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
        el.scrollIntoView({ block: "end" });
    }, [isTextarea, isResizable]);

    const updateCaretPosition = useCallback(() => {
        const input = inputRef.current;
        if (!input || !isTerminal || input.disabled)
            return;
        setHasSelection(input.selectionStart !== input.selectionEnd);
        const caret = input.selectionStart ?? input.value.length;
        setCaretText(input.value.substring(0, caret));
    }, [isTerminal]);

    function onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (props.scripted) {
            return;
        }
        let value = event.target.value ?? "";
        setErrMsg("");
        updateCaretPosition();
        autoResize();
        if (stringToType.current != "") {
            event.preventDefault();
        }
        if (props.onChange) {
            props.onChange(value);
            return;
        }
    }

    useEffect(() => {
        if (props.scripted)
            inputRef.current!.disabled = true;
        const form = inputRef.current?.form;
        if (form) {
            form.addEventListener("reset", onReset);
        }
        autoResize();
        return () => form?.removeEventListener("reset", onReset);
    }, []);

    useEffect(() => {
        const ready = document.fonts?.ready;
        if (ready)
            ready.then(() => {
                updateCaretPosition();
                autoResize();
            }).catch(() => { });
    }, [updateCaretPosition]);

    useEffect(() => {
        if (!isTextarea)
            return;
        const onWindowResize = () => {
            updateCaretPosition();
            autoResize();
        };
        window.addEventListener("resize", onWindowResize);
        return () => window.removeEventListener("resize", onWindowResize);
    }, [isTextarea, updateCaretPosition, autoResize]);

    useImperativeHandle(ref, () => ({
        setError(msg: string) {
            setErrMsg(msg);
        },
        getInput() {
            return inputRef.current?.value ?? "";
        },
        getError() {
            return errMsg;
        },
        focus() {
            inputRef.current?.focus();
        },
        blur() {
            inputRef.current?.blur();
        },
        setStringToType(string, charsTyped) {
            if (!props.scripted || inputRef.current === null)
                return;
            stringToType.current = string;
            currTyped.current = string === "" ? 0 : Math.min(Math.max(charsTyped ?? 0, 0), string.length);
            inputRef.current.disabled = stringToType.current === "";
            if (string !== "") {
                inputRef.current.value = string.substring(0, currTyped.current);
                updateCaretPosition();
                autoResize();
            }
        },
        isStringTyped() {
            return props.scripted && stringToType.current !== "" ? currTyped.current >= stringToType.current.length : false;
        },
        setInput(value) {
            if (inputRef.current === null)
                return;
            inputRef.current.value=value;
            updateCaretPosition();
            autoResize();
        },
    }));

    function onPasswordEyeClick() {
        if (type == "password")
            setType("text");
        else
            setType("password");
    }

    function onInputFocus() {
        if (placeholder.current) {
            placeholder.current.style.display = "none";
        }
        isFocused.current = true;
        updateCaretPosition();
        if (props.onFocus)
            props.onFocus();
    }

    function onInputBlur() {
        if (placeholder.current && inputRef.current?.value.trim() == "") {
            placeholder.current.style.display = "";
        }
        isFocused.current = false;
        if (props.onBlur)
            props.onBlur();
    }

    function onReset() {
        if (!isFocused.current)
            placeholder.current!.style.display = "";
        autoResize();
    }

    function onSelect() {
        updateCaretPosition();
    }

    function onKeyUp() {
        updateCaretPosition();
    }

    function onClick() {
        updateCaretPosition();
    }

    function onMouseDown() {
        isMouseDown.current = true;
    }
    function onMouseUp() {
        isMouseDown.current = false;
    }

    function onMouseMove() {
        if (isMouseDown.current) {
            updateCaretPosition();
        }
    }


    function onKeyDown(e: React.KeyboardEvent) {
        updateCaretPosition();
        if (props.onKeyDown)
            props.onKeyDown(e);
        if (!props.scripted)
            return;
        if (!props.textarea&&e.key == "Enter")
            return;
        e.preventDefault();
        if (stringToType.current === "")
            return;
        if (e.key == "Backspace")
            currTyped.current = Math.max(currTyped.current - 1, 0);
        else
            currTyped.current = Math.min(currTyped.current + (props.typeSpeed ?? 1), stringToType.current.length);
        const expectedString = stringToType.current.substring(0, currTyped.current)
        setTimeout(() => {
            inputRef.current!.value = expectedString;
            updateCaretPosition();
            autoResize();
            if (props.onChange)
                props.onChange(expectedString);
        }, 0);//trick for mobile, so last typed letter doesn't appear in input, only scripted string

    }

    const passwordEye = type == "password" ? <Eye interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} /> : <EyeSlash interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} />
    const className = `${styles.inputWrapper} ${props.className} ${errMsg != "" ? styles.error : ""} ${isTerminal ? styles.terminal : ""} ${isTextarea ? styles.textarea : ""} ${isResizable ? styles.resizable : ""}`;
    return (
        <div className={styles.container} >
            <div style={props.style} className={className} data-istransition="true" id={props.id}>
                {props.icon}
                <div className={styles.input}>
                    <span ref={placeholder} id={props.id} className={styles.placeholder}>{props.placeholder}</span>
                    {isTextarea ?
                        <textarea
                            onKeyDown={onKeyDown}
                            onKeyUp={onKeyUp}
                            onClick={onClick}
                            onSelect={onSelect}
                            onMouseMove={onMouseMove}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            ref={inputRef as React.RefObject<HTMLTextAreaElement | null>}
                            autoComplete={props.autocomplete ? "on" : "off"}
                            onChange={onChange}
                            onFocus={onInputFocus}
                            onBlur={onInputBlur}
                            name={props.name}
                            className={styles.inputField}
                            spellCheck={false}
                            rows={props.rows??1}
                            disabled={props.disabled}
                        />
                        :
                        <input
                            onKeyDown={onKeyDown}
                            onKeyUp={onKeyUp}
                            onClick={onClick}
                            onSelect={onSelect}
                            onMouseMove={onMouseMove}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            ref={inputRef as React.RefObject<HTMLInputElement | null>}
                            autoComplete={props.autocomplete ? "on" : "off"}
                            onChange={onChange}
                            onFocus={onInputFocus}
                            onBlur={onInputBlur}
                            type={type}
                            name={props.name}
                            className={styles.inputField}
                            spellCheck={false}
                            disabled={props.disabled}
                        />
                    }
                    {isTerminal ? <div className={styles.caretOverlay} aria-hidden>
                        <span className={styles.mirror}>{caretText}</span>
                        {hasSelection ? "" : <span className={styles.blockCursor} />}
                    </div> : ""}
                </div>
                {props.type == "password" && !isTextarea ? passwordEye : ""}
            </div>
            {errMsg != "" ?
                <span className={styles.errorMsg}>{errMsg}</span>
                : ""}
        </div>
    );
});