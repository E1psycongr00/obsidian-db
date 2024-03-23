import { Knex } from "knex";
import { Link, Links } from "../scheme/links.js";
import { TitleLink } from "../parser.js";

const CHUNK_SIZE = 1000;

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
    const result = await db(Links)
        .select(
            "source.metadata as sourceMetadata",
            "target.metadata as targetMetadata",
            "links.type as type"
        )
        .join("files as source", "source.id", "links.sourceFileId")
        .join("files as target", "target.id", "links.targetFileId");
    return result.map(r => {
        r.sourceMetadata = JSON.parse(r.sourceMetadata);
        r.targetMetadata = JSON.parse(r.targetMetadata);
        return {
            sourceTitle: r.sourceMetadata.title,
            targetTitle: r.targetMetadata.title,
            type: r.type,
        } as TitleLink;
    });
}

async function findLinksForward(db: Knex, fileId: number) {
    const result = await db(Links)
        .select(
            "source.metadata as sourceMetadata",
            "target.metadata as targetMetadata",
            "links.type as type"
        )
        .join("files as source", "source.id", "links.sourceFileId")
        .join("files as target", "target.id", "links.targetFileId")
        .where("source.id", fileId);
    return result.map(r => {
        r.sourceMetadata = JSON.parse(r.sourceMetadata);
        r.targetMetadata = JSON.parse(r.targetMetadata);
        return {
            sourceTitle: r.sourceMetadata.title,
            targetTitle: r.targetMetadata.title,
            type: r.type,
        } as TitleLink;
    });
}

async function findLinksBackward(db: Knex, fileId: number) {
    const result = await db(Links)
        .select(
            "source.metadata as sourceMetadata",
            "target.metadata as targetMetadata",
            "links.type as type"
        )
        .join("files as source", "source.id", "links.sourceFileId")
        .join("files as target", "target.id", "links.targetFileId")
        .where("target.id", fileId);
    return result.map(r => {
        r.sourceMetadata = JSON.parse(r.sourceMetadata);
        r.targetMetadata = JSON.parse(r.targetMetadata);
        return {
            sourceTitle: r.sourceMetadata.title,
            targetTitle: r.targetMetadata.title,
            type: r.type,
        } as TitleLink;
    });
}

export { batchInsertLinks, findLinksAll, findLinksForward, findLinksBackward };
