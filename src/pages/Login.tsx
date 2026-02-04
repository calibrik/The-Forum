import { useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { Link, useNavigate } from "react-router";
import { BaseButton } from "../components/BaseButton";
interface ILoginProps { };

type LoginData = {
    nickname: string;
    password: string;
}

export const Login: FC<ILoginProps> = (_) => {
    const nicknameInputRef = useRef<InputFieldHandle>(null);
    const passwordInputRef = useRef<InputFieldHandle>(null);
    let navigate=useNavigate();

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as LoginData;
        if (data.nickname === "") {
            nicknameInputRef.current?.setError("Field cannot be empty");
        }
        if (data.password === "") {
            passwordInputRef.current?.setError("Field cannot be empty");
        }
        console.log("Submitted: ", data);
    }

    return (
        <div className={styles.loginSignupContainer}>
            <form className={styles.card} onSubmit={onSubmit}>
                <h1 className={styles.title}>Login</h1>
                <div className={styles.inputsContainer}>
                    <InputField autocomplete ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" className={styles.input} />
                    <InputField autocomplete ref={passwordInputRef} type="password" name="password" placeholder="Password" className={styles.input} />
                </div>
                <div className={styles.forgotPasswordContainer}>
                    <a className={styles.link} onClick={(e: any) => e.preventDefault()}>Forgot password?</a>
                </div>
                <BaseButton onClick={()=>navigate("/user")} type={"submit"} className={`${styles.loginButton} ${baseButtonStyles.primaryButton}`}>Login</BaseButton>
                <p className={styles.hint}>Don’t have an account yet? <Link className={styles.link} to="/signup">Sign up</Link></p>
            </form>
        </div>
    );
}

