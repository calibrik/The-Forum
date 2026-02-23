import { useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { Link, useNavigate } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useGSAP } from "@gsap/react";
import { useStory } from "../providers/StoryProvider";

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
    const passwordTl = useRef<gsap.core.Timeline>(undefined);
    const { contextSafe } = useGSAP();
    const story = useStory();
    const onSubmitRunning = useRef<boolean>(false);

    const onSubmit=contextSafe(async (event: React.FormEvent<HTMLFormElement>) =>{
        if (onSubmitRunning.current)
            return;
        onSubmitRunning.current = true;
        event.preventDefault();
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
        if (user.length != 1||user[0].storyId==0) {
            nicknameInputRef.current?.setError("Nickname is not found.");
            onSubmitRunning.current = false;
            return;
        }
        if (!user[0].password || user[0].password != data.password.trim()) {
            passwordInputRef.current?.setError("Incorrect password.");
            onSubmitRunning.current = false;
            return;
        }
        if (!userState.isRealLoggedIn.current) {
            const scriptLine = await db.story.get(user[0].storyId ?? 1);
            const anim = story.getAnim("FADE_OUT");
            await anim;
            userState.setUserLoggedIn(data.nickname.trim());
            userState.isRealLoggedIn.current=true;
            userState.storyId.current=user[0].storyId??1;
            userState.startStory.current=true;
            navigate(scriptLine?.where ?? "/user");
            return;
        }
        userState.startStory.current=false;
        userState.setUserLoggedIn(data.nickname.trim());
        navigate("/user")
    });

    function onChange() {
        nicknameInputRef.current?.setError("");
        passwordInputRef.current?.setError("");
    }

    const onPasswordForgot = contextSafe(async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        let users = await db.users.where("storyId").aboveOrEqual(1).toArray();
        if (passwordTl.current) {
            passwordTl.current.kill();
            passwordForgotBox.current?.reset();
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
            <TypingTextBox className={styles.passwordForgetBox} addDefaultClass ref={passwordForgotBox} type={"terminal"} />
            <div className={styles.loginSignupContainer}>
                <form className={styles.card} onSubmit={onSubmit}>
                    <h1 className={styles.title}>Login</h1>
                    <div className={styles.inputsContainer}>
                        <InputField autocomplete onChange={onChange} ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" className={styles.input} />
                        <InputField autocomplete onChange={onChange} ref={passwordInputRef} type="password" name="password" placeholder="Password" className={styles.input} />
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

