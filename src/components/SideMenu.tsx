import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Home, Chat, Gear, Leave } from "./Icons";
import styles from "../scss/sideMenu.module.scss";
import { useNavigate } from "react-router";
import { useUserState } from "../providers/UserAuth";
import { useStory } from "../providers/StoryProvider";
import { useGSAP } from "@gsap/react";

interface ISideMenuProps {};

export const SideMenu: FC<ISideMenuProps> = (_) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    let navigate = useNavigate();
    const sideMenuRef = useRef<HTMLDivElement>(null);
    const userState=useUserState();
    const story=useStory();
    const { contextSafe } = useGSAP();

    function onNavigate(e: React.MouseEvent<HTMLDivElement>, dest?: string) {
        e.preventDefault();
        if (!dest)
            return;
        setIsOpen(false);
        navigate(dest);
    }

    function onLogout(e: React.MouseEvent<HTMLDivElement>){
        e.preventDefault();
        setIsOpen(false);
        userState.userLoggedIn.current="";
        window.dispatchEvent(new Event("loggedOut"));
        navigate("/login");
    }

    const onRealLogout=contextSafe(async (e: React.MouseEvent)=>{
        e.preventDefault();
        await story.getAnim("FADE_OUT");
        setIsOpen(false);
        userState.userLoggedIn.current="";
        userState.isRealLoggedIn.current=false;
        window.dispatchEvent(new Event("loggedOut"));
        navigate("/");
        await story.getAnim("FADE_IN");
    })

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
            <div onClick={onLogout} className={`${styles.itemDiv} ${styles.leaveDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>Log Out</span>
            </div>
            <div onClick={onRealLogout} className={`${styles.itemDiv} ${styles.quitDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>Quit game</span>
            </div>
        </div>
    );
}