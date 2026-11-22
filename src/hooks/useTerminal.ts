import { useRef } from "react";
import type { IHistoryEntry } from "../misc/db";

export interface ITerminalHandle {
    setExpectedCommand: (command: string, output?: string) => void;
    addHistory: (history: IHistoryEntry[]) => void;
    setPromptVisible: (visible: boolean) => void;
}

export function useTerminal() {
    const terminalHandle = useRef<ITerminalHandle>(undefined);

    function setTerminalHandle(handle?: ITerminalHandle) {
        terminalHandle.current = handle;
    }

    function setTerminalCommand(command: string, output?: string) {
        terminalHandle.current?.setExpectedCommand(command, output);
    }

    function addTerminalHistory(history: IHistoryEntry[]) {
        terminalHandle.current?.addHistory(history);
    }

    function setPromptVisibility(visible: boolean) {
        terminalHandle.current?.setPromptVisible(visible);
    }

    return { setTerminalHandle, setTerminalCommand, addTerminalHistory, setPromptVisibility };
}
