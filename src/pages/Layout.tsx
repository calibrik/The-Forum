import { useEffect, useRef, type FC } from "react";
import { Header } from "../components/Header";
import { Outlet } from "react-router";
import '../scss/layout.scss';
interface ILayoutProps {};

export const Layout: FC<ILayoutProps> = (_) => {
    const header=useRef<HTMLDivElement>(null);

    function onResize(){
        if (!header.current) return;
        const height=header.current.clientHeight+1;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
    useEffect(()=>{
        onResize();
        window.addEventListener('resize',onResize);
        return ()=>{
            window.removeEventListener('resize',onResize);
        }
    },[]);
    return (
        <>
            <Header ref={header}/>
            <div className="container-main">
                <Outlet/>
            </div>
        </>
    );
}
