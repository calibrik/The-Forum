import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import styles from "../scss/signupButton.module.scss";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { useNavigate } from "react-router";
interface ISignUpButtonProps {
    animId?:string
    isNavigate?:boolean
};


export const SignUpButton: FC<ISignUpButtonProps> = (props) => {
    let navigate=useNavigate();

    function onClick() {
        if (props.isNavigate) {
            navigate("/signup");
            return;
        }
    }
    return (
        <BaseButton onClick={onClick} type={props.isNavigate?undefined:"submit"} animId={props.animId} className={`${baseButtonStyles.secondaryButton} ${styles.signupButton}`}>Sign Up</BaseButton>
    );
}
