import { Knex } from "knex";

const Files = "files";
const Tags = "tags";
const FileTags = "fileTags";

interface Tag {
    id?: number;
    name: string;
}

interface File {
    id?: number;
    filePath: string;
    urlPath: string;
    fileType: string;
    metadata?:{[key:string]:string}
};

interface FileTag {
    id?: number;
    fileId: number;
    tagId: number;
}

async function createFilesTable(db: Knex) {
    if (await db.schema.hasTable(Files)) {
        return;
    }

    db.schema.createTable(Files, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.string("filePath").notNullable();
        table.string("urlPath").notNullable();
        table.string("fileType").notNullable();
        table.string("metadata");
    }).then(() => {
        console.log("files table created");
    });
}

async function createTagsTable(db: Knex) {
    db.schema.createTable(Tags, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.string("name").notNullable();
    }).then(() => {
        console.log("tags table created");
    })
}

async function createFileTagsTable(db: Knex) {
    db.schema.createTable(FileTags, (table: Knex.CreateTableBuilder) => {
        table.increments("id");
        table.integer("fileId").references("files.id").notNullable();
        table.integer("tagId").references("tags.id").notNullable();
        table.unique(["fileId", "tagId"]);
    }).then(() => {
        console.log("fileTags table created");
    })
}

export {
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
