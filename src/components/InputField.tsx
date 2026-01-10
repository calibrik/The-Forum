import { forwardRef, useImperativeHandle, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import styles from  "../scss/inputField.module.scss";
import { Eye, EyeSlash } from "./Icons";
interface IInputFieldProps {
    type: string;
    name?: string;
    placeholder?: string;
    size: "small" | "big"
    onChange?: (value: string) => void | Promise<void>
    icon?: ReactNode;
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

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setErrMsg("");
        if (props.onChange) {
            props.onChange(event.target.value ?? "");
            return;
        }
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

    const passwordEye = type == "password" ? <Eye className={styles.icon} onClick={onPasswordEyeClick} /> : <EyeSlash className={styles.icon} onClick={onPasswordEyeClick} />
    const className = `${styles.inputWrapper} ${styles[props.size]} ${errMsg != "" ? styles.error : ""}`;
    return (
        <div className={styles.inputDiv}>
            <div className={className}>
                {props.icon ?? ""}
                <input ref={inputRef} onChange={onChange} type={type} name={props.name} placeholder={props.placeholder} className={styles.inputField} />
                {props.type == "password" ? passwordEye : ""}
            </div>
            <span className={styles.errorMsg}>{errMsg}</span>
        </div>
    );
});

export type { InputFieldHandle };