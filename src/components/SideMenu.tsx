import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Home, Chat, Gear, Leave } from "./Icons";
import styles from "../scss/sideMenu.module.scss";
import { useNavigate } from "react-router";

interface ISideMenuProps {};

export const SideMenu: FC<ISideMenuProps> = (_) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    let navigate = useNavigate();
    const sideMenuRef = useRef<HTMLDivElement>(null);

    function onNavigate(e: React.MouseEvent<HTMLDivElement>, dest?: string) {
        e.preventDefault();
        if (!dest)
            return;
        setIsOpen(false);
        navigate(dest);
    }

    const toggleOpen=useCallback(()=>{
        setIsOpen((p)=>!p);
    },[]);

    function onBlur(e: React.FocusEvent) {
        if (!e.currentTarget.contains(e.relatedTarget)&&!e.relatedTarget?.classList.contains("toggle-sidemenu-button")) {
            setIsOpen(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            sideMenuRef.current?.focus();
        }
    }, [isOpen])

    useEffect(() => {
        window.addEventListener("toggleSideMenu", toggleOpen);
        return () => {
            window.removeEventListener("toggleSideMenu", toggleOpen);
        }
    }, [])

    return (
        <div tabIndex={-1} onBlur={onBlur} ref={sideMenuRef} className={`${styles.container} ${isOpen ? styles.open : styles.close}`}>
            <div onClick={(e) => onNavigate(e)} className={styles.itemDiv}>
                <Home className={styles.icon} />
                <span className={styles.itemName}>Home</span>
            </div>
            <div onClick={(e) => onNavigate(e, "/chat")} className={styles.itemDiv}>
                <Chat className={styles.icon} />
                <span className={styles.itemName}>Chats</span>
            </div>
            <div onClick={(e) => onNavigate(e)} className={styles.itemDiv}>
                <Gear className={styles.icon} />
                <span className={styles.itemName}>Settings</span>
            </div>
            <div onClick={(e) => onNavigate(e, "/login")} className={`${styles.itemDiv} ${styles.leaveDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>Log Out</span>
            </div>
        </div>
    );
}