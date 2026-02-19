import { useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { Link, useNavigate } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
interface ILoginProps { };

type LoginData = {
    nickname: string;
    password: string;
}

export const Login: FC<ILoginProps> = (_) => {
    const nicknameInputRef = useRef<InputFieldHandle>(null);
    const passwordInputRef = useRef<InputFieldHandle>(null);
    let navigate=useNavigate();
    const userState=useUserState();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as LoginData;
        let isGood:boolean=true;
        if (data.nickname.trim() === "") {
            nicknameInputRef.current?.setError("Field cannot be empty");
            isGood=false;
        }
        if (data.nickname.trim() === "") {
            passwordInputRef.current?.setError("Field cannot be empty");
            isGood=false;
        }
        if (!isGood)
            return;
        let user=await db.users.where("nickname").equals(data.nickname.trim()).toArray();
        if (user.length!=1)
        {
            nicknameInputRef.current?.setError("Nickname is not found.");
            return;
        }
        if (!user[0].password||user[0].password!=data.password.trim())
        {
            passwordInputRef.current?.setError("Incorrect password.");
            return;
        }
        userState.setIsRealLoggedIn(true);
        userState.setUserLoggedIn(data.nickname.trim());
        navigate("/user")
    }

    function onChange(){
        nicknameInputRef.current?.setError("");
        passwordInputRef.current?.setError("");
    }

    return (
        <div className={styles.loginSignupContainer}>
            <form className={styles.card} onSubmit={onSubmit}>
                <h1 className={styles.title}>Login</h1>
                <div className={styles.inputsContainer}>
                    <InputField autocomplete onChange={onChange} ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" className={styles.input} />
                    <InputField autocomplete onChange={onChange} ref={passwordInputRef} type="password" name="password" placeholder="Password" className={styles.input} />
                </div>
                <div className={styles.forgotPasswordContainer}>
                    <a className={styles.link} onClick={(e: any) => e.preventDefault()}>Forgot password?</a>
                </div>
                <BaseButton type={"submit"} className={`${styles.loginButton} ${baseButtonStyles.primaryButton}`}>Login</BaseButton>
                <p className={styles.hint}>Don’t have an account yet? <Link className={styles.link} to="/signup">Sign up</Link></p>
            </form>
        </div>
    );
}

