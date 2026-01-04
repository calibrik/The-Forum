import { useRef, type FC } from "react";
import "../scss/signupPage.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { SignUpButton } from "../components/SignUpButton";
import { useNavigate } from "react-router";
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
        <div className="signup-container">
            <form className="card" onSubmit={onSubmit}>
                <h1 className="title">Sign Up</h1>
                <div className="inputs">
                    <InputField ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" size="small" />
                    <InputField ref={passwordInputRef} onChange={onPasswordChange} type="password" name="password" placeholder="Password" size="small" />
                    <InputField ref={confirmPasswordInputRef} onChange={onPasswordChange} type="password" name="confirmPassword" placeholder="Confirm Password" size="small" />
                </div>
                <SignUpButton />
                <p className="login">Already have an account? <a onClick={(e: any) => { e.preventDefault(); navigate("/login"); }}>Login</a></p>
            </form>
            <p className="disclaimer">Account is not real and saved locally without encryption, so don’t use your real passwords</p>
        </div>
    );
}
