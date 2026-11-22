import { useRef } from "react";

export interface IVimHandle {
    setTextToType: (text: string) => void;
}

export function useVim() {
    const vimHandle = useRef<IVimHandle>(undefined);

    function setVimHandle(handle?: IVimHandle) {
        vimHandle.current = handle;
    }

    function setVimType(content: string) {
        vimHandle.current?.setTextToType(content);
    }

    return { setVimHandle, setVimType };
}
