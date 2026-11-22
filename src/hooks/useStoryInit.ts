import { useRef } from "react";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { bridge } from "../misc/utils";
import { useStory } from "../providers/StoryProvider";

export function useStoryInit() {
    const story = useStory();
    const loopTicket = useRef<number>(0);

    async function storyInit(childLevel: number, typingBoxes: Map<string, ITypingTextBoxHandle>, pageInit?: () => Promise<void> | void) {
        loopTicket.current++;
        const ticket = loopTicket.current;
        await story.resetAnims();
        if (pageInit)
            await pageInit();
        if (ticket != loopTicket.current)
            return;
        bridge.exec(story.recoverStoryOnPage, childLevel, typingBoxes);
    }

    return storyInit;
}
