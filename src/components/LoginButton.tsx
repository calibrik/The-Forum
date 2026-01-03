import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import "../scss/loginButton.scss";
import "../scss/mainButton.scss";
interface ILoginButtonProps {
    animId?:string
};

export const LoginButton: FC<ILoginButtonProps> = (props) => {
    return (
        <BaseButton animId={props.animId} className="primary-button login-button">Login</BaseButton>
    );
}
