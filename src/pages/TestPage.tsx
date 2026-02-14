import { useEffect, useRef, useState, type FC } from "react";
import styles from '../scss/test-page.module.scss';
import { db, type StoryLine } from "../backend/db";
import { delay } from "../utils";
import { Cursor } from "../components/Cursor";

interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const [text, setText] = useState<string>("");
    const textIntervalRef = useRef<number>(0);
    const isMounted = useRef<boolean>(true);

    async function fetchStoryLine(id: number) {
        return await db.story.get(id);
    }

    async function showStoryLine(stl: StoryLine) {
        console.log(stl);
        return new Promise<void>(resolve => {
            let i = 1;
            const int = setInterval(() => {
                if (!isMounted.current || i > stl.content.length) {
                    clearInterval(int);
                    return resolve();
                }
                setText(stl.content.substring(0, i))
                i++;
            }, stl.speed);
            textIntervalRef.current=int
        })

    }

    async function showStory() {
        let id = 1;
        let stl: StoryLine | undefined = undefined;
        while (isMounted.current) {
            stl = await fetchStoryLine(id);
            id++;
            if (!stl)
                break;
            await showStoryLine(stl);
            if (!isMounted.current||stl.isActionAwait===true)
                break;
            await delay(stl.delay);
        }
    }

    useEffect(() => {
        isMounted.current = true;
        showStory();
        return () => {
            isMounted.current = false;
        }
    }, [])//do gsap now

    return (
        <div>
            <div className="" style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                <div>
                    <p className={`${styles.testText} ${styles.testAnim}`}>{text}<Cursor isOn type={"normal"}/></p>
                </div>
                <p className={styles.onscreenText}>{text}<Cursor isOn type={"terminal"}/></p>
            </div>
        </div>
    );
}
