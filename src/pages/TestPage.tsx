import { useEffect, useRef, type FC } from "react";
// import styles from '../scss/test-page.module.scss';
import { db, type StoryLine } from "../backend/db";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";


interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const isMounted = useRef<boolean>(true);
    const typingBoxRef=useRef<ITypingTextBoxHandle>(null)


    async function fetchStoryLine(id: number) {
        return await db.story.get(id);
    }

    async function showStory() {
        if (!typingBoxRef.current)
            return;
        let id = 1;
        let stl: StoryLine | undefined = undefined;
        while (isMounted.current||stl?.isActionAwait === true) {
            stl = await fetchStoryLine(id);
            id++;
            if (!stl)
                break;
            await typingBoxRef.current.showStoryLine(stl);
        }
    }

    useEffect(() => {
        isMounted.current = true;
        showStory();
        return () => {
            isMounted.current = false;
        }
    }, [])

    return (
        <div>
            <div style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                <TypingTextBox ref={typingBoxRef} type={"terminal"}/>
            </div>
        </div>
    );
}
