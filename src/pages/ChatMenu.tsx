import type { FC } from "react";
import styles from "../scss/chatMenu.module.scss";
import { getImageUrl } from "../utils";
import { Dot } from "../components/Icons";
interface IChatMenuProps { };
interface IDialogProps {
    isRead?: boolean
};

const Dialog: FC<IDialogProps> = (props) => {
    return (
        <div className={styles.dialog}>
            <img src={getImageUrl("placeholder")} alt="" className={styles.pfp} />
            <div className={styles.info}>
                <h3 className={styles.nickname}>u/user</h3>
                <p className={`${styles.lastMessage} ${props.isRead ? styles.read : ""}`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet. Quisque ultrices porta diam egestas faucibus. Vivamus ac dapibus sem, eu pulvinar nunc. Maecenas a diam risus. Morbi molestie ac velit quis tristique. Aenean vel augue maximus, laoreet tortor nec, vulputate nulla. In sodales erat sed condimentum finibus.</p>
            </div>
            {props.isRead?"":<Dot className={styles.dot}/>}
        </div>
    );
}


export const ChatMenu: FC<IChatMenuProps> = () => {
    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.header}>Chats</h1>
            </div>
            <div className={styles.dialogsContainer}>
                <Dialog />
                <Dialog />
                <Dialog isRead />
                <Dialog isRead />
            </div>
        </div>
    );
}
