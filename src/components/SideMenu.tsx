import { type FC, useEffect, useState } from "react";
import { Home, Chat, Gear, Leave } from "./Icons";
import styles from "../scss/sideMenu.module.scss";
import { useNavigate } from "react-router";

interface ISideMenuProps {
    // isOpen?:boolean;
};

export const SideMenu: FC<ISideMenuProps> = (props) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    let navigate = useNavigate();

    function onNavigate(e: React.MouseEvent<HTMLDivElement>, dest?: string) {
        e.preventDefault();
        if (!dest)
            return;
        setIsOpen(false);
        navigate(dest);
    }

    function toggleOpen(){
        setIsOpen((p)=>!p);
    }

    useEffect(()=>{
        window.addEventListener("toggleSideMenu",toggleOpen);
        return ()=>{
            window.removeEventListener("toggleSideMenu",toggleOpen);
        }
    },[])

    return (
        <div className={`${styles.container} ${isOpen ? styles.open : styles.close}`}>
            <div onClick={(e)=>onNavigate(e)} className={styles.itemDiv}>
                <Home className={styles.icon} />
                <span className={styles.itemName}>Home</span>
            </div>
            <div onClick={(e)=>onNavigate(e,"/chat")} className={styles.itemDiv}>
                <Chat className={styles.icon} />
                <span className={styles.itemName}>Chats</span>
            </div>
            <div onClick={(e)=>onNavigate(e)} className={styles.itemDiv}>
                <Gear className={styles.icon} />
                <span className={styles.itemName}>Settings</span>
            </div>
            <div onClick={(e)=>onNavigate(e,"/login")} className={`${styles.itemDiv} ${styles.leaveDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>Log Out</span>
            </div>
        </div>
    );
}