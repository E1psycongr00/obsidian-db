import { beforeEach } from "node:test";
import {
    batchInsertFiles,
    findFiles,
} from "../../../../src/lib/utils/query/fileQuery";
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

describe("selectFiles", () => {
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

    it("findFilesByFilePath", async () => {
        await db("fileTags").delete();
        await db("tags").delete();
        await db("files").delete();
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
        const resultFiles: File[] = await findFiles(db, {
            where: { filePath: "file1.md" },
        });
        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0].filePath).toBe("file1.md");
    });

    it("findFilesById", async () => {
        await db("fileTags").delete();
        await db("tags").delete();
        await db("files").delete();
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
        const resultFiles: File[] = await findFiles(db, { where: { id: 1 } });
        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0].filePath).toBe("file0.md");
    });

    it("findFilesByTitle", async () => {
        await db("fileTags").delete();
        await db("tags").delete();
        await db("files").delete();
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
        const resultFiles: File[] = await findFiles(db, {
            where: { title: "file1" },
        });
        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0].filePath).toBe("file1.md");
        expect(resultFiles[0].metadata.title).toBe("file1");
    });

    afterAll(async () => {
        await db.destroy();
    });

    it("findFilesByUrlPath", async () => {
        await db("fileTags").delete();
        await db("tags").delete();
        await db("files").delete();
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
        const resultFiles: File[] = await findFiles(db, {
            where: { urlPath: "file1" },
        });
        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0].filePath).toBe("file1.md");
        expect(resultFiles[0].urlPath).toBe("file1");
    });

});
