import { useState } from "react";
import { LOCALES, translate, type TLocale, type TTranslationKey, type TTranslationVars } from "../misc/locales";

const LOCALE_STORAGE_KEY = "locale";

export interface ILocale {
    locale: TLocale;
    setLocale: (locale: TLocale) => void;
    t: (key: TTranslationKey, vars?: TTranslationVars) => string;
}

function getStoredLocale(): TLocale {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    return saved != null && saved in LOCALES ? saved as TLocale : "en";
}

export function useLocale(): ILocale {
    const [locale, setLocaleState] = useState<TLocale>(getStoredLocale);

    function setLocale(next: TLocale) {
        setLocaleState(next);
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }

    function t(key: TTranslationKey, vars?: TTranslationVars) {
        return translate(locale, key, vars);
    }

    return { locale, setLocale, t };
}
