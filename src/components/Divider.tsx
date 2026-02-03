import type { FC } from "react";
import styles from "../scss/divider.module.scss";
interface IDividerProps {
    children?:string;
};

export const Divider: FC<IDividerProps> = (props) => {
    return (
        <div className={styles.container}>
            <div className={styles.line} />
            <span className={styles.text}>{props.children}</span>
            <div className={styles.line} />
        </div>
    );
}
