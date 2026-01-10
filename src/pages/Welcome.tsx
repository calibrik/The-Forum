import { useRef, type FC } from "react";
import { LoginButton } from "../components/LoginButton";
import { SignUpButton } from "../components/SignUpButton";
import styles from "../scss/welcomePage.module.scss";
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
            repeatRefresh: true,
            delay: 3
        })
            .set("[data-istransition='true']", {
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
            }, "+=2")
            .add(() => { isFlash.current = false; })
            .add(() => { tl.repeatDelay(gsap.utils.random(5, 10)); })
            .set("[data-istransition='true']", {
                clearProps: "transition",
            }, "+=0.1");
    })

    return (
        <div ref={container} className={styles.container}>
            <div>
                <h1 id="text" className={styles.welcome}>Welcome to</h1>
                <h1 id="text" className={styles.welcome}>The <span id="text" className="highlight">Forum</span></h1>
            </div>
            <p id="text" className={styles.tagline}>A web visual novel, that tells a story of a regular forum dweller.</p>
            <div className={styles.buttons}>
                <LoginButton isNavigate animId="button" />
                <SignUpButton isNavigate animId="button" />
            </div>
            <BinaryAnimation isFlash={isFlash} className={styles.binaryAnimation} />
        </div>
    );
}