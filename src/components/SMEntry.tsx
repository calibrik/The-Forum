import { useEffect, useState, type FC } from "react";
import styles from "../scss/smentry.module.scss"
import { getImageUrl } from "../utils";
import { CheckCircleFill } from "./Icons";
import { useNavigate } from "react-router";
import { db } from "../backend/db";
interface ISMEntryProps {
    isSelected?: boolean
    name: string
    type: "subforum" | "user"
    isNav?: boolean;
    onClick?: (name: string, type: "user" | "subforum") => void | Promise<void>
    className?: string
};

export const SMEntry: FC<ISMEntryProps> = (props) => {
    let navigate = useNavigate();
    const [pfp, setPfp] = useState<string | undefined>(undefined)

    function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        if (props.onClick)
            props.onClick(props.name, props.type);
        if (props.isNav)
            navigate(`/${props.type}/${props.name}`);
    }

    async function init() {
        if (props.type == "user") {
            const user = await db.users.where("nickname").equals(props.name).first();
            setPfp(user?.imageName);
        }
        else {
            const subforum = await db.subforums.where("name").equals(props.name).first();
            setPfp(subforum?.imageName);
        }
    }

    useEffect(() => {
        init();
    }, [])

    // const icon = props.isSelected ? <CheckCircleFill className={styles.icon} /> : <CheckCircle className={styles.icon} />
    return (
        <div tabIndex={-1} onClick={onClick} className={`${styles.container} ${props.isSelected ? styles.selected : ""} ${props.className}`}>
            {props.isSelected ? <CheckCircleFill className={styles.icon} /> : ""}
            <img src={getImageUrl(pfp ?? "placeholder.png")} className={styles.pfp} />
            <span className={styles.name}>{props.type == "user" ? "u/" : "f/"}{props.name}</span>
        </div>
    );
}
