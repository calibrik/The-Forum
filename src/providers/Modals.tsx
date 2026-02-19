import { createContext, forwardRef, useContext, useImperativeHandle, useRef, useState, type FC, type ReactNode } from "react";
import styles from "../scss/modals.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { BaseButton } from "../components/BaseButton";
import { X } from "../components/Icons";

interface IInvincibleModalProps { };
interface IInvincibleModalHandle {
    showQuestion: (title: string, desc: string, onConfirm:()=>void) => void
}

const InvincibleModal = forwardRef<IInvincibleModalHandle, IInvincibleModalProps>((_, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const onConfirmRef=useRef<()=>void>(undefined);
    const [title,setTitle]=useState<string>("");
    const [description,setDescription]=useState<string>("");


    useImperativeHandle(ref, () => ({
        showQuestion(title: string, desc: string,onConfirm) {
            setIsOpen(true);
            onConfirmRef.current=onConfirm;
            setTitle(title);
            setDescription(desc);
        },
    }));

    function onClose() {
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
                    <BaseButton type="button" onClick={onClose} className={`${buttonStyles.secondaryButton} ${styles.actionButton}`} >Cancel</BaseButton>
                    <BaseButton type="button" onClick={onConfirm} className={`${buttonStyles.primaryButton} ${styles.actionButton}`} >Confirm</BaseButton>
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

    return (
        <ModalsContext.Provider value={{ invincibleModal }}>
            <InvincibleModal ref={invincibleModal} />
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