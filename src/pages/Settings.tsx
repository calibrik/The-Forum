import type { FC } from "react";
import styles from "../scss/settingsPage.module.scss";
import { BackButton } from "../components/BackButton";
import { LocalizationSetting } from "../components/LocalizationSetting";
import { useLocale } from "../providers/Locale";

export const Settings: FC = () => {
    const { t } = useLocale();

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <div className={styles.backButton}>
                    <BackButton />
                </div>
                <h1 className={styles.header}>{t("common.settings")}</h1>
            </div>
            <div className={styles.contentContainer}>
                <LocalizationSetting />
            </div>
        </div>
    );
}
