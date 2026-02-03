import { useRef, type FC } from "react";
import { LoginButton } from "../components/LoginButton";
import { SignUpButton } from "../components/SignUpButton";
import styles from "../scss/welcomePage.module.scss";
import { BinaryAnimation } from "../components/BinaryAnimation";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
interface IWelcomeProps { };

export const Welcome: FC<IWelcomeProps> = (_) => {
    const container = useRef<HTMLDivElement>(null);
    const isFlash = useRef<boolean>(false);
    const tl = useRef<gsap.core.Timeline>(null)

    useGSAP((_, contextSafe) => {
        if (!contextSafe)
            return;
        const bgColor = "#0000ffff"
        const textColor = "#FFFFFF"

        const rebuildTimeline = contextSafe(() => {
            tl.current?.kill();
            gsap.set("#text, #button,:root, #header-div, #header-text,#header-input,[data-istransition='true']", {
                clearProps: "all",
            });
            isFlash.current = false;

            tl.current = gsap.timeline({
                repeat: -1,
                repeatRefresh: true,
                delay: 3,
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
                .set("#header-input", {
                    borderColor: textColor,
                    color: textColor,
                    backgroundColor: bgColor,
                    fontFamily: "Courier Prime",
                })
                .set("#text, #header-text", {
                    color: textColor,
                    fontFamily: "Courier Prime",
                })
                .set(":root, #header-div", {
                    backgroundColor: bgColor,
                    backgroundImage: "none"
                })
                .set("#text, #button,:root, #header-div, #header-text,#header-input", {
                    clearProps: "color,backgroundColor,fontFamily,backgroundImage,borderColor",
                }, "+=2")
                .add(() => { isFlash.current = false; })
                .add(() => { tl.current?.repeatDelay(gsap.utils.random(5, 10)); })
                .set("[data-istransition='true']", {
                    clearProps: "transition",
                }, "+=0.1");
        })

        rebuildTimeline();
        window.addEventListener("DOMRebuild", rebuildTimeline);
        return () => {
            window.removeEventListener("DOMRebuild", rebuildTimeline);
        }
    },[])

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