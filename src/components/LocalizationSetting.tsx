import type { FC } from "react";
import styles from "../scss/localizationSetting.module.scss";
import { useLocale } from "../providers/Locale";
import { LOCALE_NAMES, type TLocale } from "../misc/locales";

interface ILocalizationSettingProps {
    showLabel?: boolean;
}

export const LocalizationSetting: FC<ILocalizationSettingProps> = (props) => {
    const { locale, setLocale, t } = useLocale();
    const showLabel = props.showLabel ?? true;

    return (
        <div className={styles.container}>
            {showLabel && <label htmlFor="localization" className={styles.label}>{t("settings.localization")}:</label>}
            <select id="localization" aria-label={t("settings.localization")} className={styles.select} value={locale} onChange={(e) => setLocale(e.target.value as TLocale)}>
                {(Object.keys(LOCALE_NAMES) as TLocale[]).map((option) => (
                    <option key={option} value={option}>{LOCALE_NAMES[option]}</option>
                ))}
            </select>
        </div>
    );
}
