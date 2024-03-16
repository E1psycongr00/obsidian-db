import { Knex } from "knex";
import { Files, File, Tags, Tag, FileTag, FileTags } from "../scheme/files";

const CHUNK_SIZE = 1000;

async function batchInsertFiles(
    db: Knex,
    files: File[],
    chunkSize = CHUNK_SIZE
) {
    const fileSize = files.length;
    const chunk = Math.ceil(fileSize / chunkSize);
    db.transaction(async function (trx) {
        for (let i = 0; i < chunk; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            const chunkFiles = files.slice(start, end)
            
            const tansFiles = chunkFiles.map(file => {
                const metadata = JSON.stringify(file.metadata);
                return { ...file, metadata };
            });
            
            const filesResult = await trx
                .batchInsert(Files, tansFiles, chunkSize)
                .returning(["id", "metadata"]);

            const tagsResult = await trx
                .batchInsert(Tags, extractTags(chunkFiles), chunkSize)
                .returning(["id", "name"]);
            const fileTags = [];
            for (const f of filesResult) {
                const fileId = f.id;
                const metadata = JSON.parse(f.metadata as any);
                const tags = metadata.tags || [];
                for (const t of tags) {
                    const tagId = tagsResult.find(tag => tag.name === t)?.id;
                    if (tagId) {
                        fileTags.push({ fileId, tagId});
                    }
                }
            }
            await trx.batchInsert(FileTags, fileTags, chunkSize);
        }
    });
}

function extractTagName(file: File) {
    return file.metadata.tags || [];
}

function extractTags(files: File[]) {
    const tags = new Set(files.map(file => file.metadata?.tags || []).flat());
    return Array.from(tags).map(tag => ({ name: tag } as Tag));
}

export { batchInsertFiles };