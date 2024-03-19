import {
    batchInsertLinks,
    findLinksAll,
} from "../../../../src/lib/utils/query/linkQuery";
import knex, { Knex } from "knex";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    File,
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "../../../../src/lib/utils/scheme/files";
import { Link, createLinkTable } from "../../../../src/lib/utils/scheme/links";
import { batchInsertFiles } from "../../../../src/lib/utils/query/fileQuery";

describe("batchInsertLinks", () => {
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
        await createLinkTable(db);
    });

    it("should insert links in batches", async () => {
        await db("fileTags").delete();
        await db("files").delete();
        await db("tags").delete();
        await db("links").delete();
        const links = Array.from({ length: 10 }, (_, i) => {
            return {
                sourceFileId: i,
                targetFileId: i + 1,
                type: "normal",
            } as Link;
        });

        await batchInsertLinks(db, links);

        const linkCount = await db.count().from("links");

        expect(linkCount[0]["count(*)"]).toBe(10);
    });

    afterAll(async () => {
        await db.destroy();
    });
});

describe("findLinksAll", () => {
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
        await createLinkTable(db);

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
        const links = Array.from({ length: 10 }, (_, i) => {
            return {
                sourceFileId: i + 1,
                targetFileId: i + 2,
                type: "normal",
            } as Link;
        });
        await batchInsertFiles(db, files);
        await batchInsertLinks(db, links);
    });

    it("should find all links", async () => {
        console.log(await db("fileTags").columnInfo());
    });
});
