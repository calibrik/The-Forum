import { db } from "./backend/db";

export function getImageUrl(name: string): string {
    return new URL(`./assets/images/${name}`, import.meta.url).href;
};

export function getJsonUrl(name: string): string {
    return new URL(`./assets/jsons/${name}`, import.meta.url).href;
};

export async function delay(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

export function numberToText(n: number) {
    if (n >= 1000000)
        return `${(n / 1000000).toFixed(1)}m`;
    if (n >= 1000)
        return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
}

export function commonPrefixLength(a: string, b: string) {
    const max = Math.min(a.length, b.length);
    let i = 0;
    while (i < max && a[i] === b[i])
        i++;
    return i;
}

export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date).toLowerCase()
}

export function formatDay(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
}

//Mulberry32 aka random ass fuckery idk
export function seededRandom(seed: number) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const bridge = {
    exec: async <T extends (...args: any[]) => any>(
        fn: T,
        ...args: Parameters<T>
    ): Promise<ReturnType<T>> => {
        return await fn(...args);
    }
}

async function clearStringFromUserNicknameHash(s: string) {
    const user = await db.users.where("savedStoryId").aboveOrEqual(0).first()
    if (!user)
        return s;
    const regex = new RegExp(`#${user.nickname}`, 'g');
    return s.replace(regex, user.nickname);
}

export async function addHashToUserNickname(nickname: string) {
    const user = await db.users.where("savedStoryId").aboveOrEqual(0).first()
    if (!user)
        return nickname;
    return user.nickname == nickname ? `#${nickname}` : nickname;
}

export async function sanitizeDbFetch<T>(obj: T) {
    if (!obj)
        return obj;
    return JSON.parse(await clearStringFromUserNicknameHash(JSON.stringify(obj))) as T;
}

export function getContainerCharCapacity(container: HTMLElement) {
    const style = window.getComputedStyle(container);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) 
        return { cols: 0, rows: 0, total: 0 };

    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const charWidth = ctx.measureText("0").width;
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const innerWidth = container.clientWidth - paddingX;
    const innerHeight = container.clientHeight - paddingY;
    const lineHeight = parseFloat(style.lineHeight) ?? (parseFloat(style.fontSize) * 1.2);
    const cols = Math.floor(innerWidth / charWidth);
    const rows = Math.floor(innerHeight / lineHeight);

    return {
        cols,                
        rows,                 
    };
}