import type { FC } from "react";
import { Spinner as SpinnerIcon } from "./Icons";
import styles from "../scss/spinner.module.scss";
interface ISpinnerProps {};

export const Spinner: FC<ISpinnerProps> = (_) => {
    return (
        <div className={styles.container}>
            <SpinnerIcon spin/>
        </div>
    );
}
