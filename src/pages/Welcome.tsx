import { useRef, type FC } from "react";
import styles from "../scss/welcomePage.module.scss";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { BinaryAnimation } from "../components/BinaryAnimation";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { BaseButton } from "../components/BaseButton";
import { useNavigate } from "react-router";
import { useLocale } from "../providers/Locale";
interface IWelcomeProps { };

export const Welcome: FC<IWelcomeProps> = (_) => {
    const container = useRef<HTMLDivElement>(null);
    const isFlash = useRef<boolean>(false);
    const tl = useRef<gsap.core.Timeline>(undefined)
    let navigate = useNavigate();
    const { t } = useLocale();

    useGSAP((_, contextSafe) => {
        if (!contextSafe)
            return;
        const bgColor = "#0000ffff"
        const textColor = "#FFFFFF"

        const rebuildTimeline = contextSafe(() => {
            tl.current?.kill();
            gsap.set("#text, #button, #containerGlobal, #header-div, #header-text,[data-istransition='true']", {
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
                    fontFamily: 'var(--terminal-font)',
                    color: bgColor,
                })
                .set("#text, #header-text", {
                    color: textColor,
                    fontFamily: 'var(--terminal-font)',
                })
                .set("#containerGlobal, #header-div", {
                    backgroundColor: bgColor,
                    backgroundImage: "none"
                })
                .set("#text, #button, #containerGlobal, #header-div, #header-text,#header-input", {
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
    }, [])

    return (
        <div ref={container} className={styles.container}>
            <div>
                <h1 id="text" className={styles.welcome}>{t("welcome.title")}</h1>
                <h1 id="text" className={styles.welcome}>The<span id="text" className="highlight">Forum</span></h1>
            </div>
            <p id="text" className={styles.tagline}>{t("welcome.tagline")}</p>
            <div className={styles.buttons}>
                <BaseButton onClick={() => navigate("/login")} id={"button"} className={`${styles.loginButton} ${baseButtonStyles.primaryButton}`}>{t("common.loginAction")}</BaseButton>
                <BaseButton onClick={() => navigate("/signup")} id={"button"} className={`${baseButtonStyles.secondaryButton} ${styles.signupButton}`}>{t("common.signupAction")}</BaseButton>
            </div>
            <BinaryAnimation isFlash={isFlash} className={styles.binaryAnimation} />
        </div>
    );
}