import {
    Links,
    createLinkTable,
    batchInsertLinks,
    Link,
} from "../../../../src/lib/utils/scheme/links";
import knex, { Knex } from "knex";
import {
    describe,
    it,
    expect,
    afterAll,
    beforeAll,
    beforeEach,
    afterEach,
} from "vitest";

describe("createLinkTable", () => {
    let db: Knex;

    beforeAll(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });
        await createLinkTable(db);
    });

    it(`links 이름을 가진 테이블이 생성되어야 한다`, async () => {
        const hasTable = await db.schema.hasTable(Links);
        expect(hasTable).toBe(true);
    });

    it(`links 테이블은 id, sourceFileId, targetFileId, type, direction 컬럼을 가져야 한다`, async () => {
        const promise: Promise<Boolean>[] = [];
        promise.push(db.schema.hasColumn(Links, "id"));
        promise.push(db.schema.hasColumn(Links, "sourceFileId"));
        promise.push(db.schema.hasColumn(Links, "targetFileId"));
        promise.push(db.schema.hasColumn(Links, "type"));
        promise.push(db.schema.hasColumn(Links, "direction"));
        const [id, sourceFileId, targetFileId, type, direction] =
            await Promise.all(promise);
        expect([id, sourceFileId, targetFileId, type, direction]).toEqual([
            true,
            true,
            true,
            true,
            true,
        ]);
    });

    afterAll(async () => {
        await db.destroy();
    });
});

describe("batchInsertLinks", () => {
    let db: Knex;

    beforeEach(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });
        await createLinkTable(db);
    });

    it("입력할 파일이 CHUNK_SIZE 단위보다 작은 경우 한번에 모두 입력되어야 한다", async () => {
        const links = Array.from({ length: 10 }, (_, i) => ({
            sourceFileId: i,
            targetFileId: i + 1,
            type: "normal",
            direction: "forward",
        })) as Link[];
        await batchInsertLinks(db, links);
        const result = await db(Links).select();
        expect(result.length).toBe(10);
    });

    it("입력할 파일이 CHUNK_SIZE 단위보다 큰 경우 CHUNK_SIZE 단위로 나눠서 입력되어야 한다", async () => {
        const links = Array.from({ length: 20 }, (_, i) => ({
            sourceFileId: i,
            targetFileId: i + 1,
            type: "normal",
            direction: "forward",
        })) as Link[];
        await batchInsertLinks(db, links, 10);
        const result = await db(Links).select();
        expect(result.length).toBe(20);
    });

    afterEach(async () => {
        await db.destroy();
    });
});
