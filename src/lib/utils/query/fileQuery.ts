import { Knex } from "knex";
import {
    Files,
    File,
    Tags,
    Tag,
    FileTags,
} from "../scheme/files";

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
            const chunkFiles = files.slice(start, end);

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
                        fileTags.push({ fileId, tagId });
                    }
                }
            }
            await trx.batchInsert(FileTags, fileTags, chunkSize);
        }
    });
}

interface SelectFileCondition {
    where?: {
        id?: number;
        filePath?: string;
        urlPath?: string;
        fileType?: string;
        title?: string;
        tagNames?: string[];
    };
    limit?: number;
}

async function findFiles(db: Knex, condition: SelectFileCondition) {
    const query = db("files").select("files.*");
    if (condition.where) {
        Object.entries(condition.where).forEach(([key, value]) => {
            switch (key) {
                case "title" || "date": {
                    query.andWhereRaw("??->>? = ?", ["metadata", key, value]);
                    break;
                }
                case "tagNames": break;
                default: {
                    query.andWhere(key, value);
                }
            }
        });
        if (condition.where.tagNames) {
            query.join("fileTags", "files.id", "fileTags.fileId")
            .join("tags", "fileTags.tagId", "tags.id")
            .whereIn("tags.name", condition.where.tagNames);
        }
    }

    if (condition.limit) {
        query.limit(condition.limit);
    }
    return convertFilesWithMetadata(await query);
}

async function findTagsAll(db: Knex) {
    return await db("tags").select("*") as Tag[];
}

async function findTagsByFileIds(db: Knex, fileIds: number[]) {
    return (await db("fileTags")
        .select("tags.*")
        .join("tags", "fileTags.tagId", "tags.id")
        .whereIn("fileTags.fileId", fileIds)) as Tag[];
}

function extractTagName(file: File) {
    return file.metadata.tags || [];
}

function extractTags(files: File[]) {
    const tags = new Set(files.map(file => file.metadata?.tags || []).flat());
    return Array.from(tags).map(tag => ({ name: tag } as Tag));
}

function convertFilesWithMetadata(files: any[]) {
    return files.map(file => {
        const metadata = JSON.parse(file.metadata);
        return { ...file, metadata };
    }) as File[];
}

export {
    SelectFileCondition,
    batchInsertFiles,
    findFiles,
    findTagsAll,
    findTagsByFileIds,
};
