import { Knex } from "knex";
import { Link, Links } from "../scheme/links";

const CHUNK_SIZE = 1000;


function batchInsertLinks(
    db: Knex,
    links: Link[],
    chunkSize = CHUNK_SIZE
) {
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

export {batchInsertLinks}