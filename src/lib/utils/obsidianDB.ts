import knex, { Knex } from "knex";
import Parser, { BuildAstOptions, ParseOptions } from "./parser.js";
import {
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "./scheme/files.js";
import { createLinkTable } from "./scheme/links.js";
import { batchInsertDirectories } from "./read.js";
import { SelectFileCondition, findFileWhere, findFilesAll } from "./query/fileQuery.js";
import {
    findLinksAll,
    findLinksBackward,
    findLinksForward,
} from "./query/linkQuery.js";
import LinkExtractor from "./extractors/linkExtractor.js";

interface DbConfig {
    knexConfig: Knex.Config;
    parseOptions: ParseOptions;
}

class ObsidianDb {
    private knexDb: Knex;
    private parser: Parser;

    constructor({ knexConfig, parseOptions }: DbConfig) {
        this.knexDb = knex(knexConfig);
        this.parser = new Parser(
            parseOptions.buildAstOptions || {},
            parseOptions.linkExtractors || []
        );
    }

    public static builder() {
        return new ObsidianDbBuilder();
    }

    public async createTables() {
        await createFilesTable(this.knexDb);
        await createLinkTable(this.knexDb);
        await createTagsTable(this.knexDb);
        await createFileTagsTable(this.knexDb);
    }

    public async indexDirectory(directory: string) {
        await batchInsertDirectories(this.knexDb, directory, this.parser);
    }


    public db() {
        return this.knexDb;
    }

    public async findFileWhere(condition: Record<string ,any>) {
        return await findFileWhere(this.knexDb, condition);
    }

    public async findFilesAll(condition: SelectFileCondition) {
        return await findFilesAll(this.knexDb, condition);
    }

    public async findUrlLinksAll() {
        return await findLinksAll(this.knexDb);
    }

    public async findUrlLinksForward(fileId: number) {
        return await findLinksForward(this.knexDb, fileId);
    }

    public async findUrlLinksBackward(fileId: number) {
        return await findLinksBackward(this.knexDb, fileId);
    }

    public async findNeighborLinks(fileId: number) {
        const forward = await findLinksForward(this.knexDb, fileId);
        const backward = await findLinksBackward(this.knexDb, fileId);
        const linkSet = new Set();
        for (const link of [...forward, ...backward]) {
            if (linkSet.has(link) || linkSet.has({ target: link.target, source: link.source, type: link.type })) {
                linkSet.add(link);
            }
        }
        return Array.from(linkSet);
    }
}

class ObsidianDbBuilder {
    private knexConfig: Knex.Config = {};
    private buildAstOptions: BuildAstOptions = {};
    private extractors: LinkExtractor[] = [];

    withKnexConfig(knexConfig: Knex.Config) {
        this.knexConfig = knexConfig;
        return this;
    }

    withBuildAstOptions(buildAstOptions: BuildAstOptions) {
        this.buildAstOptions = buildAstOptions;
        return this;
    }

    build() {
        const parseOptions: ParseOptions = {
            buildAstOptions: this.buildAstOptions,
            linkExtractors: this.extractors,
        };
        return new ObsidianDb({
            knexConfig: this.knexConfig,
            parseOptions: parseOptions
        });
    }
}

export default ObsidianDb;
export { ObsidianDbBuilder, DbConfig };
