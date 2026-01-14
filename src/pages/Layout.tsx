import { type FC } from "react";
import { Header } from "../components/Header";
import { Outlet } from "react-router";
import styles from '../scss/layout.module.scss';
interface ILayoutProps { };

export const Layout: FC<ILayoutProps> = (_) => {
    
    return (
        <div className={styles.container}>
            <Header isLoggedIn />
            <div className={styles.containerMain}>
                <Outlet />
            </div>
        </div>
    );
}
