import { useGSAP } from "@gsap/react";
import { type FC, type ReactNode } from "react";
import gsap from 'gsap';

interface ITestPageProps {
    children?: ReactNode;
}

export const TestPage: FC<ITestPageProps> = (_) => {
    useGSAP(() => {
        const container = document.querySelector('#container') as HTMLDivElement
        const clone = container.cloneNode(true) as HTMLDivElement;
        clone.style.position="absolute";
        clone.style.left = "0";
        clone.style.top = "0";
        clone.style.pointerEvents="none";
        // clone.style.backgroundColor="red";
        // clone.style.backgroundImage="none";
        clone.style.opacity="0.1";
        document.body.appendChild(clone);
        gsap.timeline()
            .set(clone, {
                x:"3vw",
                y:"10vw",
                backgroundImage:"none",
                backgroundColor:"red",
                color:"red !important"
            },"+=1")
            .add(()=>{clone.remove();},"+=20")
        return () => {
            clone.remove();
        }
    }, [])
    return (
        <div>
            <h1>Test</h1>
        </div>
    );
};
