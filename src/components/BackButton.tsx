import type { FC } from "react";
import styles from "../scss/backButton.module.scss";
import { ArrowLeft } from "./Icons";
import { useNavigate } from "react-router";
interface IBackButtonProps {
    id?:string
    isActive?: boolean
};

export const BackButton: FC<IBackButtonProps> = (props) => {
    let navigate=useNavigate();
    const isActive = props.isActive ?? true;

    return (
        <ArrowLeft id={props.id} onClick={isActive ? () => navigate(-1) : undefined} interactive className={styles.icon} />
    );
}
