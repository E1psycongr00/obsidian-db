import knex, { Knex } from "knex";
import Parser, {
    BuildAstOptions,
    ParseOptions,
} from "./parser.js";
import {
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "./scheme/files.js";
import { createLinkTable } from "./scheme/links.js";
import { batchInsertDirectories } from "./read.js";
import { SelectFileCondition, findFiles } from "./query/fileQuery.js";
import {
    findLinksAll,
    findLinksBackward,
    findLinksForward,
} from "./query/linkQuery.js";
import LinkExtractor from "./extractors/linkExtractor.js";

interface DbConfig {
    knexConfig: Knex.Config;
    parseOptions: ParseOptions;
    parseDirectory: string;
}

class ObsidianDb {
    private knexDb: Knex;
    private parser: Parser;
    private parseDirectory: string;

    constructor({ knexConfig, parseOptions, parseDirectory }: DbConfig) {
        this.knexDb = knex(knexConfig);
        this.parser = new Parser(
            parseOptions.buildAstOptions || {},
            parseOptions.linkExtractors || []
        );
        this.parseDirectory = parseDirectory;
    }

    public async init() {
        await createFilesTable(this.knexDb);
        await createLinkTable(this.knexDb);
        await createTagsTable(this.knexDb);
        await createFileTagsTable(this.knexDb);
        await batchInsertDirectories(this.knexDb, this.parseDirectory, this.parser);
    }

    public db() {
        return this.knexDb();
    }

    public async findFiles(condition: SelectFileCondition) {
        return await findFiles(this.knexDb, condition);
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
}

class ObsidianDbBuilder {
    private knexConfig: Knex.Config = {};
    private buildAstOptions: BuildAstOptions = {};
    private extractors: LinkExtractor[] = [];
    private parseDirectory: string;

    constructor(parseDirectory: string) {
        this.parseDirectory = parseDirectory;
    }

    withKnexConfig(knexConfig: Knex.Config) {
        this.knexConfig = knexConfig;
        return this;
    }

    withBuildAstOptions(buildAstOptions: BuildAstOptions) {
        this.buildAstOptions = buildAstOptions;
        return this;
    }

    addLinkExtractor(extractor: LinkExtractor) {
        this.extractors.push(extractor);
        return this;
    }

    build() {
        const parseOptions: ParseOptions = {
            buildAstOptions: this.buildAstOptions,
            linkExtractors: this.extractors,
        };
        return new ObsidianDb({
            knexConfig: this.knexConfig,
            parseOptions: parseOptions,
            parseDirectory: this.parseDirectory,
        });
    }
}

export default ObsidianDb;
export { ObsidianDbBuilder, DbConfig };
