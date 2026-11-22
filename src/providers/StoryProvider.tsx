import { createContext, useContext, useEffect, type FC } from "react";
import { Outlet } from "react-router";
import { EffectOverlay } from "../components/EffectOverlay";
import type { ISearchFieldHandle } from "../components/SearchField";
import type { ITypingTextBoxHandle } from "../components/TypingTextBox";
import { useStoryFuncs } from "../hooks/useStoryFuncs";
import type { IChatHandle } from "../hooks/useChat";
import type { ILoginHandle } from "../hooks/useLogin";
import type { ISubforumSettingsHandle } from "../hooks/useSubforumSettings";
import type { ITerminalHandle } from "../hooks/useTerminal";
import type { IVimHandle } from "../hooks/useVim";
import type { IMessage, IScriptLine } from "../misc/db";
import type { TLocale, TTranslationKey, TTranslationVars } from "../misc/locales";

interface IStoryProviderProps {
};

interface IStoryHook {
    resumeStoryFromHint: (clickedId: string) => boolean
    recoverCheckpoint: (id: number, scl?: IScriptLine) => Promise<void>
    recoverStoryOnPage: (level: number, tbs: Map<string, ITypingTextBoxHandle>) => void
    resetAnims: () => Promise<void>
    createUser: (nickname: string, password: string) => Promise<void>
    goBackwardHint: (clickedId: string) => void,
    goForwardHint: (clickedId: string) => void,
    setHeaderSearch: (ref: ISearchFieldHandle | null) => void,
    setChatHandle(ch: IChatHandle | undefined): Promise<void>;
    setLoginHandle(h: ILoginHandle | undefined): void;
    setSubforumSettingsHandle(h: ISubforumSettingsHandle | undefined): void;
    setTerminalHandle(h: ITerminalHandle | undefined): void;
    setVimHandle(h: IVimHandle | undefined): void;
    addMessageFromUser(content: string): Promise<void>
    getMessages(chatId: string): Promise<IMessage[]>,
    login: (nickname: string, password: string) => Promise<{ nickname?: string; password?: string }>,
    logout: () => void,
    quitGame: (isAnim?: boolean, nav?: boolean) => Promise<void>,
    getExpectedUser: () => string | undefined,
    locale: TLocale,
    setLocale: (locale: TLocale) => void,
    t: (key: TTranslationKey, vars?: TTranslationVars) => string,
}
type StoryFuncsType = ReturnType<typeof useStoryFuncs>;
interface IStoryProvider extends IStoryHook {
    _getStoryHook: () => StoryFuncsType | undefined
}

const StoryContext = createContext<IStoryProvider | undefined>(undefined);

export const StoryProvider: FC<IStoryProviderProps> = (_) => {
    const storyFunc = useStoryFuncs();

    useEffect(() => {
        storyFunc.resetBuffers();
    }, []);

    return (
        <StoryContext.Provider value={{
            ...storyFunc, _getStoryHook() {
                return storyFunc;
            },
        }}>
            <EffectOverlay id="effectOverlay1" />
            <EffectOverlay id="effectOverlayBlur" />
            <EffectOverlay id="effectOverlay2" />
            <EffectOverlay id="effectOverlay3" />
            <Outlet />
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);

    if (!context)
        throw new Error('useStory must be used within the ModalsProvider!');

    return context;
}
