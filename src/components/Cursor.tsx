import type { FC } from "react";
import styles from "../scss/cursor.module.scss"
interface ICursorProps {
    type:"normal"|"terminal";
    isOn?:boolean
};

export const Cursor: FC<ICursorProps> = (props) => {
    if (!props.isOn)
        return null;
    const element=props.type=="terminal"?"█":"";
    return (
        <span className={`${styles.cursor} ${props.type=="normal"?styles.normal:""}`}>{element}</span>
    );
}
