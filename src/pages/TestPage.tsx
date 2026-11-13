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
        gsap.timeline()
            .add(story.getAnim("COLOR_OVERLAY", { duration: 2, backgroundColor: "red", opacity: 1, overlayNumber: ["1"] })!, ">")
            .add(typingBoxes.getTypingBoxes().get("test")!.getTypingTimeline({
                content: "FUCK.",
                speed: "fast",
                // hideCursorAfter: true,
            }), ">")
            .add(typingBoxes.getTypingBoxes().get("test")!.getTypingTimeline({
                content: "SHIT.FUCK.",
                speed: "slow",
                delim: "",
                hideCursorAfter: true,
            }), "+=0.5")
            .add(story.getAnim("REVERSE_OVERLAY", { duration: 2, overlayNumber: ["1"] })!, "-=1")
            .add(() => { messageSim() }, "<")
            .add(() => console.log("message response sim"), ">+=2.5")
    }, [])

    async function messageSim() {
        console.log("message type sim");
        await delay(2);
        console.log("message sent");
    }

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
                "padding": "0 10px",
                boxSizing: "border-box",
                maxWidth: "1000px",
                "width": "100%",
                "backgroundColor": "transparent",
                "zIndex": 22,
                "maxHeight": "85%",
                "overflowY": "auto",
                "scrollbarColor": "black transparent",
                "pointerEvents": "all"
            }} content="fuck" type="terminal" />
            <TypingTextBox ref={typingBoxes.setTypingBox("test")} type="terminal" />
            <div>
                <h1>Test</h1>
            </div>
        </>
    );
};
