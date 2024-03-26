import { Knex } from "knex";

const Files = "files";
const Tags = "tags";
const FileTags = "fileTags";

interface Tag {
    id?: number;
    name: string;
}

interface Metadata {
    title?: string;
    date?: string;
    tags?: string[] | [];
}

interface File {
    id?: number;
    filePath: string;
    urlPath: string;
    fileType: string;
    metadata: Metadata;
}

interface FileTag {
    id?: number;
    fileId: number;
    tagId: number;
}

async function createFilesTable(db: Knex) {
    await db.schema.dropTableIfExists(Files);
    await db.schema.createTable(Files, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.string("filePath").notNullable().unique();
        table.string("urlPath").notNullable();
        table.string("fileType").notNullable();
        table.jsonb("metadata");
    });
    console.log("files table created");
}

async function createTagsTable(db: Knex) {
    await db.schema.dropTableIfExists(Tags);
    await db.schema.createTable(Tags, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.string("name").notNullable();
        table.unique("name");
    });
    console.log("tags table created");
}

async function createFileTagsTable(db: Knex) {
    await db.schema.dropTableIfExists(FileTags);
    await db.schema.createTable(FileTags, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.integer("fileId").references("files.id").notNullable();
        table.integer("tagId").references("tags.id").notNullable();
        table.unique(["fileId", "tagId"]);
    });
    console.log("fileTags table created");
}

export {
    Metadata,
    Files,
    File,
    createFilesTable,
    Tags,
    Tag,
    createTagsTable,
    FileTags,
    FileTag,
    createFileTagsTable,
};
