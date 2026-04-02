import { type FC } from "react";
import styles from "../scss/smentry.module.scss"
import { getImageUrl } from "../utils";
import { CheckCircleFill } from "./Icons";
import { useNavigate } from "react-router";
interface ISMEntryProps {
    isSelected?: boolean
    name: string
    type:"subforum"|"user"
    isNav?:boolean;
    onClick?: (name:string,type:"user"|"subforum") => void | Promise<void>
    className?:string
};

export const SMEntry: FC<ISMEntryProps> = (props) => {
    let navigate=useNavigate();

    function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        if (props.onClick)
            props.onClick(props.name,props.type);
        if (props.isNav)
            navigate(`/${props.type}/${props.name}`);
    }

    // const icon = props.isSelected ? <CheckCircleFill className={styles.icon} /> : <CheckCircle className={styles.icon} />
    return (
        <div tabIndex={-1} onClick={onClick} className={`${styles.container} ${props.isSelected ? styles.selected : ""} ${props.className}`}>
            {props.isSelected ? <CheckCircleFill className={styles.icon} /> : ""}
            <img src={getImageUrl("placeholder.png")} className={styles.pfp} />
            <span className={styles.name}>{props.type=="user"?"u/":"f/"}{props.name}</span>
        </div>
    );
}
