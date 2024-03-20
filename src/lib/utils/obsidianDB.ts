import { Knex, knex } from "knex";
import { BuildAstOptions, LinkExtractor, ParseOptions } from "./parser";
import {
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "./scheme/files";
import { createLinkTable } from "./scheme/links";
import { batchInsertDirectories } from "./read";
import { SelectFileCondition, findFiles } from "./query/fileQuery";
import { findLinksAll, findLinksBackward, findLinksForward } from "./query/linkQuery";

interface DbConfig {
    knexConfig: Knex.Config;
    parseOptions: ParseOptions;
    parseDirectory: string;
}

class ObsidianDb {
    knexDb: Knex;
    parseOptions: ParseOptions;
    parseDirectory: string;

    constructor({ knexConfig, parseOptions, parseDirectory }: DbConfig) {
        this.knexDb = knex(knexConfig);
        this.parseOptions = parseOptions;
        this.parseDirectory = parseDirectory;
    }

    public async init() {
        await createFilesTable(this.knexDb);
        await createLinkTable(this.knexDb);
        await createTagsTable(this.knexDb);
        await createFileTagsTable(this.knexDb);
        await batchInsertDirectories(this.knexDb, this.parseDirectory);
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
    knexConfig: Knex.Config = {};
    buildAstOptions: BuildAstOptions = {};
    extractors: LinkExtractor[] = [];
    parseDirectory: string;

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
