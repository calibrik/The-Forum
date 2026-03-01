import { useRef, type FC } from "react";
import styles from '../scss/loginSignupPage.module.scss';
import baseButtonStyles from "../scss/baseButton.module.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { Link, useNavigate } from "react-router";
import { BaseButton } from "../components/BaseButton";
import { db } from "../backend/db";
import { useModals } from "../providers/Modals";
import { useStory } from "../providers/StoryProvider";
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
    let navigate = useNavigate();
    const modals = useModals();
    const answerRef = useRef<boolean>(false);
    const story=useStory();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (nicknameInputRef.current?.getError() !== "" || passwordInputRef.current?.getError() !== "" || confirmPasswordInputRef.current?.getError() !== "")
            return;
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as SignupData;
        if (answerRef.current)
            proccessSubmit(data);
        else
            modals.invincibleModal.current?.showQuestion("Are you sure?", "Registering new account will overwrite your current progress, if you had any.", () => proccessSubmit(data));
    }

    async function proccessSubmit(data: SignupData) {
        answerRef.current = true;
        let isGood: boolean = true;
        if (data.nickname.trim() === "") {
            nicknameInputRef.current?.setError("Field cannot be empty");
            isGood = false;
        }
        if (data.password.trim() === "") {
            passwordInputRef.current?.setError("Field cannot be empty");
            isGood = false;
        }

        if (data.confirmPassword.trim() === "") {
            confirmPasswordInputRef.current?.setError("Field cannot be empty");
            isGood = false;
        }
        if (!isGood)
            return;
        const existingUser = await db.users.where("nickname").equals(data.nickname.trim()).toArray();
        if (existingUser.length > 0&&!(existingUser.length==1&&existingUser[0].storyId)) {
            nicknameInputRef.current?.setError("Nickname already exists");
            return;
        }
        await story.customizeStory(data.nickname.trim());
        await db.users.where("storyId").aboveOrEqual(0).modify({ nickname: data.nickname.trim(), password: data.password.trim(),storyId:1 });
        navigate("/login")
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
                    <InputField ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" className={styles.input} />
                    <InputField ref={passwordInputRef} onChange={onPasswordChange} type="password" name="password" placeholder="Password" className={styles.input} />
                    <InputField ref={confirmPasswordInputRef} onChange={onPasswordChange} type="password" name="confirmPassword" placeholder="Confirm Password" className={styles.input} />
                </div>
                <BaseButton type={"submit"} className={`${baseButtonStyles.secondaryButton} ${styles.signupButton}`}>Sign Up</BaseButton>
                <p className={styles.hint}>Already have an account? <Link className={styles.link} to="/login">Login</Link></p>
            </form>
            <p className={styles.disclaimer}>Account is not real and saved locally without encryption, so don't use your real passwords</p>
        </div>
    );
}
