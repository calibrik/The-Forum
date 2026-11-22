import type { FC } from "react";
import { useStory } from "../providers/StoryProvider";
interface IErrorProps {};

export const Error: FC<IErrorProps> = (_) => {
    const { t } = useStory();

    return (
        <div>
            <h1>{t("error.notFound")}</h1>
        </div>
    );
}
