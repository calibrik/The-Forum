import { useEffect, useRef, useState, type FC } from "react";
import styles from '../scss/header.module.scss';
import { Menu, Person } from "./Icons";
import { InputField } from "./InputField";
import { useNavigate } from "react-router";
interface IHeaderProps {
    isLoggedIn?: boolean;
};

interface IHeaderLoggedInProps { };
interface IHeaderLoggedOffProps { };


const HeaderLoggedIn: FC<IHeaderLoggedInProps> = (_) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const div = useRef<HTMLDivElement>(null);

    let navigate = useNavigate();

    function onResize() {
        setIsMobile((div.current?.clientWidth ?? 1) < 700)
    }

    useEffect(() => {
        onResize();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        }
    }, [])

    function toggleSideMenu(){
        window.dispatchEvent(new Event("toggleSideMenu"));
    }

    useEffect(() => {
        window.dispatchEvent(new Event("DOMRebuild"));
    }, [isMobile])

    return (
        <>
            <div id="header-div" className={styles.container}>
                {!isMobile ?
                    <div className={styles.inputDiv}>
                        <InputField id="header-input" className={styles.input} isSearch placeholder="Search" type={"text"} />
                    </div>
                    : ""}
                <div ref={div} className={styles.headerContainer}>
                    <Menu onClick={toggleSideMenu} interactive className={styles.icon} />
                    {!isMobile ?
                        <span id="header-text" className={styles.title}>The<span id="header-text" className="highlight">Forum</span></span>
                        : ""}
                    {isMobile ?
                        <div className={styles.inputDiv}>
                            <span id="header-text" className={styles.title}>The<span id="header-text" className="highlight">Forum</span></span>
                            <InputField id="header-input" className={styles.input} isSearch placeholder="Search" type={"text"} />
                        </div>
                        : ""}
                    <Person onClick={() => navigate("/user")} interactive className={`${styles.person} ${styles.icon}`} />
                </div>
            </div>
        </>
    );
}

const HeaderLoggedOff: FC<IHeaderLoggedOffProps> = (_) => {
    return (
        <div id="header-div" className={styles.container}>
            <span id="header-text" className={styles.title}>The<span id="header-text" className="highlight">Forum</span></span>
        </div>
    );
}


export const Header: FC<IHeaderProps> = (props) => {
    return (
        <>{props.isLoggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOff />}</>
    );
}
