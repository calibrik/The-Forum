import { useEffect, useRef, useState, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type IInputFieldHandle } from "../components/InputField";
import { Link, useSearchParams } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { useGSAP } from "@gsap/react";
import { useStory, useStoryInit } from "../providers/StoryProvider";

interface ILoginProps { };

type LoginData = {
    nickname: string;
    password: string;
}

export const Login: FC<ILoginProps> = (_) => {
    const nicknameInputRef = useRef<IInputFieldHandle>(null);
    const passwordInputRef = useRef<IInputFieldHandle>(null);
    const userState = useUserState();
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
    const storyInit = useStoryInit();
    const passwordTl = useRef<gsap.core.Timeline>(undefined);
    const { contextSafe } = useGSAP();
    const story = useStory();
    const onSubmitRunning = useRef<boolean>(false);
    const [searchParams] = useSearchParams();
    const isExpired = searchParams.get("expired") === "true";
    const [showNicknamePlaceholder, setShowNicknamePlaceholder] = useState(true);
    const [showPasswordPlaceholder, setShowPasswordPlaceholder] = useState(true);

    useEffect(() => {
        storyInit(1, getTypingBoxes());
    }, []);

    useEffect(() => {
        story.setLoginHandle({ setShowNicknamePlaceholder, setShowPasswordPlaceholder });
        return () => story.setLoginHandle(undefined);
    }, []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isExpired || onSubmitRunning.current)
            return;
        onSubmitRunning.current = true;
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as LoginData;
        const errors = await story.login(data.nickname, data.password);
        if (errors.nickname)
            nicknameInputRef.current?.setError(errors.nickname);
        if (errors.password)
            passwordInputRef.current?.setError(errors.password);
        if (errors.nickname || errors.password)
            onSubmitRunning.current = false;
    };

    function onChange() {
        nicknameInputRef.current?.setError("");
        passwordInputRef.current?.setError("");
    }

    const onPasswordForgot = contextSafe(async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (passwordTl.current) {
            passwordTl.current.kill();
            await getTypingBoxes().get("forgotPassword")?.reset();
        }
        const expected = userState.isRealLoggedIn.current ? story.getExpectedUser() : undefined;
        const expectedUser = expected ? await db.users.where("nickname").equals(expected).first() : undefined;
        let content: string;
        if (expectedUser) {
            content = `I need to login as ${expectedUser.nickname} and password is uhhhhhhhh ${expectedUser.password} ...I think?`;
        } else {
            const user = await db.users.where("savedStoryId").aboveOrEqual(1).first();
            content = !user ? "You don't even have the account yet, you can't forget what you didn't know, idiot." :
                `Bro, seriously? How fucking hard is it to remember this? Your nickname is ${user.nickname}, password is ${user.password}\n\nFucking moron.`;
        }
        const tl = getTypingBoxes().get("forgotPassword")?.getTypingTimeline({
            content: content,
            speed: 50,
            clearAfter:"+=5"
        });
        passwordTl.current = tl;
        await tl;
    });

    return (
        <>
            <TypingTextBox ref={setTypingBox("nar1")} type={"terminal"} />
            <TypingTextBox className={styles.passwordForgetBox} addDefaultClass ref={setTypingBox("forgotPassword")} type={"terminal"} />
            <div className={styles.loginSignupContainer}>
                <form className={styles.card} onSubmit={onSubmit}>
                    <h1 className={styles.title}>Login</h1>
                    {isExpired ? <p className={styles.expiredMessage}>Your session has expired, please login again</p> : ""}
                    <div className={styles.inputsContainer}>
                        <div className={styles.inputTypingWrapper}>
                            <InputField autocomplete disabled={isExpired} onChange={onChange} ref={nicknameInputRef} type="text" name="nickname" placeholder={showNicknamePlaceholder?"Nickname":""} className={styles.input} />
                            <TypingTextBox ref={setTypingBox("nickname")} className={styles.inputTypingBox} type="normal" />
                        </div>
                        <div className={styles.inputTypingWrapper}>
                            <InputField autocomplete disabled={isExpired} onChange={onChange} ref={passwordInputRef} type="password" name="password" placeholder={showPasswordPlaceholder?"Password":""} className={styles.input} />
                            <TypingTextBox ref={setTypingBox("password")} className={styles.inputTypingBox} type="normal" />
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

