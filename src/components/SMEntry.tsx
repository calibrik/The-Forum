import { type FC } from "react";
import styles from "../scss/members.module.scss"
import { getImageUrl } from "../utils";
import { CheckCircleFill } from "./Icons";
import { useNavigate } from "react-router";
interface ISMEntryProps {
    isSelected?: boolean
    name: string
    type:"subforum"|"user"
    destination?:string
    onClick?: (name:string) => void | Promise<void>
};

export const SMEntry: FC<ISMEntryProps> = (props) => {
    let navigate=useNavigate();

    function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        if (props.onClick)
            props.onClick(props.name);
        if (props.destination)
            navigate(props.destination);
    }

    // const icon = props.isSelected ? <CheckCircleFill className={styles.icon} /> : <CheckCircle className={styles.icon} />
    return (
        <div tabIndex={-1} onClick={onClick} className={`${styles.container} ${props.isSelected ? styles.selected : ""}`}>
            {props.isSelected ? <CheckCircleFill className={styles.icon} /> : ""}
            <img src={getImageUrl("placeholder")} className={styles.pfp} />
            <span className={styles.name}>{props.type=="user"?"u/":"f/"}{props.name}</span>
        </div>
    );
}
