import { useRef } from "react";

export interface ISubforumSettingsHandle {
    setDemoteTarget: (mods?: string[]) => void;
    setTransferTarget: (user?: string) => void;
}

export function useSubforumSettings() {
    const subforumSettingsHandle = useRef<ISubforumSettingsHandle>(undefined);

    function setSubforumSettingsHandle(handle?: ISubforumSettingsHandle) {
        subforumSettingsHandle.current = handle;
    }

    function setDemoteTarget(mods?: string[]) {
        subforumSettingsHandle.current?.setDemoteTarget(mods);
    }

    function setTransferTarget(user?: string) {
        subforumSettingsHandle.current?.setTransferTarget(user);
    }

    return { setSubforumSettingsHandle, setDemoteTarget, setTransferTarget };
}
