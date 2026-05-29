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
