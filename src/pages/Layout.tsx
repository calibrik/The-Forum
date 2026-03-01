import { useEffect, useRef, useState, type FC } from "react";
import { Header } from "../components/Header";
import { Outlet, ScrollRestoration } from "react-router";
import styles from '../scss/layout.module.scss';
import { SideMenu } from "../components/SideMenu";
import { ModalsProvider } from "../providers/Modals";
import { useStoryInit } from "../providers/StoryProvider";
import { useUserState } from "../providers/UserAuth";
interface ILayoutProps { };

export const Layout: FC<ILayoutProps> = (_) => {
    const storyInit = useStoryInit();
    const isLoggedInResolveRef=useRef<()=>void>(undefined);
    const isLoggedInPromiseRef=useRef<Promise<void>>(undefined);
    const userState=useUserState();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(userState.userLoggedIn.current!=="");

    function init(){
        storyInit(0, [],async ()=>{
            await isLoggedInPromiseRef.current;
        });
    }

    function onLogin() {
        isLoggedInPromiseRef.current=waitForIsLoggedIn();
        setIsLoggedIn(true);
    }

    function onLogout() {
        isLoggedInPromiseRef.current=waitForIsLoggedIn();
        setIsLoggedIn(false);
    }

    useEffect(() => {
        if (isLoggedInResolveRef.current)
            isLoggedInResolveRef.current();
    }, [isLoggedIn])

    function waitForIsLoggedIn() {
        return new Promise<void>((resolve) => isLoggedInResolveRef.current = resolve);
    }

    useEffect(() => {
        window.addEventListener("loggedIn", onLogin);
        window.addEventListener("loggedOut", onLogout);
        window.addEventListener("signalLevel0",init);
        return ()=>{
            window.removeEventListener("loggedIn", onLogin);
            window.removeEventListener("loggedOut", onLogout);
            window.removeEventListener("signalLevel0",init);
        }
    }, [])

    return (
        <div className={styles.container}>
            <Header isLoggedIn={isLoggedIn} />
            <div className={styles.containerFullWindow}>
                <SideMenu />
                <ModalsProvider>
                    <div className={styles.containerMain}>
                        <Outlet />
                        <ScrollRestoration />
                    </div>
                </ModalsProvider>
            </div>
        </div>
    );
}
