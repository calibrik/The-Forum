import { useEffect, useRef, type FC, type RefObject } from "react";
import '../scss/binaryAnimation.scss';

interface IBinaryAnimationProps {
    className?: string;
    isFlash: RefObject<boolean>;
};

export const BinaryAnimation: FC<IBinaryAnimationProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const baseBinaryAnimFontSize = 30;
    const binaryAnimFontSize = useRef<number>(baseBinaryAnimFontSize);
    let drops: string[] = [
        "0111011101101000011",
        "0000101110100001000",
        "0001110111011011110",
        "0100000011101000110",
        "1111001000000110111",
        "0011011110111010000",
        "1000000110001001100",
        "1010010000001100001",
        "0110110001101111011",
        "011100110010100111111",
    ];
    const frame = useRef<number>(0);
    const speed: number[] = [0.08, -0.1, 0.05,  0.1, -0.18, -0.15, 0.17, -0.2, 0.1, -0.1]
    const BASE_HEIGHT = 932;
    const offsetX = 0;

    function draw(newFrameTime: number) {
        if (!canvasRef.current)
            return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx)
            return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (!props.isFlash.current) {
            const gradient = ctx.createLinearGradient(canvasRef.current.width / 2, 0, canvasRef.current.width / 2, canvasRef.current.height);
            gradient.addColorStop(0.20, '#470001');
            gradient.addColorStop(0.9423, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        }
        let startX = 0;
        // const totalSize=(binaryAnimFontSize + offsetX) * drops.length-offsetX;
        // startX=(canvasRef.current.width - totalSize)/2;
        for (let i = 0; i < drops.length; i++) {
            for (let j = 0; j < drops[i].length; j++) {
                const char = drops[i][j];
                ctx.font = `${binaryAnimFontSize.current}px Courier Prime`;
                const x = startX + (binaryAnimFontSize.current + offsetX) * i;

                const y1 = (j * binaryAnimFontSize.current) + ((speed[i]*window.innerHeight / BASE_HEIGHT * newFrameTime) % (drops[i].length * binaryAnimFontSize.current));
                const dir = speed[i] > 0 ? -1 : 1;
                const y2 = y1 + dir * (drops[i].length * binaryAnimFontSize.current);
                ctx.fillText(char, x, y1);
                ctx.fillText(char, x, y2);
            }
        }
    }

    function renderBinary(newFrame: number) {
        draw(newFrame);
        frame.current = requestAnimationFrame(renderBinary);
    }
    function onResize() {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.clientHeight;
        }
        binaryAnimFontSize.current = baseBinaryAnimFontSize * window.innerHeight / BASE_HEIGHT;
    }

    useEffect(() => {
        onResize();
        renderBinary(0);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(frame.current);
        };
    }, [])

    return (
        <div className={props.className}>
            <canvas className="canvas" ref={canvasRef}></canvas>
        </div>
    );
}
