import { useEffect, useRef, useState, type FC } from "react";
import '../anims/testAnim.scss';
import '../scss/test-page.scss';
interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const [text, setText] = useState<string>("");
    const fullText = "yo what's up, i'm testing shit";
    const intRef = useRef<number>(0);
    const iRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const binaryAnimFontSize = 40;
    let drops:string[] = [
        "01110010001000000111010100",
        "1000000110000101100110",
        "011100100110000101101001011001000010000001101111",
        "011001100010000001110100011010000110010100100000",
        "011101000111001001110101011101000110100000111111"
    ];
    for (let i = 0; i < 50; i++) {
        drops.push("01010101010101010101010101010101010101010101010101");
    }
    const frame=useRef<number>(0);
    const speed:number[]=[0.5,-1,1.5,0.8,-1.5];
    for (let i = speed.length; i < drops.length; i++) {
        speed.push(Math.random()*2-1);
    }

    function draw() {
        if (!canvasRef.current)
            return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) 
            return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const gradient = ctx.createLinearGradient(canvasRef.current.width/2, 0, canvasRef.current.width/2, canvasRef.current.height);
        gradient.addColorStop(0, '#470001');
        gradient.addColorStop(0.9423, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;

        for (let i = 0; i < drops.length; i++) {
            for (let j = 0; j < drops[i].length; j++) {
                const char = drops[i][j];
                ctx.font = `${binaryAnimFontSize}px monospace`;
                const x = binaryAnimFontSize * i;
                const y1 = (j * binaryAnimFontSize) + ((speed[i]*frame.current) % (drops[i].length * binaryAnimFontSize));
                const dir=speed[i]>0?-1:1;
                const y2=y1 + dir*(drops[i].length * binaryAnimFontSize);
                ctx.fillText(char, x, y1);
                ctx.fillText(char, x, y2);
            }
        }
    }

    function renderBinary() {
        draw();
        frame.current=requestAnimationFrame(renderBinary);
    }

    useEffect(() => {
        canvasRef.current!.width = 1600;
        canvasRef.current!.height = 800;
        renderBinary();
        intRef.current = setInterval(() => {
            if (iRef.current == fullText.length) {
                clearInterval(intRef.current);
                return;
            }
            setText(fullText.substring(0, ++iRef.current));
        }, 100);
        return () => {
            cancelAnimationFrame(frame.current);
        };
    }, [])

    function onClick(e: any) {
        e.currentTarget.classList.add("test-anim");
    }

    return (
        <div className="" style={{ width: "100%", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
            <div style={{ border: "2px solid red" }}>
                <p className="test-text test-anim">{text}</p>
            </div>
            <button onClick={onClick} style={{ marginTop: "5vh" }}>Press ME</button>
            <canvas className="test-canvas" ref={canvasRef}></canvas>
        </div>
    );
}
