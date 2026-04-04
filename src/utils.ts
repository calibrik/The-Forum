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

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date).toLowerCase()
}