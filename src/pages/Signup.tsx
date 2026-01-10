import { useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss'
import { InputField, type InputFieldHandle } from "../components/InputField";
import { SignUpButton } from "../components/SignUpButton";
import { Link } from "react-router";
interface ISignupProps { };
type SignupData = {
    nickname: string;
    password: string;
    confirmPassword: string;
}

export const Signup: FC<ISignupProps> = (_) => {
    const nicknameInputRef = useRef<InputFieldHandle>(null);
    const passwordInputRef = useRef<InputFieldHandle>(null);
    const confirmPasswordInputRef = useRef<InputFieldHandle>(null);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "" || confirmPasswordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as SignupData;
        if (data.nickname.trim() === "") {
            nicknameInputRef.current?.setError("Field cannot be empty");
        }
        if (data.password.trim() === "") {
            passwordInputRef.current?.setError("Field cannot be empty");
        }

        if (data.confirmPassword.trim() === "") {
            confirmPasswordInputRef.current?.setError("Field cannot be empty");
        }
        console.log("Submitted: ", data);
    }

    function onPasswordChange(_: string) {
        if (passwordInputRef.current?.getInput() !== confirmPasswordInputRef.current?.getInput()) {
            confirmPasswordInputRef.current?.setError("Passwords don't match!");
        }
        else {
            confirmPasswordInputRef.current?.setError("");
        }
    }

    return (
        <div className={styles.loginSignupContainer}>
            <form className={styles.card} onSubmit={onSubmit}>
                <h1 className={styles.title}>Sign Up</h1>
                <div className={styles.inputsContainer}>
                    <InputField ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" size="small" />
                    <InputField ref={passwordInputRef} onChange={onPasswordChange} type="password" name="password" placeholder="Password" size="small" />
                    <InputField ref={confirmPasswordInputRef} onChange={onPasswordChange} type="password" name="confirmPassword" placeholder="Confirm Password" size="small" />
                </div>
                <SignUpButton />
                <p className={styles.hint}>Already have an account? <Link className={styles.link} to="/login">Login</Link></p>
            </form>
            <p className={styles.disclaimer}>Account is not real and saved locally without encryption, so don't use your real passwords</p>
        </div>
    );
}
