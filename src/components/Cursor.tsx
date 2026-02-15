import type { FC } from "react";
import styles from "../scss/cursor.module.scss"
interface ICursorProps {
    type:"normal"|"terminal";
};

export const Cursor: FC<ICursorProps> = (props) => {
    const element=props.type=="terminal"?"█":"";
    return (
        <span id="cursor" className={`${styles.cursor} ${props.type=="normal"?styles.normal:""}`}>{element}</span>
    );
}
