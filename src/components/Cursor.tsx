import { forwardRef, useImperativeHandle, useState } from "react";
import styles from "../scss/cursor.module.scss"
interface ICursorProps {
    type:"normal"|"terminal";
};
export interface ICursorHandle{
    setType:(type:"normal"|"terminal")=>void
}

export const Cursor = forwardRef<ICursorHandle,ICursorProps>((props,ref) => {
    const [type,setType]=useState<"normal"|"terminal">(props.type);

    useImperativeHandle(ref,()=>({
        setType
    }))

    const element=type=="terminal"?"█":"";
    return (
        <span id="cursor" className={`${styles.cursor} ${props.type=="normal"?styles.normal:""}`}>{element}</span>
    );
});
