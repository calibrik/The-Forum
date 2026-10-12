import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Home, Chat, Gear, Leave, QuestionHint } from "./Icons";
import styles from "../scss/sideMenu.module.scss";
import { useNavigate } from "react-router";
import { useStory } from "../providers/StoryProvider";

interface ISideMenuProps { };

export const SideMenu: FC<ISideMenuProps> = (_) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hintText, setHintText] = useState<string>("");
    let navigate = useNavigate();
    const sideMenuRef = useRef<HTMLDivElement>(null);
    const story = useStory();

    function onNavigate(e: React.MouseEvent<HTMLDivElement>, dest?: string) {
        e.preventDefault();
        if (!dest)
            return;
        setIsOpen(false);
        // story.goForwardHintNavPath("chat-menu");
        navigate(dest);
    }

    function onLogout(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsOpen(false);
        story.logout();
    }

    function onRealLogout(e: React.MouseEvent) {
        e.preventDefault();
        setIsOpen(false);
        story.quitGame();
    }

    const toggleOpen = useCallback(() => {
        setIsOpen((p) => !p);
    }, []);

    function onBlur(e: React.FocusEvent) {
        if (!e.currentTarget.contains(e.relatedTarget) && !e.relatedTarget?.classList.contains("toggle-sidemenu-button")) {
            setIsOpen(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            sideMenuRef.current?.focus();
            story.goForwardHint("menu-icon-text");
        }
        else {
            story.goBackwardHint("chat-menu");
        }
    }, [isOpen])

    useEffect(() => {
        window.addEventListener("toggleSideMenu", toggleOpen);
        return () => {
            window.removeEventListener("toggleSideMenu", toggleOpen);
        }
    }, [])

    useEffect(() => {
        function onStoryHintText(e: Event) {
            setHintText((e as CustomEvent<string>).detail);
        }
        window.addEventListener("storyHintText", onStoryHintText);
        return () => {
            window.removeEventListener("storyHintText", onStoryHintText);
        }
    }, [])

    return (
        <div tabIndex={-1} onBlur={onBlur} ref={sideMenuRef} className={`${styles.container} ${isOpen ? styles.open : styles.close}`}>
            <div onClick={(e) => onNavigate(e)} className={styles.itemDiv}>
                <Home className={styles.icon} />
                <span className={styles.itemName}>Home</span>
            </div>
            <div onClick={(e) => onNavigate(e, "/chat")} id="chat-menu" className={styles.itemDiv}>
                <Chat className={styles.icon} />
                <span className={styles.itemName}>Chats</span>
            </div>
            <div onClick={(e) => onNavigate(e)} className={styles.itemDiv}>
                <Gear className={styles.icon} />
                <span className={styles.itemName}>Settings</span>
            </div>
            {hintText ?
                <div className={styles.hintDiv}>
                    <div className={styles.hintHeader}>
                        <QuestionHint className={styles.hintIcon} />
                        <div className={styles.hintTexts}>
                            <span className={styles.hintLabel}>Current objective:</span>
                            <span className={styles.hintText}>{hintText}</span>
                        </div>
                    </div>
                </div>
                : ""}
            <div onClick={onLogout} id="logout" className={`${styles.itemDiv} ${styles.leaveDiv}`}>
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