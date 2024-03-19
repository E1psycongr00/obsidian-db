import { Knex } from "knex";
import { Link, Links } from "../scheme/links";
import { TitleLink } from "../parser";

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
    return (await db(Links)
        .select(
            "source.name as sourceTitle",
            "target.name as targetTitle",
            "links.type as type"
        )
        .join("files as source", "source.id", "links.sourceFileId")
        .join(
            "files as target",
            "target.id",
            "links.targetFileId"
        )) as TitleLink[];
}

export { batchInsertLinks, findLinksAll };
