import { useEffect, useRef, useState, type FC } from "react";
import styles from '../scss/test-page.module.scss';
interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const [text, setText] = useState<string>("");
    const fullText = `yo testing shit yeah`;
    const intRef = useRef<number>(0);
    const iRef = useRef<number>(0);

    useEffect(() => {
        intRef.current = setInterval(() => {
            if (iRef.current == fullText.length) {
                clearInterval(intRef.current);
                return;
            }
            setText(fullText.substring(0, ++iRef.current));
        }, 100);
        return () => {
            clearInterval(intRef.current);
        };
    }, [])

    function onClick(e: any) {
        e.currentTarget.classList.add(styles.testAnim);
    }

    return (
        <div>
            <div className="" style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                <div style={{ border: "2px solid red" }}>
                    <p className={`${styles.testText} ${styles.testAnim}`}>{text}</p>
                </div> 
                <button onClick={onClick} style={{ marginTop: "5vh" }}>Press ME</button>
                <p className={styles.onscreenText}>{text}</p>
            </div>
        </div>
    );
}
