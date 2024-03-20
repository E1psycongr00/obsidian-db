import { Knex, knex } from "knex";
import { BuildAstOptions, LinkExtractor, ParseOptions } from "./parser";
import {
    createFileTagsTable,
    createFilesTable,
    createTagsTable,
} from "./scheme/files";
import { createLinkTable } from "./scheme/links";

interface DbConfig {
    knexConfig: Knex.Config;
    parseOptions: ParseOptions;
}

class ObsidianDb {
    knexDb: Knex;
    parseOptions: ParseOptions;

    constructor({ knexConfig, parseOptions }: DbConfig) {
        this.knexDb = knex(knexConfig);
        this.parseOptions = parseOptions;
    }

    public static builder() {
        return new ObsidianDbBuilder();
    }

    public async init() {
        await createFilesTable(this.knexDb);
        await createLinkTable(this.knexDb);
        await createTagsTable(this.knexDb);
        await createFileTagsTable(this.knexDb);
    }
}

class ObsidianDbBuilder {
    knexConfig: Knex.Config = {};
    buildAstOptions: BuildAstOptions = {};
    extractors: LinkExtractor[] = [];

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
        });
    }
}

export default ObsidianDb;
export { ObsidianDbBuilder, DbConfig };
