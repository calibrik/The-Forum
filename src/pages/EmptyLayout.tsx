import type { FC } from "react";
import styles from "../scss/layout.module.scss";
import { Outlet, ScrollRestoration } from "react-router";
interface IEmptyLayoutProps {};

export const EmptyLayout: FC<IEmptyLayoutProps> = (_) => {
    return (
       <div className={styles.container}>
            <div className={styles.containerMain}>
                <Outlet />
                <ScrollRestoration />
            </div>
        </div>
    );
}
