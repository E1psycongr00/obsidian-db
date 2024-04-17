import { Knex } from "knex";
import { Link, Links } from "../scheme/links.js";

const CHUNK_SIZE = 200;

function batchInsertLinks(db: Knex, links: Link[], chunkSize = CHUNK_SIZE) {
    const linkSize = links.length;
    const chunk = Math.ceil(linkSize / chunkSize);
    db.transaction(async function (trx) {
        const promises = [];
        for (let i = 0; i < chunk; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            const chunkLinks = links.slice(start, end);
            const promise = trx.batchInsert(Links, chunkLinks);
            promises.push(promise);
        }
        return Promise.all(promises);
    });
}

async function findLinksAll(db: Knex) {
    return await db(Links)
        .select(
            "s.urlPath as source",
            "t.urlPath as target",
            "links.type as type"
        )
        .join("files as s", "s.id", "links.sourceFileId")
        .join("files as t", "t.id", "links.targetFileId");
}

async function findLinksForward(db: Knex, fileId: number) {
    return await db(Links)
        .select(
            "s.urlPath as source",
            "t.urlPath as target",
            "links.type as type"
        )
        .join("files as s", "s.id", "links.sourceFileId")
        .join("files as t", "t.id", "links.targetFileId")
        .where("s.id", fileId);
}

async function findLinksBackward(db: Knex, fileId: number) {
    return await db(Links)
        .select(
            "s.urlPath as source",
            "t.urlPath as target",
            "links.type as type"
        )
        .join("files as s", "s.id", "links.sourceFileId")
        .join("files as t", "t.id", "links.targetFileId")
        .where("t.id", fileId);
}

export { batchInsertLinks, findLinksAll, findLinksForward, findLinksBackward };
