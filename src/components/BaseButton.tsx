import type { FC, ReactNode } from "react";
import styles from '../scss/baseButton.module.scss';
interface IBaseButtonProps {
    children?: string;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
    className?: string;
    id?: string
    type?: "submit" | "reset" | "button" | undefined;
    icon?: ReactNode
    iconPos?: "start" | "end"
};

export const BaseButton: FC<IBaseButtonProps> = (props) => {
    const iconPos = props.iconPos ?? "start";

    return (
        <button type={props.type} id={props.id} data-istransition="true" onClick={props.onClick} className={`${styles.button} ${props.className}`}>{iconPos == "start" ? props.icon : ""}{props.children}{iconPos == "end" ? props.icon : ""}</button>
    );
}
