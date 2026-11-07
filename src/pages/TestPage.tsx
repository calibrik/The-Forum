import { useGSAP } from "@gsap/react";
import { useEffect, type FC, type ReactNode } from "react";
import gsap from 'gsap';
import { useStoryFuncs } from "../providers/StoryProvider";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { delay } from "../misc/utils";

interface ITestPageProps {
    children?: ReactNode;
}

export const TestPage: FC<ITestPageProps> = (_) => {
    const story = useStoryFuncs();
    const typingBoxes = useTypingBoxes();

    useGSAP(() => {
        const container = document.querySelector('#containerGlobal') as HTMLDivElement
        const clone = container.cloneNode(true) as HTMLDivElement;
        clone.style.position = "absolute";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.pointerEvents = "none";
        // clone.style.backgroundColor="red";
        // clone.style.backgroundImage="none";
        clone.style.opacity = "0.1";
        document.body.appendChild(clone);
        gsap.timeline()
            .set(clone, {
                x: "3vw",
                y: "10vw",
                backgroundImage: "none",
                backgroundColor: "red",
                color: "red !important"
            }, "+=1")
            .add(typingBoxes.getTypingBoxes().get("test")!.getTypingTimeline({
                content: "FUCK.",
                speed: "fast",
                // hideCursorAfter: true,
            }), ">")
            .add(typingBoxes.getTypingBoxes().get("test")!.getTypingTimeline({
                content: "SHIT.FUCK.",
                speed: "fast",
                delim: "",
                hideCursorAfter: true,
            }), "+=0.5")
            .add(() => { clone.remove(); }, "+=20")
        return () => {
            clone.remove();
        }
    }, [])

    async function test() {
        await delay(5);
        await story.getAnim("COLOR_OVERLAY", { duration: 2, backgroundColor: "black", opacity: 1, overlayNumber: ["1"] });
        await story.getAnim("REVERSE_OVERLAY", { duration: 2, overlayNumber: ["1"] });
    }

    useEffect(() => {
        test();
    }, [])
    return (
        <>
            <TypingTextBox style={{
                display: "block",
                "top": "10%",
                "padding":"0 10px",
                boxSizing:"border-box",
                maxWidth:"1000px",
                "width": "100%",
                "backgroundColor": "transparent",
                "zIndex": 22,
                "maxHeight":"85%",
                "overflowY":"auto",
                "scrollbarColor":"black transparent",
                "pointerEvents":"all"
            }} content="fuck" type="terminal" />
            <TypingTextBox ref={typingBoxes.setTypingBox("test")} type="terminal" />
            <div>
                <h1>Test</h1>
            </div>
        </>
    );
};
