import type { FC } from "react";
interface IBaseButtonProps {
    children?:string;
    onClick?:()=>Promise<void>|void;
    className?:string;
};

export const BaseButton: FC<IBaseButtonProps> = (props) => {
    return (
        <button onClick={props.onClick} className={props.className}>{props.children}</button>
    );
}
