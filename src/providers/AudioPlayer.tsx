import { createContext, useContext, useEffect, useRef, type FC, type ReactNode } from "react";
import { getSoundUrl } from "../misc/utils";

const SOUNDS = {
    typingFast: "typingFast.mp3",
    typingSlow: "typingSlow.mp3",
    typingSuperSlow: "typingSuperSlow.mp3",
    music: "music.mp3",
} as const;

export type TSoundName = keyof typeof SOUNDS;

interface IAudioPlayer {
    playSfx: (name: TSoundName, volume?: number, isLoop?: boolean) => HTMLAudioElement
    playMusic: (name: TSoundName, volume?: number) => void
    stopMusic: (name: TSoundName) => void
}

interface IAudioProviderProps {
    children: ReactNode;
}

const AudioContext = createContext<IAudioPlayer | undefined>(undefined);

async function playNode(node: HTMLAudioElement, name: TSoundName) {
    try {
        await node.play();
    }
    catch (e) {
        throw new Error(`Failed to play sound "${name}".`, { cause: e });
    }
}

export const AudioProvider: FC<IAudioProviderProps> = (props) => {
    const sounds = useRef<Map<TSoundName, HTMLAudioElement>>(new Map());

    useEffect(() => {
        for (const name of Object.keys(SOUNDS) as TSoundName[]) {
            const audio = new Audio(getSoundUrl(SOUNDS[name]));
            audio.preload = "auto";
            audio.load();
            sounds.current.set(name, audio);
        }
    }, []);

    function playSfx(name: TSoundName, volume = 1, isLoop = false) {
        const source = sounds.current.get(name);
        if (!source)
            throw new Error(`Sound "${name}" is not loaded.`);
        const node = source.cloneNode(true) as HTMLAudioElement;
        node.volume = volume;
        node.loop = isLoop;
        playNode(node, name);
        return node;
    }

    function playMusic(name: TSoundName, volume = 1) {
        const music = sounds.current.get(name);
        if (!music || !music.paused)
            return;
        music.loop = true;
        music.volume = volume;
        playNode(music, "music");
    }

    function stopMusic(name: TSoundName) {
        const music = sounds.current.get(name);
        if (!music)
            return;
        music.pause();
        music.currentTime = 0;
    }

    return (
        <AudioContext.Provider value={{ playSfx, playMusic, stopMusic }}>
            {props.children}
        </AudioContext.Provider>
    );
}

export function useAudioPlayer() {
    const context = useContext(AudioContext);

    if (!context)
        throw new Error('useAudioPlayer must be used within the AudioProvider!');

    return context;
}
