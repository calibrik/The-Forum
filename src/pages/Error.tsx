import type { FC } from "react";
interface IErrorProps {};

export const Error: FC<IErrorProps> = (_) => {
    return (
        <div>
            <h1>404 Page not found</h1>
        </div>
    );
}
