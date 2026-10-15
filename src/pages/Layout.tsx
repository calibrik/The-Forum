import { useEffect, type FC } from "react";
import { Header } from "../components/Header";
import { Outlet, ScrollRestoration } from "react-router";
import styles from '../scss/layout.module.scss';
import { SideMenu } from "../components/SideMenu";
import { ModalsProvider } from "../providers/Modals";
import { useStoryInit } from "../providers/StoryProvider";
import { bridge } from "../misc/utils";
interface ILayoutProps { };

export const Layout: FC<ILayoutProps> = (_) => {
    const storyInit = useStoryInit();
    
    function init() {
        bridge.exec(storyInit,0, new Map());
    }

    useEffect(() => {
        window.addEventListener("signalLevel0",init);
        return () => {
            window.removeEventListener("signalLevel0",init);
        }
    }, [])

    return (
        <div id="containerGlobal" className={styles.container}>
            <Header />
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
