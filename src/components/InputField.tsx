import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent } from "react";
import styles from "../scss/inputField.module.scss";
import { Eye, EyeSlash, Search } from "./Icons";
import { SMEntry } from "./SMEntry";
interface IInputFieldProps {
    type: string;
    name?: string;
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void | Promise<void>
    onSuggestionClick?: (name: string) => void | Promise<void>
    isSearch?: boolean;
    id?: string
};
type InputFieldHandle = {
    setError: (msg: string) => void;
    getInput: () => string;
    getError: () => string;
}

export const InputField = forwardRef<InputFieldHandle, IInputFieldProps>((props, ref) => {
    const [errMsg, setErrMsg] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [type, setType] = useState<string>(props.type);
    const testUsers: string[] = ["user1", "user2", "user3", "user4", "user5", "user6", "user1", "user2", "user3", "user4", "user5", "user6", "user1", "user2", "user3", "user4", "user5", "user6"];
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const placeholder=useRef<HTMLSpanElement>(null);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        let value = event.target.value ?? "";
        setErrMsg("");
        if (props.onChange) {
            props.onChange(value);
            return;
        }
        if (!props.isSearch)
            return;
        setSuggestions(testUsers.filter((v: string) => v.includes(value.toLowerCase())));
    }

    useImperativeHandle(ref, () => ({
        setError(msg: string) {
            setErrMsg(msg);
        },
        getInput() {
            return inputRef.current?.value.trim() ?? "";
        },
        getError() {
            return errMsg;
        }
    }));

    function onPasswordEyeClick() {
        if (type == "password")
            setType("text");
        else
            setType("password");
    }

    function onBlur(e: React.FocusEvent) {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
            return
        }
        setIsFocused(false);
    }

    function onInputFocus(e: React.FocusEvent){
        if (placeholder.current) {
            placeholder.current.style.display = "none";
        }
    }

    function onInputBlur(e: React.FocusEvent){
        if (placeholder.current && inputRef.current?.value.trim()=="") {
            placeholder.current.style.display="";
        }
    }

    async function onSuggestionClick(name: string) {
        if (props.onSuggestionClick)
            await props.onSuggestionClick(name);
        setIsFocused(false);
    }

    const passwordEye = type == "password" ? <Eye className={styles.passwordIcon} onClick={onPasswordEyeClick} /> : <EyeSlash className={styles.passwordIcon} onClick={onPasswordEyeClick} />
    const className = `${styles.inputWrapper} ${props.className} ${errMsg != "" ? styles.error : ""}`;
    return (
        <div className={styles.container} onFocus={() => { setIsFocused(true) }} onBlur={onBlur}>
            <div className={className} data-istransition="true" id={props.id}>
                {props.isSearch ? <Search id={props.id} className={styles.icon} /> : ""}
                <div className={styles.input}>
                    <span ref={placeholder} id={props.id} className={styles.placeholder}>{props.placeholder}</span>
                    <input ref={inputRef} onChange={onChange} onFocus={onInputFocus} onBlur={onInputBlur} type={type} name={props.name} className={styles.inputField} />
                </div>
                {props.type == "password" ? passwordEye : ""}
            </div>
            {isFocused && props.isSearch && suggestions.length != 0 ?
                <div className={styles.dropdown}>
                    {
                        suggestions.map((value, index) => (
                            <SMEntry onClick={onSuggestionClick} key={index} type="user" name={value} />
                        ))
                    }
                </div>
                : ""}
            {errMsg != "" ?
                <span className={styles.errorMsg}>{errMsg}</span>
                : ""}
        </div>
    );
});

export type { InputFieldHandle };