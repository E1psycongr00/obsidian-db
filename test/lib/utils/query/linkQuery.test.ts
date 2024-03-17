import { batchInsertLinks } from "../../../../src/lib/utils/query/linkQuery";
import knex, { Knex } from "knex";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
    createFilesTable,
    createTagsTable,
} from "../../../../src/lib/utils/scheme/files";
import { Link, createLinkTable } from "../../../../src/lib/utils/scheme/links";
import { beforeEach } from "node:test";

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
        await createFilesTable(db);
        await createLinkTable(db);
    });

    beforeEach(async () => {
        await db("files").delete();
        await db("tags").delete();
        await db("fileTags").delete();
        await db("links").delete();
    });

    it("should insert links in batches", async () => {
        const links = Array.from({ length: 10 }, (_, i) => {
            return {
                sourceFileId: i,
                targetFileId: i + 1,
                type: "normal",
                direction: "forward",
            } as Link;
        });

        await batchInsertLinks(db, links);

        const linkCount = await db.count().from("links");

        expect(linkCount[0]["count(*)"]).toBe(10);
    });

    afterAll(async () => {
        await db.destroy();
    })
});
