import { useEffect, useRef, useState, type FC } from "react";
import '../anims/testAnim.css';
interface ITestPageProps {};

export const TestPage: FC<ITestPageProps> = (_) => {
    const [text,setText]=useState<string>("");
    const fullText="yo what's up, i'm testing shit";
    const intRef=useRef<number>(0);
    const iRef=useRef<number>(0);

    useEffect(()=>{
        intRef.current=setInterval(()=>{
            if (iRef.current==fullText.length)
            {
                clearInterval(intRef.current);
                return;
            }
            setText(fullText.substring(0,++iRef.current));
        },50);
    },[])

    function onClick(e:any){
        e.currentTarget.classList.add("test-anim");
    }

    return (
        <div className="" style={{width:"100%",justifyContent:"center",alignItems:"center",display:"flex",flexDirection:"column"}}>
            <div style={{border:"2px solid red"}}>
                <p className="test-text">{text}</p>
            </div>
            <button onClick={onClick} style={{marginTop:"5vh"}}>Press ME</button>
        </div>
    );
}
