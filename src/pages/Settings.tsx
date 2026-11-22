import type { FC } from "react";
import styles from "../scss/settingsPage.module.scss";
import { BackButton } from "../components/BackButton";
import { LocalizationSetting } from "../components/LocalizationSetting";
import { useStory } from "../providers/StoryProvider";

export const Settings: FC = () => {
    const { t } = useStory();

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
