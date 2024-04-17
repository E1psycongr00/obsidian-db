import { Knex } from "knex";
import { Files, File, Tags, Tag, FileTags } from "../scheme/files.js";

const CHUNK_SIZE = 200;

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

/**
 * 주어진 조건에 따라 데이터베이스에서 파일을 찾습니다.
 * 
 * 예시
 * ```ts
 * const file = await findFileWhere(db, { id: 1 });
 * ```
 * 
 * @param {Knex} db - 데이터베이스 연결을 나타내는 Knex 인스턴스입니다.
 * @param {Record<string, any>} condition - 파일을 필터링하는 조건입니다.
 * @returns {Promise<File>} - json metadata를 가공한 파일 객체 프로미스를 반환합니다.
 * @throws {Error} - 조건이 제공되지 않은 경우 오류를 throw합니다.
 */
async function findFileWhere(db: Knex, condition: Record<string, any>) {
    const query = db("files").select("*");
    if (!condition) {
        throw new Error("condition is required");
    }
    Object.entries(condition).forEach(([key, value]) => {
        switch (key) {
            case "title" || "date": {
                query.andWhereRaw("??->>? = ?", ["metadata", key, value]);
                break;
            }
            case "tagNames":
                break;
            default: {
                query.andWhere(key, value);
            }
        }
    });
    if (condition.tagNames) {
        query
            .join("fileTags", "files.id", "fileTags.fileId")
            .join("tags", "fileTags.tagId", "tags.id")
            .whereIn("tags.name", condition.tagNames);
    }
    query.first();
    return toFile(await query);
}

/**
 * 주어진 조건에 따라 데이터베이스에서 파일을 찾습니다.
 * @param db - 데이터베이스 연결을 나타내는 Knex 인스턴스입니다.
 * @param condition - 검색 조건을 지정하는 조건 객체입니다.
 * @returns 조건에 맞는 파일들의 배열을 반환하는 프로미스입니다.
 */
async function findFilesAll(db: Knex, condition: SelectFileCondition) {
    const query = db("files").select("files.*");
    if (condition.where) {
        Object.entries(condition.where).forEach(([key, value]) => {
            switch (key) {
                case "title" || "date": {
                    query.andWhereRaw("??->>? = ?", ["metadata", key, value]);
                    break;
                }
                case "tagNames":
                    break;
                default: {
                    query.andWhere(key, value);
                }
            }
        });
        if (condition.where.tagNames) {
            query
                .join("fileTags", "files.id", "fileTags.fileId")
                .join("tags", "fileTags.tagId", "tags.id")
                .whereIn("tags.name", condition.where.tagNames);
        }
    }

    if (condition.limit) {
        query.limit(condition.limit);
    }
    return (await query).map(toFile);
}

async function findTagsAll(db: Knex) {
    return (await db("tags").select("*")) as Tag[];
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

function toFile(file: any): File {
    const metadata = JSON.parse(file.metadata);
    return { ...file, metadata };
}

export {
    SelectFileCondition,
    batchInsertFiles,
    findFileWhere,
    findFilesAll,
    findTagsAll,
    findTagsByFileIds,
    toFile
};
