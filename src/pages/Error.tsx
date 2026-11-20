import type { FC } from "react";
import { useLocale } from "../providers/Locale";
interface IErrorProps {};

export const Error: FC<IErrorProps> = (_) => {
    const { t } = useLocale();

    return (
        <div>
            <h1>{t("error.notFound")}</h1>
        </div>
    );
}
