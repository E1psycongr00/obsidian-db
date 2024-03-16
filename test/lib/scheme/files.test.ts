import knex, { Knex } from 'knex';
import {beforeAll, afterAll, beforeEach, afterEach, describe, expect, it} from 'vitest';
import { createFileTable, Files, batchInsertFiles } from '../../../src/lib/scheme/files';

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

        await createFileTable(db);
    });

    it(`${Files} 이름을 가진 테이블이 생성되어야 한다`, async () => {
        const hasTable = await db.schema.hasTable(Files);
        expect(hasTable).toBe(true);
    });

    it(`${Files} 테이블은 id, filePath, urlPath, fileType, metadata 컬럼을 가져야 한다`, async () => {
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

describe("batchInsertFiles", () => {
    let db: Knex;

    beforeEach(async () => {
        db = knex({
            client: "sqlite3",
            connection: {
                filename: ":memory:",
            },
            useNullAsDefault: true,
        });

        await createFileTable(db);
    });

    it("입력할 파일이 CHUNK_SIZE 단위보다 작은 경우 한번에 모두 입력되어야 한다 ", async () => {
        const files = [
            {
                filePath: "file1",
                urlPath: "url1",
                fileType: "type1",
                metadata: "metadata1",
            },
            {
                filePath: "file2",
                urlPath: "url2",
                fileType: "type2",
                metadata: "metadata2",
            },
        ];
        batchInsertFiles(db, files);
        const result = await db.select("*").from(Files);
        expect(result).toEqual(
            files.map((file, idx) => ({ id: idx + 1, ...file }))
        );
    });

    it("입력할 파일이 CHUNK_SIZE 단위보다 큰 경우 CHUNK_SIZE 단위로 나눠서 입력되어야 한다 ", async () => {
        const files = [
            {
                filePath: "file1",
                urlPath: "url1",
                fileType: "type1",
                metadata: "metadata1",
            },
            {
                filePath: "file2",
                urlPath: "url2",
                fileType: "type2",
                metadata: "metadata2",
            },
            {
                filePath: "file3",
                urlPath: "url3",
                fileType: "type3",
                metadata: "metadata3",
            },
            {
                filePath: "file4",
                urlPath: "url4",
                fileType: "type4",
                metadata: "metadata4",
            },
        ];
        batchInsertFiles(db, files, 2);
        const result = await db.select("*").from(Files);
        expect(result).toEqual(
            files.map((file, idx) => ({ id: idx + 1, ...file }))
        );
    });

    afterEach(async () => {
        await db.destroy();
    });
});