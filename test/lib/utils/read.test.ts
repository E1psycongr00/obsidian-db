import knex, { Knex } from "knex";
import { batchInsertDirectories } from "../../../src/lib/utils/read";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "../../../src/lib/utils/scheme/files";
import { createLinkTable } from "../../../src/lib/utils/scheme/links";
import path from "path";
import Parser from "../../../src/lib/utils/parser";
import { findFilePathsAll } from "../../../src/lib/utils/permalinks/filePath";

describe("batchInsertDirectories", () => {
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

    afterAll(async () => {
        await db.destroy();
    });

    it("should insert directories and files into the database", async () => {
        const dir = path.resolve("test", "__mock__", "contents");
        const permalinks = findFilePathsAll(dir).map(
            filePath => splitFilePath(filePath).urlPath
        );
        const parser = new Parser({ permalinks });
        await batchInsertDirectories(db, dir, parser);

        const fileCount = await db.count().from("files");
        expect(fileCount[0]["count(*)"]).toBe(6);
    });

    it("should insert links between files into the database", async () => {
        const dir = path.resolve("test", "__mock__", "contents");
        const permalinks = findFilePathsAll(dir).map(
            filePath => splitFilePath(filePath).urlPath
        ).map(urlPath => path.relative(dir, urlPath).replace(/\\/g, "/"));
        const parser = new Parser({ permalinks });
        await batchInsertDirectories(db, dir, parser);

        const linkCount = await db.count().from("links");
        expect(linkCount[0]["count(*)"]).toBe(2);
    });

    it("should insert tags into the database", async () => {
        const dir = path.resolve("test", "__mock__", "contents");
        const permalinks = findFilePathsAll(dir).map(
            filePath => splitFilePath(filePath).urlPath
        );
        const parser = new Parser({ permalinks });
        await batchInsertDirectories(db, dir, parser);
        const tagCount = await db.count().from("tags");
        const tagNames = await db("tags").select("name");
        expect(tagCount[0]["count(*)"]).toBe(4);
        expect(tagNames.map((tag: { name: string }) => tag.name))
            .contain("tag1")
            .contain("tag2")
            .contain("tag3")
            .contain("tag4");
    });

    function splitFilePath(filePath: string) {
        const split = filePath.split(".");
        const fileType = split[split.length - 1];
        const urlPath = split.slice(0, split.length - 1).join(".").replace(/\\/g, "/");
        return { urlPath, fileType };
    }
});
