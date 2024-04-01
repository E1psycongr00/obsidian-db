import { beforeEach } from "node:test";
import {
    batchInsertFiles,
    findFileWhere,
    findFilesAll,
    findTagsAll,
    findTagsByFileIds,
} from "../../../../src/lib/utils/query/fileQuery";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import knex, { Knex } from "knex";
import {
    File,
    Tag,
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

describe("fileFileWhere", () => {
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

    it("where가 없으면 오류 출력", async () => {
        await expect(findFileWhere(db, {})).rejects.toThrow();
    });

    it("filePath로 데이터를 가져온다", async () => {
        await db("files").delete();
        await db("tags").delete();
        await db("fileTags").delete();
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
        const resultFile: File = await findFileWhere(db, {
            filePath: "file1.md",
        });
        expect(resultFile.filePath).toBe("file1.md");
    });

    it("urlPath로 데이터를 가져온다", async () => {
        await db("files").delete();
        await db("tags").delete();
        await db("fileTags").delete();
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
        const resultFile: File = await findFileWhere(db, { urlPath: "file1" });
        expect(resultFile.urlPath).toBe("file1");
    });

    it("title로 데이터를 가져온다", async () => {
        await db("files").delete();
        await db("tags").delete();
        await db("fileTags").delete();
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
        const resultFile: File = await findFileWhere(db, { title: "file1" });
        expect(resultFile.metadata.title).toBe("file1");
    });

    afterAll(async () => {
        await db.destroy();
    });
});

describe("findFilesAll", () => {
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
        const resultFiles: File[] = await findFilesAll(db, {
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
        const fileId = await db("files")
            .select("id")
            .where({ filePath: "file0.md" });
        const resultFiles: File[] = await findFilesAll(db, {
            where: { id: fileId[0].id },
        });
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
        const resultFiles: File[] = await findFilesAll(db, {
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
        const resultFiles: File[] = await findFilesAll(db, {
            where: { urlPath: "file1" },
        });
        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0].filePath).toBe("file1.md");
        expect(resultFiles[0].urlPath).toBe("file1");
    });

    it("태그 이름으로 파일을 가져와야 한다.", async () => {
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
        const resultFiles: File[] = await findFilesAll(db, {
            where: { tagNames: ["tag1"] },
        });
        expect(resultFiles.length).toBe(2);
        expect(resultFiles[0].metadata.tags).toContain("tag1");
        expect(resultFiles[1].metadata.tags).toContain("tag1");
    });
});

describe("findTagsAll", () => {
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

    it("모든 태그를 가져와야 한다.", async () => {
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
        const resultTags: Tag[] = await findTagsAll(db);
        expect(resultTags.length).toBe(10 + 1);
    });

    afterAll(async () => {
        await db.destroy();
    });
});

describe("findTagsByFileIds", () => {
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

    it("파일 아이디로 태그를 가져와야 한다.", async () => {
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
        const resultTags: Tag[] = await findTagsByFileIds(db, [1, 2]);
        expect(resultTags.length).toBe(4);
    });

    afterAll(async () => {
        await db.destroy();
    });
});
