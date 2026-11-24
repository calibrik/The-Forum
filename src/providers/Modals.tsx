import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState, type FC, type ReactNode } from "react";
import styles from "../scss/modals.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { BaseButton } from "../components/BaseButton";
import { X } from "../components/Icons";
import { Spinner } from "../components/Spinner";
import { useStory } from "./StoryProvider";

interface IInvincibleModalProps { };
interface IInvincibleModalHandle {
    showQuestion: (title: string, desc: string, onConfirm:()=>void,onCancel:()=>void) => void
}

const InvincibleModal = forwardRef<IInvincibleModalHandle, IInvincibleModalProps>((_, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const onConfirmRef=useRef<()=>void>(undefined);
    const onCancelRef=useRef<()=>void>(undefined);
    const [title,setTitle]=useState<string>("");
    const [description,setDescription]=useState<string>("");
    const { t } = useStory();


    useImperativeHandle(ref, () => ({
        showQuestion(title, desc,onConfirm,onCancel) {
            setIsOpen(true);
            onConfirmRef.current=onConfirm;
            onCancelRef.current=onCancel;
            setTitle(title);
            setDescription(desc);
        },
    }));

    function onClose() {
        if(onCancelRef.current)
            onCancelRef.current();
        onCancelRef.current=undefined;
        setIsOpen(false);
        onConfirmRef.current=undefined;
    }

    function onConfirm() {
        if (onConfirmRef.current)
            onConfirmRef.current();
        onClose();
    }

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.open : styles.close}`}>
            <div className={`${styles.container} ${styles.invincible}`}>
                <h1 className={styles.title}>{title}</h1>
                <BaseButton type="button" icon={<X />} onClick={onClose} className={`${buttonStyles.secondaryButton} ${styles.closeButton}`} />
                <p className={styles.description}>{description}</p>
                <div className={styles.actionsDiv}>
                    <BaseButton type="button" onClick={onClose} className={`${buttonStyles.secondaryButton} ${styles.actionButton}`} >{t("common.cancel")}</BaseButton>
                    <BaseButton type="button" onClick={onConfirm} className={`${buttonStyles.primaryButton} ${styles.actionButton}`} >{t("common.confirm")}</BaseButton>
                </div>
            </div>
        </div>
    );
});





interface IModalsProviderProps {
    children: ReactNode;
};
interface IModals {
    invincibleModal: React.RefObject<IInvincibleModalHandle | null>
}
const ModalsContext = createContext<IModals | undefined>(undefined)

export const ModalsProvider: FC<IModalsProviderProps> = (props) => {
    const invincibleModal = useRef<IInvincibleModalHandle>(null);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);

    useEffect(() => {
        const onTranslationStart = () => setIsTranslating(true);
        const onTranslationEnd = () => setIsTranslating(false);
        window.addEventListener("translationStart", onTranslationStart);
        window.addEventListener("translationEnd", onTranslationEnd);
        return () => {
            window.removeEventListener("translationStart", onTranslationStart);
            window.removeEventListener("translationEnd", onTranslationEnd);
        };
    }, []);

    return (
        <ModalsContext.Provider value={{ invincibleModal }}>
            <InvincibleModal ref={invincibleModal} />
            {isTranslating && <div className={`${styles.overlay} ${styles.loading}`}><Spinner /></div>}
            {props.children}
        </ModalsContext.Provider>
    );
}

export function useModals() {
    const context = useContext(ModalsContext);

    if (!context)
        throw new Error('useModals must be used within the ModalsProvider!');

    return context;
}