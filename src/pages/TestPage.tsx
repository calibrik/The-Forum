import { useEffect, useRef, type FC } from "react";
import { delay } from "../utils";

const useTestHook=()=>{
    const isMounted=useRef<boolean>(false);
    const loop=useRef<number>(0);

    async function test(){
        loop.current++;
        const ticket=loop.current;
        console.log("fetching smth")
        await delay(1);
        console.log(isMounted.current,loop.current,ticket);
    }

    useEffect(() => {
        console.log("mount");
        isMounted.current=true;
        return ()=>{
            console.log("unmount");
            isMounted.current=false;
        }
    }, [])
    return {test}
}

interface ITestPageProps { };

export const TestPage: FC<ITestPageProps> = (_) => {
    const isMounted=useRef<boolean>(false);
    const {test}=useTestHook();

    async function testFun(){
        console.log("fetching smth")
        await delay(1);
        console.log(isMounted.current);
    }

    useEffect(() => {
        console.log("mount");
        isMounted.current=true;
        test();
        return ()=>{
            console.log("unmount");
            isMounted.current=false;
        }
    }, [])

    return (
        <div>
        </div>
    );
}
