import type { FC } from "react";
import styles from '../scss/header.module.scss';
interface IHeaderProps {
    isLoggedIn?: boolean;
};

export const Header: FC<IHeaderProps> = (_) => {
    return (
        <div id="header-div" className={styles.header}>
            <span id="header-text" className={styles.headerTitle}>The<span id="header-text" className="highlight">Forum</span></span>
        </div>
    );
}
