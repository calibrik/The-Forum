import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import styles from "../scss/loginButton.module.scss";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { useNavigate } from "react-router";
interface ILoginButtonProps {
    animId?:string
    isNavigate?:boolean
};

export const LoginButton: FC<ILoginButtonProps> = (props) => {
    let navigate=useNavigate();

    function onClick() {
        if (props.isNavigate) {
            navigate("/login");
            return;
        }
    }

    return (
        <BaseButton onClick={onClick} type={props.isNavigate?undefined:"submit"} animId={props.animId} className={`${styles.loginButton} ${baseButtonStyles.primaryButton}`}>Login</BaseButton>
    );
}
