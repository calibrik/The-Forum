import { useRef } from "react";
import type { IShowPlaceholderField } from "../misc/db";

export interface ILoginHandle {
    setShowNicknamePlaceholder: (show: boolean) => void;
    setShowPasswordPlaceholder: (show: boolean) => void;
}

export function useLogin() {
    const loginHandle = useRef<ILoginHandle>(undefined);

    function setLoginHandle(handle?: ILoginHandle) {
        loginHandle.current = handle;
    }

    function setShowPlaceholders(field: IShowPlaceholderField, show: boolean) {
        if (field == "nickname")
            loginHandle.current?.setShowNicknamePlaceholder(show);
        else
            loginHandle.current?.setShowPasswordPlaceholder(show);
    }

    return { setLoginHandle, setShowPlaceholders };
}
