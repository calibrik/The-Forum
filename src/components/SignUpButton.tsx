import type { FC } from "react";
import { BaseButton } from "./BaseButton";
import "../scss/signupButton.scss";
import "../scss/mainButton.scss";
interface ISignUpButtonProps {};

export const SignUpButton: FC<ISignUpButtonProps> = (props) => {
    return (
        <BaseButton className="secondary-button signup-button">Sign Up</BaseButton>
    );
}
