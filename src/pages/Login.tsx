import { useRef, type FC } from "react";
import { LoginButton } from "../components/LoginButton";
import "../scss/loginPage.scss";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { useNavigate } from "react-router";
interface ILoginProps { };

type LoginData = {
    nickname: string;
    password: string;
}

export const Login: FC<ILoginProps> = (_) => {
    const nicknameInputRef = useRef<InputFieldHandle>(null);
    const passwordInputRef = useRef<InputFieldHandle>(null);
    let navigate = useNavigate();

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
        <div className="login-container">
            <form className="card" onSubmit={onSubmit}>
                <h1 className="title">Login</h1>
                <div className="inputs">
                    <InputField ref={nicknameInputRef} type="text" name="nickname" placeholder="Nickname" size="small" />
                    <InputField ref={passwordInputRef} type="password" name="password" placeholder="Password" size="small" />
                </div>
                <div className="forgot-password">
                    <a onClick={(e: any) => e.preventDefault()}>Forgot password?</a>
                </div>
                <LoginButton />
                <p className="signup">Don’t have an account yet? <a onClick={(e: any) => { e.preventDefault(); navigate("/signup"); }}>Sign up</a></p>
            </form>
        </div>
    );
}

