import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import styles from "../scss/inputField.module.scss";
import { Eye, EyeSlash } from "./Icons";
interface IInputFieldProps {
    type: string;
    name?: string;
    placeholder?: string;
    className?: string;
    scripted?: boolean;
    onChange?: (value: string) => void | Promise<void>
    onSuggestionClick?: (name: string) => void | Promise<void>
    onFocus?: () => void | Promise<void>
    onBlur?: () => void | Promise<void>
    icon?: ReactNode;
    id?: string
    autocomplete?: boolean
};
export type InputFieldHandle = {
    setError: (msg: string) => void;
    getInput: () => string;
    getError: () => string;
    focus: () => void;
    blur: () => void;
    setStringToType: (string: string) => void;
    isStringTyped: () => boolean;
}

export const InputField = forwardRef<InputFieldHandle, IInputFieldProps>((props, ref) => {
    const [errMsg, setErrMsg] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [type, setType] = useState<string>(props.type);
    const isFocused = useRef<boolean>(false);
    const placeholder = useRef<HTMLSpanElement>(null);
    const stringToType = useRef<string>("");
    const currTyped = useRef<number>(0);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        if (props.scripted) {
            return;
        }
        let value = event.target.value ?? "";
        setErrMsg("");
        if (stringToType.current != "") {
            event.preventDefault();
        }
        if (props.onChange) {
            props.onChange(value);
            return;
        }
    }

    useEffect(() => {
        // if (props.scripted)
        //     inputRef.current!.disabled=true;
        const form = inputRef.current?.form;
        if (form) {
            form.addEventListener("reset", onReset);
        }
        return () => form?.removeEventListener("reset", onReset);
    }, []);

    useImperativeHandle(ref, () => ({
        setError(msg: string) {
            setErrMsg(msg);
        },
        getInput() {
            return inputRef.current?.value.trim() ?? "";
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
        setStringToType(string) {
            if (!props.scripted||inputRef.current===null)
                return;
            currTyped.current = 0;
            stringToType.current = string;
            // inputRef.current.disabled=stringToType.current==="";
        },
        isStringTyped() {
            return props.scripted&&stringToType.current!=="" ? currTyped.current >= stringToType.current.length : false;
        },
    }));

    function onPasswordEyeClick() {
        if (type == "password")
            setType("text");
        else
            setType("password");
    }

    // function onBlur(e: React.FocusEvent) {
    //     if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
    //         return
    //     }
    //     isFocused.current = false;
    // }

    function onInputFocus() {
        if (placeholder.current) {
            placeholder.current.style.display = "none";
        }
        isFocused.current = true;
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
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (!props.scripted||e.key=="Enter")
            return;
        e.preventDefault();
        if (stringToType.current==="")
            return;
        if (e.key == "Backspace")
            currTyped.current = Math.max(currTyped.current - 1, 0);
        else
            currTyped.current = Math.min(currTyped.current + 1, stringToType.current.length);
        inputRef.current!.value = stringToType.current.substring(0, currTyped.current);
        if (props.onChange) {
            props.onChange(inputRef.current?.value??"");
            return;
        }
    }

    const passwordEye = type == "password" ? <Eye interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} /> : <EyeSlash interactive className={styles.passwordIcon} onClick={onPasswordEyeClick} />
    const className = `${styles.inputWrapper} ${props.className} ${errMsg != "" ? styles.error : ""}`;
    return (
        <div className={styles.container} >
            <div className={className} data-istransition="true" id={props.id}>
                {props.icon}
                <div className={styles.input}>
                    <span ref={placeholder} id={props.id} className={styles.placeholder}>{props.placeholder}</span>
                    <input onKeyDown={onKeyDown} ref={inputRef} autoComplete={props.autocomplete ? "on" : "off"} onChange={onChange} onFocus={onInputFocus} onBlur={onInputBlur} type={type} name={props.name} className={styles.inputField} />
                </div>
                {props.type == "password" ? passwordEye : ""}
            </div>
            {errMsg != "" ?
                <span className={styles.errorMsg}>{errMsg}</span>
                : ""}
        </div>
    );
});