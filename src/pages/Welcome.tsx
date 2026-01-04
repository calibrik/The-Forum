import { useRef, type FC } from "react";
import { LoginButton } from "../components/LoginButton";
import { SignUpButton } from "../components/SignUpButton";
import "../scss/welcomePage.scss";
import { BinaryAnimation } from "../components/BinaryAnimation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
interface IWelcomeProps { };
gsap.registerPlugin(useGSAP);


export const Welcome: FC<IWelcomeProps> = (_) => {
    const container = useRef<HTMLDivElement>(null);
    const isFlash = useRef<boolean>(false);

    useGSAP(() => {
        const bgColor = "#0000ffff"
        const textColor = "#FFFFFF"
        const tl = gsap.timeline({
            repeat: -1,
            repeatRefresh:true,
            delay: gsap.utils.random(2, 5)
        })
            .set("[data-isbutton='true']", {
                transition: "none"
            })
            .add(() => { isFlash.current = true; })
            .set("#button", {
                backgroundColor: textColor,
                fontFamily: "Courier Prime",
                color: bgColor,
            })
            .set("#text, #header-text", {
                color: textColor,
                fontFamily: "Courier Prime",
            })
            .set(":root, #header-div", {
                backgroundColor: bgColor,
                backgroundImage: "none"
            })
            .set("#text, #button,:root, #header-div, #header-text", {
                clearProps: "color,backgroundColor,fontFamily,backgroundImage",
            }, "+=1")
            .add(() => { isFlash.current = false; })
            .add(()=>{tl.repeatDelay(gsap.utils.random(5,10));})
            .set("[data-isbutton='true']", {
                clearProps: "transition",
            }, "+=0.1");
    })

    return (
        <div ref={container} className="welcome-container">
            <div>
                <h1 id="text" className="welcome">Welcome to</h1>
                <h1 id="text" className="welcome">The <span id="text" className="highlight">Forum</span></h1>
            </div>
            <p id="text" className="tagline">A web visual novel, that tells a story of a regular forum dweller.</p>
            <div className="buttons">
                <LoginButton isNavigate animId="button" />
                <SignUpButton isNavigate animId="button" />
            </div>
            <BinaryAnimation isFlash={isFlash} className="binary-animation" />
        </div>
    );
}