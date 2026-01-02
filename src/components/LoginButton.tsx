import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import "../scss/loginButton.scss";
import "../scss/mainButton.scss";
interface ILoginButtonProps {};

export const LoginButton: FC<ILoginButtonProps> = (props) => {
    return (
        <BaseButton className="primary-button login-button">Login</BaseButton>
    );
}
