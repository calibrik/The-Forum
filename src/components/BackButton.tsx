import type { FC } from "react";
import styles from "../scss/backButton.module.scss";
import { ArrowLeft } from "./Icons";
import { useNavigate } from "react-router";
interface IBackButtonProps {
    id?:string
};

export const BackButton: FC<IBackButtonProps> = (props) => {
    let navigate=useNavigate();

    return (
        <ArrowLeft id={props.id} onClick={()=>navigate(-1)} interactive className={styles.icon} />
    );
}
