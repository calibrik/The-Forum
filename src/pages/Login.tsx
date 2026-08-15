import { useEffect, useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { Link, useNavigate, useSearchParams } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useGSAP } from "@gsap/react";
import { useStory, useStoryInit } from "../providers/StoryProvider";

interface ILoginProps { };

type LoginData = {
    nickname: string;
    password: string;
}

export const Login: FC<ILoginProps> = (_) => {
    const nicknameInputRef = useRef<InputFieldHandle>(null);
    const passwordInputRef = useRef<InputFieldHandle>(null);
    let navigate = useNavigate();
    const userState = useUserState();
    const passwordForgotBox = useRef<ITypingTextBoxHandle>(null);
    const storyTextBox = useRef<ITypingTextBoxHandle>(null);
    const usernameTypingBox = useRef<ITypingTextBoxHandle>(null);
    const passwordTypingBox = useRef<ITypingTextBoxHandle>(null);
    const storyInit = useStoryInit();
    const passwordTl = useRef<gsap.core.Timeline>(undefined);
    const { contextSafe } = useGSAP();
    const story = useStory();
    const onSubmitRunning = useRef<boolean>(false);
    const [searchParams] = useSearchParams();
    const isExpired = searchParams.get("expired") === "true";

    useEffect(() => {
        storyInit(1, [storyTextBox, usernameTypingBox, passwordTypingBox]);
    }, []);

    const onSubmit=contextSafe(async (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        if (isExpired || onSubmitRunning.current)
            return;
        onSubmitRunning.current = true;
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as LoginData;
        let isGood: boolean = true;
        if (data.nickname.trim() === "") {
            nicknameInputRef.current?.setError("Field cannot be empty");
            isGood = false;
        }
        if (data.nickname.trim() === "") {
            passwordInputRef.current?.setError("Field cannot be empty");
            isGood = false;
        }
        if (!isGood) {
            onSubmitRunning.current = false;
            return;
        }
        let user = await db.users.where("nickname").equals(data.nickname.trim()).toArray();
        if (user.length != 1||user[0].savedStoryId==0) {
            nicknameInputRef.current?.setError("Nickname is not found.");
            onSubmitRunning.current = false;
            return;
        }
        if (!user[0].password || user[0].password != data.password.trim()||!userState.isRealLoggedIn.current&&user[0].savedStoryId===undefined) {
            passwordInputRef.current?.setError("Incorrect password.");
            onSubmitRunning.current = false;
            return;
        }
        userState.userLoggedIn.current=data.nickname.trim();   
        if (!userState.isRealLoggedIn.current) {
            await story.getAnim("COLOR_OVERLAY",{duration:2,backgroundColor:"black",opacity:1,overlayNumber:["1"]});
            window.dispatchEvent(new Event("loggedIn")); 
            userState.isRealLoggedIn.current=true;
            story.recoverCheckpoint(user[0].savedStoryId ?? 0);
            await story.getAnim("REVERSE_OVERLAY",{duration:2,backgroundColor:"black",overlayNumber:["1"]});
            return;
        }
        window.dispatchEvent(new Event("loggedIn")); 
        navigate(`/user/${data.nickname}`);
    });

    function onChange() {
        nicknameInputRef.current?.setError("");
        passwordInputRef.current?.setError("");
    }

    const onPasswordForgot = contextSafe(async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        let users = await db.users.where("savedStoryId").aboveOrEqual(1).toArray();
        if (passwordTl.current) {
            passwordTl.current.kill();
            await passwordForgotBox.current?.reset();
        }
        let content = users.length == 0 ? "You don't even have the account yet, you can't forget what you didn't know, idiot." :
            `Bro, seriously? How fucking hard is it to remember this? Your nickname is ${users[0].nickname}, password is ${users[0].password}\n\nFucking moron.`;
        const tl = passwordForgotBox.current?.getTimeline({
            content: content,
            speed: 50,
            clearAfter:"+=5"
        });
        passwordTl.current = tl;
        await tl;
    });

    return (
        <>
            <TypingTextBox ref={storyTextBox} type={"terminal"} />
            <TypingTextBox className={styles.passwordForgetBox} addDefaultClass ref={passwordForgotBox} type={"terminal"} />
            <div className={styles.loginSignupContainer}>
                <form className={styles.card} onSubmit={onSubmit}>
                    <h1 className={styles.title}>Login</h1>
                    {isExpired ? <p className={styles.expiredMessage}>Your session has expired, please login again</p> : ""}
                    <div className={styles.inputsContainer}>
                        <div className={styles.inputTypingWrapper}>
                            <InputField autocomplete disabled={isExpired} onChange={onChange} ref={nicknameInputRef} type="text" name="nickname" placeholder={isExpired?"":"Nickname"} className={styles.input} />
                            <TypingTextBox ref={usernameTypingBox} className={styles.inputTypingBox} type="normal" />
                        </div>
                        <div className={styles.inputTypingWrapper}>
                            <InputField autocomplete disabled={isExpired} onChange={onChange} ref={passwordInputRef} type="password" name="password" placeholder={isExpired?"":"Password"} className={styles.input} />
                            <TypingTextBox ref={passwordTypingBox} className={styles.inputTypingBox} type="normal" />
                        </div>
                    </div>
                    <div className={styles.forgotPasswordContainer}>
                        <a className={styles.link} onClick={onPasswordForgot}>Forgot password or nickname?</a>
                    </div>
                    <BaseButton type={"submit"} className={`${styles.loginButton} ${baseButtonStyles.primaryButton}`}>Login</BaseButton>
                    <p className={styles.hint}>Don’t have an account yet? <Link className={styles.link} to="/signup">Sign up</Link></p>
                </form>
            </div>
        </>
    );
}

