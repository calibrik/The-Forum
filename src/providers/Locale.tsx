import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from "react";
import { LOCALES, translate, type TLocale, type TTranslationKey, type TTranslationVars } from "../misc/locales";

interface ILocaleProviderProps {
    children: ReactNode;
}
interface ILocale {
    locale: TLocale;
    setLocale: (locale: TLocale) => void;
    t: (key: TTranslationKey, vars?: TTranslationVars) => string;
}

const LOCALE_STORAGE_KEY = "locale";

const LocaleContext = createContext<ILocale>({
    locale: "en",
    setLocale: () => { },
    t: (key, vars) => translate("en", key, vars),
});

export const LocaleProvider: FC<ILocaleProviderProps> = (props) => {
    const [locale, setLocaleState] = useState<TLocale>(() => {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
        return saved != null && saved in LOCALES ? saved as TLocale : "en";
    });

    function setLocale(next: TLocale) {
        setLocaleState(next);
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }

    function t(key: TTranslationKey, vars?: TTranslationVars) {
        return translate(locale, key, vars);
    }

    useEffect(()=>{
        setLocale("ru");
    },[])

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {props.children}
        </LocaleContext.Provider>
    );
};

export function useLocale() {
    return useContext(LocaleContext);
}
