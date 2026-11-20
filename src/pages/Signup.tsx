import { useRef, useState, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type IInputFieldHandle } from "../components/InputField";
import { Link, useNavigate } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../misc/db";
import { useModals } from "../providers/Modals";
import { useStory } from "../providers/StoryProvider";
import { useLocale } from "../providers/Locale";
import { Spinner } from "../components/Icons";
interface ISignupProps { };
type SignupData = {
    nickname: string;
    password: string;
    confirmPassword: string;
}

export const Signup: FC<ISignupProps> = (_) => {
    const nicknameInputRef = useRef<IInputFieldHandle>(null);
    const passwordInputRef = useRef<IInputFieldHandle>(null);
    const confirmPasswordInputRef = useRef<IInputFieldHandle>(null);
    const modals = useModals();
    const answerRef = useRef<boolean>(false);
    const story = useStory();
    let navigate=useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useLocale();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading || nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "" || confirmPasswordInputRef.current?.getError() !== "")
            return;
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as SignupData;
        if (answerRef.current)
            proccessSubmit(data);
        else
            modals.invincibleModal.current?.showQuestion(t("signup.modalTitle"), t("signup.modalDesc"), () => proccessSubmit(data), () => setLoading(false));
    }

    async function proccessSubmit(data: SignupData) {
        answerRef.current = true;
        let isGood: boolean = true;
        const nickname = data.nickname.trim();
        if (nickname === "") {
            nicknameInputRef.current?.setError(t("login.error.empty"));
            isGood = false;
        }
        if (data.password.trim() === "") {
            passwordInputRef.current?.setError(t("login.error.empty"));
            isGood = false;
        }

        if (data.confirmPassword.trim() === "") {
            confirmPasswordInputRef.current?.setError(t("login.error.empty"));
            isGood = false;
        }
        if (!isGood) {
            setLoading(false);
            return;
        }
        const nicknameRegex = /^[a-zA-Z0-9_]+$/
        if (!nicknameRegex.test(nickname)) {
            nicknameInputRef.current?.setError(t("signup.error.nicknameFormat"));
            setLoading(false);
            return;
        }
        const existingUser = await db.users.where("nickname").equals(nickname).toArray();
        if (existingUser.length > 0 && !(existingUser.length == 1 && existingUser[0].savedStoryId)||nickname=="banned") {
            nicknameInputRef.current?.setError(t("signup.error.nicknameExists"));
            setLoading(false);
            return;
        }
        await story.createUser(nickname, data.password.trim());
        await story.quitGame(false,false);
        navigate("/login");
    }

    function onPasswordChange(_: string) {
        if (passwordInputRef.current?.getInput().trim() !== confirmPasswordInputRef.current?.getInput().trim()) {
            confirmPasswordInputRef.current?.setError(t("signup.error.passwordsMismatch"));
        }
        else {
            confirmPasswordInputRef.current?.setError("");
        }
    }

    return (
        <div className={styles.loginSignupContainer}>
            <form className={styles.card} onSubmit={onSubmit}>
                <h1 className={styles.title}>{t("signup.title")}</h1>
                <div className={styles.inputsContainer}>
                    <InputField ref={nicknameInputRef} type="text" name="nickname" placeholder={t("login.nickname")} className={styles.input} />
                    <InputField ref={passwordInputRef} onChange={onPasswordChange} type="password" name="password" placeholder={t("login.password")} className={styles.input} />
                    <InputField ref={confirmPasswordInputRef} onChange={onPasswordChange} type="password" name="confirmPassword" placeholder={t("signup.confirmPassword")} className={styles.input} />
                </div>
                <BaseButton type={"submit"} icon={loading ? <Spinner spin /> : undefined} className={`${baseButtonStyles.secondaryButton} ${styles.signupButton}`}>{loading ? "" : t("common.signupAction")}</BaseButton>
                <p className={styles.hint}>{t("signup.alreadyHave")}<Link className={styles.link} to="/login">{t("signup.loginLink")}</Link></p>
            </form>
            <p className={styles.disclaimer}>{t("signup.disclaimer")}</p>
        </div>
    );
}
