import { useEffect, useRef, useState, type FC } from "react";
import '../anims/testAnim.scss';
import '../scss/test-page.scss';
import { Header } from "../components/Header";
import { BinaryAnimation } from "../components/BinaryAnimation";
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
        e.currentTarget.classList.add("test-anim");
    }

    return (
        <div>
            <div className="" style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                <div style={{ border: "2px solid red" }}>
                    <p className="test-text test-anim">{text}</p>
                </div> 
                <button onClick={onClick} style={{ marginTop: "5vh" }}>Press ME</button>
                <BinaryAnimation/>
                <p className="onscreen-text">{text}</p>
            </div>
        </div>
    );
}
