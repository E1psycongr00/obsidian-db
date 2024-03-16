import { beforeEach } from "node:test";
import { batchInsertFiles } from "../../../../src/lib/utils/query/fileQuery";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import knex, { Knex } from "knex";
import {
    File,
    FileTags,
    Files,
    Tags,
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "../../../../src/lib/utils/scheme/files";

describe("batchInsertFiles", () => {
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
        await createTagsTable(db);
        await createFileTagsTable(db);
    });

    beforeEach(async () => {
        await db("files").delete();
        await db("tags").delete();
        await db("fileTags").delete();
    });

    it("파일 batchInsert해야 한다.", async () => {
        const files = Array.from({ length: 10 }, (_, i) => {
            return {
                filePath: `file${i}.md`,
                urlPath: `file${i}`,
                fileType: "md",
                metadata: {
                    title: `file${i}`,
                    date: "2021-01-01",
                    tags: [`tag${i}`, `tag${i + 1}`],
                },
            } as File;
        });

        await batchInsertFiles(db, files);

        const fileCount = await db.count().from("files");
        const tagCount = await db.count().from("tags");
        const fileTagsCount = await db.count().from("fileTags");

        expect(fileCount[0]["count(*)"]).toBe(10);
        expect(tagCount[0]["count(*)"]).toBe(10 + 1);
        expect(fileTagsCount[0]["count(*)"]).toBe(10 * 2);
    });

    afterAll(async () => {
        await db.destroy();
    });
});
