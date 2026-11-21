import type { FC } from "react";
import styles from "../scss/subforumSettingsPage.module.scss";
import { LocalizationSetting } from "../components/LocalizationSetting";

export const UserSettings: FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <LocalizationSetting />
            </div>
        </div>
    );
}
