import { beforeAll, describe, expect, test } from 'vitest';
import { db, seedUsers } from '../misc/db';

describe("test of testing", () => {
    beforeAll(async () => {
        await seedUsers();
    })

    test("test 1", async () => {
        expect(await db.users.where("nickname").equals("penis").first()).toMatchObject({ nickname: "penis", description: "Secret dev account for testing shit" });
    })
})
