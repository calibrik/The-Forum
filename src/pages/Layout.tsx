import { type FC } from "react";
import { Header } from "../components/Header";
import { Outlet, ScrollRestoration } from "react-router";
import styles from '../scss/layout.module.scss';
import { SideMenu } from "../components/SideMenu";
import { ModalsProvider } from "../providers/Modals";
interface ILayoutProps { };

export const Layout: FC<ILayoutProps> = (_) => {

    return (
        <div className={styles.container}>
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
