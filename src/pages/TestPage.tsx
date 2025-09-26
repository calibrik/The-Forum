import { type FC } from "react";
import '../anims/testAnim.css';
interface ITestPageProps {};

export const TestPage: FC<ITestPageProps> = (_) => {
    // const [textClass,setTextClass]=useState<string>("");

    // useEffect(()=>{
    //     setTimeout(()=>{
    //         setTextClass("test-text");
    //     },1000);
    // },[])

    function onClick(e:any){
        e.currentTarget.classList.add("test-anim");
    }

    return (
        <div className="" style={{width:"100%",justifyContent:"center",alignItems:"center",display:"flex",flexDirection:"column"}}>
            <div style={{border:"2px solid red"}}>
                <p className="test-text">Test shit</p>
            </div>
            <button onClick={onClick} style={{marginTop:"5vh"}}>Press ME</button>
        </div>
    );
}
