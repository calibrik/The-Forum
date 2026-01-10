import type { FC, ReactNode } from "react";
import styles from '../scss/baseButton.module.scss';
interface IBaseButtonProps {
    children?: string;
    onClick?: () => Promise<void> | void;
    className?: string;
    animId?: string
    type?: "submit" | "reset" | "button" | undefined;
    icon?: ReactNode
    iconPos?: "start" | "end"
};

export const BaseButton: FC<IBaseButtonProps> = (props) => {

    let children: ReactNode;
    if (props.icon) {
        if (props.iconPos === 'start') {
            children = [props.icon, (props.children ?? "")];
        }
        else {
            children = [(props.children ?? ""),props.icon];
        }
    }
    else {
        children = props.children;
    }

    return (
        <button type={props.type} id={props.animId} data-istransition="true" onClick={props.onClick} className={`${styles.button} ${props.className}`}>{children}</button>
    );
}
