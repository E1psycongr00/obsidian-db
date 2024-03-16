import { Knex } from "knex";

export const Files = "files";

const CHUNK_SIZE = 1000;

export interface File {
    id?: number;
    filePath: string;
    urlPath: string;
    fileType: string;
    metadata?: string;
}

export async function createFileTable(db: Knex) {
    if (await db.schema.hasTable(Files)) {
        return;
    }

    await db.schema.createTable(Files, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.string("filePath");
        table.string("urlPath");
        table.string("fileType");
        table.string("metadata");
    });
}

export async function batchInsertFiles(
    db: Knex,
    files: File[],
    chunkSize = CHUNK_SIZE
) {
    const fileSize = files.length;
    const chunk = Math.ceil(fileSize / chunkSize);
    db.transaction(async function (trx) {
        const promises = [];
        for (let i = 0; i < chunk; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            const chunkFiles = files.slice(start, end);
            const promise = trx.batchInsert(Files, chunkFiles);
            promises.push(promise);
        }
        return Promise.all(promises);
    }).catch(function (error) {
        console.error(error);
    });
}
