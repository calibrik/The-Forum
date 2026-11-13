import { getSoundUrl } from "./utils";

const SOUNDS = {
    typingFast: "typingFast.mp3",
    typingSlow: "typingSlow.mp3",
    typingSuperSlow: "typingSuperSlow.mp3"
} as const;

export type TSoundName = keyof typeof SOUNDS;

async function playNode(node: HTMLAudioElement, name: TSoundName) {
    try {
        await node.play();
    }
    catch (e:any) {
        if (e.name=="AbortError")
            return;
        throw new Error(`Failed to play sound "${name}".`, { cause: e });
    }
}

class AudioPlayer {
    private sounds = new Map<TSoundName, HTMLAudioElement>();

    constructor() {
        for (const name of Object.keys(SOUNDS) as TSoundName[]) {
            const audio = new Audio(getSoundUrl(SOUNDS[name]));
            audio.preload = "auto";
            audio.load();
            this.sounds.set(name, audio);
        }
    }

    playSfx(name: TSoundName, volume = 1, isLoop = false) {
        const source = this.sounds.get(name);
        if (!source)
            throw new Error(`Sound "${name}" is not loaded.`);
        const node = source.cloneNode(true) as HTMLAudioElement;
        node.volume = volume;
        node.loop = isLoop;
        playNode(node, name);
        return node;
    }

    playMusic(name: TSoundName, volume = 1) {
        const music = this.sounds.get(name);
        if (!music || !music.paused)
            return;
        music.loop = true;
        music.volume = volume;
        playNode(music, name);
    }

    stopMusic(name: TSoundName) {
        const music = this.sounds.get(name);
        if (!music)
            return;
        music.pause();
        music.currentTime = 0;
    }
}

export const audioPlayer = new AudioPlayer();
