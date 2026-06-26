import '@testing-library/jest-dom';
import "fake-indexeddb/auto";
// import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import mockUsers from "./assets/jsons/users.json";
import mockChats from "./assets/jsons/chats.json";
import mockPosts from "./assets/jsons/posts.json";
import mockScript from "./assets/jsons/script.json";
import mockSubforums from "./assets/jsons/subforums.json";
import { afterEach, vi } from 'vitest';

vi.mock('./utils.ts', async (importOriginal) => {
    const original = await importOriginal<typeof import('./utils.ts')>();
    return {
        ...original,
        getJsonUrl: (name: string) => name,
        getImageUrl: (name: string) => name,
    };
});

const globalFetchMock = vi.fn(async (url: string) => {
    if (url == "users.json")
        return {
            ok: true,
            status: 200,
            json: async () => mockUsers,
        } as Response;
    else if (url == "chats.json")
        return {
            ok: true,
            status: 200,
            json: async () => mockChats,
        } as Response;
    else if (url == "posts.json")
        return {
            ok: true,
            status: 200,
            json: async () => mockPosts,
        } as Response;
    else if (url == "script.json")
        return {
            ok: true,
            status: 200,
            json: async () => mockScript,
        } as Response;
    else if (url == "subforums.json")
        return {
            ok: true,
            status: 200,
            json: async () => mockSubforums,
        } as Response;
});

vi.stubGlobal("fetch", globalFetchMock);

afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("fetch", globalFetchMock);
});

// beforeEach(async () => {
//     await seedNew();
// })

// afterEach(async () => {
//     await Promise.all(db.tables.map(table => table.clear()));
// })


