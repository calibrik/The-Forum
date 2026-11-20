import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { Home, Chat, Gear, Leave, QuestionHint } from "./Icons";
import styles from "../scss/sideMenu.module.scss";
import { useNavigate } from "react-router";
import { useStory } from "../providers/StoryProvider";
import { useLocale } from "../providers/Locale";

interface ISideMenuProps { };

export const SideMenu: FC<ISideMenuProps> = (_) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hintText, setHintText] = useState<string>("");
    let navigate = useNavigate();
    const sideMenuRef = useRef<HTMLDivElement>(null);
    const story = useStory();
    const { locale, setLocale, t } = useLocale();

    function onNavigate(e: React.MouseEvent<HTMLDivElement>, dest?: string) {
        e.preventDefault();
        if (!dest)
            return;
        setIsOpen(false);
        navigate(dest);
    }

    function onLogout(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsOpen(false);
        story.logout();
    }

    async function onRealLogout(e: React.MouseEvent) {
        e.preventDefault();
        setIsOpen(false);
        await story.quitGame();
    }

    function onLanguageToggle(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        setLocale(locale === "en" ? "ru" : "en");
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
            story.goBackwardHint("logout");
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
                <span className={styles.itemName}>{t("sideMenu.home")}</span>
            </div>
            <div onClick={(e) => onNavigate(e, "/chat")} id="chat-menu" className={styles.itemDiv}>
                <Chat className={styles.icon} />
                <span className={styles.itemName}>{t("sideMenu.chats")}</span>
            </div>
            <div onClick={(e) => onNavigate(e)} className={styles.itemDiv}>
                <Gear className={styles.icon} />
                <span className={styles.itemName}>{t("common.settings")}</span>
            </div>
            <div onClick={onLanguageToggle} className={styles.itemDiv}>
                <span className={styles.icon}>{locale === "en" ? "RU" : "EN"}</span>
                <span className={styles.itemName}>{t("sideMenu.switchLanguage")}</span>
            </div>
            {hintText ?
                <div className={styles.hintDiv}>
                    <div className={styles.hintHeader}>
                        <QuestionHint className={styles.hintIcon} />
                        <div className={styles.hintTexts}>
                            <span className={styles.hintLabel}>{t("sideMenu.currentObjective")}</span>
                            <span className={styles.hintText}>{hintText}</span>
                        </div>
                    </div>
                </div>
                : ""}
            <div onClick={onLogout} id="logout" className={`${styles.itemDiv} ${styles.leaveDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>{t("sideMenu.logOut")}</span>
            </div>
            <div onClick={onRealLogout} className={`${styles.itemDiv} ${styles.quitDiv}`}>
                <Leave className={styles.icon} />
                <span className={styles.itemName}>{t("sideMenu.quitGame")}</span>
            </div>
        </div>
    );
}