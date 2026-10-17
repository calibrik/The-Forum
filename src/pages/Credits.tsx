import { useRef, type FC } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "../scss/credits.module.scss";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";

export const Credits: FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const navigate = useNavigate();
    const typingBoxes = useTypingBoxes();

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 3, ease: "power2.inOut" })
            .to(trackRef.current, {
                y: () => {
                    if (!containerRef.current || !logoRef.current)
                        return 0;
                    const viewport = containerRef.current.getBoundingClientRect();
                    const logo = logoRef.current.getBoundingClientRect();
                    return -(logo.top - viewport.top + logo.height / 2 - viewport.height / 2);
                },
                duration: 12,
                ease: "none",
            }, "+=1.5")
            .add(typingBoxes.getTypingBoxes().get("text")!.getTypingTimeline({
                content: "I've spent an entire year putting effort into making this, so I hope you enjoyed it.",
                speed: 50,
                hideCursorAfter: true
            }), "<")
            .add(typingBoxes.getTypingBoxes().get("author")!.getTypingTimeline({
                content: "Made by SirCalibrik",
                speed: 70,
                hideCursorAfter: true
            }), ">+=1")
            .to(containerRef.current,{ opacity: 0, duration: 3, ease: "power2.inOut" },"-=2")
            .add(()=>{navigate("/");},">");
    }, []);

    return (
        <div ref={containerRef} className={styles.container}>
            <div ref={trackRef} className={styles.track}>
                <div className={styles.intro}>
                    <h1 className={styles.title}>Thanks for playing The<span className="highlight">Forum</span></h1>
                </div>
                <div className={styles.content}>
                    <TypingTextBox className={styles.text} ref={typingBoxes.setTypingBox("text")} type="terminal" />
                    <TypingTextBox className={styles.author} ref={typingBoxes.setTypingBox("author")} type="normal" />
                    <img ref={logoRef} className={styles.logo} src="/logo.svg" alt="The Forum logo" />
                </div>
            </div>
        </div>
    );
};
