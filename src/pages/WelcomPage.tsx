import type { FC } from "react";
import { LoginButton } from "../components/LoginButton";
import { SignUpButton } from "../components/SignUpButton";
import "../scss/welcomePage.scss";
import { BinaryAnimation } from "../components/BinaryAnimation";
interface IWelcomePageProps { };

export const WelcomePage: FC<IWelcomePageProps> = (_) => {
    return (
        <div className="container">
            <div className="container-info">
                <h1 className="welcome">Welcome to The <span className="highlight">Forum</span></h1>
                <p className="tagline">A web visual novel, that tells a story of a regular forum dweller.</p>
                <div className="buttons">
                    <LoginButton />
                    <SignUpButton />
                </div>
            </div>
            <BinaryAnimation className="binary-animation"/>
        </div>
    );
}

//TODO: I wanna white flashes here