import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import "../scss/signupButton.scss";
import "../scss/mainButton.scss";
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
        <BaseButton onClick={onClick} type={props.isNavigate?undefined:"submit"} animId={props.animId} className="secondary-button signup-button">Sign Up</BaseButton>
    );
}
