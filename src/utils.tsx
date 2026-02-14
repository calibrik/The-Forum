export function getImageUrl(name: string): string {
    return new URL(`./assets/images/${name}.png`, import.meta.url).href; 
};

export function getJsonUrl(name: string): string {
    return new URL(`./assets/jsons/${name}.json`, import.meta.url).href; 
};

export async function delay(s: number) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
}