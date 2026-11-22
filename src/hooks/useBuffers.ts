import { db } from "../misc/db";

function stripPreserve<T extends { isPreserved?: boolean }>(items: T[]): T[] {
    items.forEach((item) => { delete item.isPreserved });
    return items;
}

export function useBuffers() {
    async function enablePreserveBuffers() {
        await Promise.all([
            db.postsBuffer.toCollection().modify((p) => { p.isPreserved = true }),
            db.chatsBuffer.toCollection().modify((c) => { c.isPreserved = true }),
            db.usersBuffer.toCollection().modify((u) => { u.isPreserved = true }),
            db.storyMessagesBuffer.toCollection().modify((m) => { m.isPreserved = true }),
            db.subforumsBuffer.toCollection().modify((s) => { s.isPreserved = true }),
        ]);
    }

    async function resetBuffers() {
        await Promise.all([db.postsBuffer.clear(), db.chatsBuffer.clear(), db.usersBuffer.clear(), db.storyMessagesBuffer.clear(), db.subforumsBuffer.clear()]);
    }

    async function sinkBuffers() {
        await db.posts.bulkPut(stripPreserve(await db.postsBuffer.toArray()));
        await db.chats.bulkPut(stripPreserve(await db.chatsBuffer.toArray()));
        await db.users.bulkPut(stripPreserve(await db.usersBuffer.toArray()));
        await db.storyMessages.bulkPut(stripPreserve(await db.storyMessagesBuffer.toArray()));
        await db.subforums.bulkPut(stripPreserve(await db.subforumsBuffer.toArray()));
        await resetBuffers();
    }

    async function onNavigateAway() {
        await Promise.all([
            db.postsBuffer.filter((p) => !p.isPreserved).delete(),
            db.chatsBuffer.filter((c) => !c.isPreserved).delete(),
            db.usersBuffer.filter((u) => !u.isPreserved).delete(),
            db.storyMessagesBuffer.filter((m) => !m.isPreserved).delete(),
            db.subforumsBuffer.filter((s) => !s.isPreserved).delete(),
        ]);
    }

    return { enablePreserveBuffers, resetBuffers, sinkBuffers, onNavigateAway };
}
