import type { FC } from "react";
import styles from "../scss/backButton.module.scss";
import { ArrowLeft } from "./Icons";
import { useNavigate } from "react-router";
interface IBackButtonProps {};

export const BackButton: FC<IBackButtonProps> = (_) => {
    let navigate=useNavigate();

    return (
        <ArrowLeft onClick={()=>navigate(-1)} interactive className={styles.icon} />
    );
}
