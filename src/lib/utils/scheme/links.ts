import { Knex } from "knex";

export const Links = "links";

const CHUNK_SIZE = 1000;

export interface Link {
    id?: number;
    sourceFileId: number;
    targetFileId: number;
    type: "normal" | "embed";
}

export async function createLinkTable(db: Knex) {
    await db.schema.dropTableIfExists(Links);
    await db.schema.createTable(Links, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.integer("sourceFileId").references("files.id");
        table.integer("targetFileId").references("files.id");
        table.enu("type", ["normal", "embed"]);

        table.unique(["sourceFileId", "targetFileId"]);
    });
    console.log("links table created");
}

export async function batchInsertLinks(
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
