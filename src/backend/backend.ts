import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { db, type IEffect, type IScriptLine } from "./db";
import gsap from 'gsap';

export const useScriptTools = (typingBoxRef: React.RefObject<ITypingTextBoxHandle | null>) => {
    const isMounted = useRef<boolean>(true);
    const { contextSafe } = useGSAP();
    const loopTicket = useRef<number>(0);

    async function fetchStoryLine(id: number) {
        return await db.story.get(id);
    }

    const actionMap: Record<string, (effect:IEffect) => gsap.core.Timeline> = {//param potentially usless
        "NOTEPAD_FLASH": contextSafe((_:IEffect) => {
            return gsap.timeline()
                .set("[data-istransition='true']", {
                    transition: "none"
                })
                .set("#dissapear", {
                    visibility: "hidden",
                })
                .set("#appContainer", {
                    backgroundColor: "transparent",
                    border: "none"
                })
                .set("#container", {
                    backgroundColor: "white"
                })
                .set("#textBox", {
                    color: "black",
                    fontFamily: "Courier Prime"
                })
                .set("#contentDiv",{
                    overflowY:"visible"
                })
                .add(() => typingBoxRef.current?.setCursorType("terminal"))
                .set("#container", {
                    clearProps: "all"
                }, "+=1")
                .set("#textBox", {
                    clearProps: "color"
                })
                .set("[data-istransition='true']", {
                    clearProps: "transition"
                })
        })
    }

    const showStory = contextSafe(async (fromId: number) => {
        if (!typingBoxRef.current)
            return;
        let id = fromId;
        loopTicket.current++;
        const ticket = loopTicket.current;
        let scl: IScriptLine | undefined = undefined;
        let master = gsap.timeline({ paused: true });
        while (!scl || !scl.isActionAwait) {
            scl = await fetchStoryLine(id);
            if (!isMounted.current || ticket != loopTicket.current)
                return;
            id++;
            if (!scl)
                break;
            if (scl.storyline)
                master.add(typingBoxRef.current.getTimeline(scl.storyline),scl.offset);
            else if (scl.effect) {
                if (!actionMap[scl.effect.name])
                    console.error(`No anim called ${scl.effect.name}`);
                master.add(actionMap[scl.effect.name](scl.effect),scl.offset);
            }
        }
        master.play();
        await master;
    });

    const testAnim = contextSafe((anim: string) => {
        if (!actionMap[anim])
            console.error(`No anim called ${anim}`);
        actionMap[anim]({name:anim});
    })

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        }
    }, [])

    return { showStory, testAnim };
}


