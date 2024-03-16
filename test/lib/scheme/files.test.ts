import knex, { Knex } from 'knex';
import {beforeAll, afterAll, beforeEach, afterEach, describe, expect, it} from 'vitest';
import { createFilesTable, createFileTagsTable, createTagsTable, Files, Tags} from '../../../src/lib/utils/scheme/files';

describe("createFileTable", () => {
    let db: Knex;

    beforeAll(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });

        await createFilesTable(db);
    });

    it(`files 이름을 가진 테이블이 생성되어야 한다`, async () => {
        const hasTable = await db.schema.hasTable(Files);
        expect(hasTable).toBe(true);
    });

    it(`files 테이블은 id, filePath, urlPath, fileType, metadata 컬럼을 가져야 한다`, async () => {
        const promise: Promise<boolean>[] = [];
        promise.push(db.schema.hasColumn(Files, "id"));
        promise.push(db.schema.hasColumn(Files, "filePath"));
        promise.push(db.schema.hasColumn(Files, "urlPath"));
        promise.push(db.schema.hasColumn(Files, "fileType"));
        promise.push(db.schema.hasColumn(Files, "metadata"));
        const [id, filePath, urlPath, fileType, metadata] = await Promise.all(
            promise
        );
        expect([id, filePath, urlPath, fileType, metadata]).toEqual([
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


describe("createTagsTable", () => {
    let db: Knex;

    beforeAll(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });

        await createTagsTable(db);
    });

    it(`tags 이름을 가진 테이블이 생성되어야 한다`, async () => {
        const hasTable = await db.schema.hasTable(Tags);
        expect(hasTable).toBe(true);
    });

    it(`tags 테이블은 id, name 컬럼을 가져야 한다`, async () => {
        const promise: Promise<boolean>[] = [];
        promise.push(db.schema.hasColumn(Tags, "id"));
        promise.push(db.schema.hasColumn(Tags, "name"));
        const [id, name] = await Promise.all(promise);
        expect([id, name]).toEqual([true, true]);
    });

    afterAll(async () => {
        await db.destroy();
    });
});

describe("createFileTagsTable", () => {
    let db: Knex;

    beforeAll(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });

        await createTagsTable(db);
        await createFilesTable(db);
        await createFileTagsTable(db);
    });

    it(`fileTags 이름을 가진 테이블이 생성되어야 한다`, async () => {
        const hasTable = await db.schema.hasTable("fileTags");
        expect(hasTable).toBe(true);
    });

    it(`fileTags 테이블은 id, fileId, tagId 컬럼을 가져야 한다`, async () => {
        const promise: Promise<boolean>[] = [];
        promise.push(db.schema.hasColumn("fileTags", "id"));
        promise.push(db.schema.hasColumn("fileTags", "fileId"));
        promise.push(db.schema.hasColumn("fileTags", "tagId"));
        const [id, fileId, tagId] = await Promise.all(promise);
        expect([id, fileId, tagId]).toEqual([true, true, true]);
    });

    afterAll(async () => {
        await db.destroy();
    });
});