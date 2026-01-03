import type { FC } from "react";
interface IBaseButtonProps {
    children?:string;
    onClick?:()=>Promise<void>|void;
    className?:string;
    animId?:string
};

export const BaseButton: FC<IBaseButtonProps> = (props) => {
    return (
        <div> 
            <button id={props.animId} data-isbutton="true" onClick={props.onClick} className={props.className}>{props.children}</button>
        </div>
    );
}
