import { type FC } from "react";
import styles from "../scss/members.module.scss"
import { getImageUrl } from "../utils";
import { CheckCircleFill } from "./Icons";
interface ISMEntryProps {
    isSelected?: boolean
    name: string
    type:"subforum"|"user"
    onSelect?: (name:string) => void | Promise<void>
};

export const SMEntry: FC<ISMEntryProps> = (props) => {
    // const [isSelected, setIsSelected] = useState<boolean>(false);

    function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        if (props.onSelect)
            props.onSelect(props.name);
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
