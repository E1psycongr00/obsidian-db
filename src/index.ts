import { ObsidianDbBuilder, DbConfig } from "./lib/utils/obsidianDB.js";
import ObsidianDb from "./lib/utils/obsidianDB.js";
import AbstractLinkExtractor from "./lib/utils/extractors/AbstractLinkExtractor.js";
import LinkExtractor from "./lib/utils/extractors/linkExtractor.js";
import {
    findFilePathsAll,
    findPermalinksAll,
    toPermalink,
    fixWindowPath,
} from "./lib/utils/permalinks/filePath.js";

export default ObsidianDb;
export { ObsidianDbBuilder, DbConfig, AbstractLinkExtractor, LinkExtractor };
export { findFilePathsAll, findPermalinksAll, toPermalink, fixWindowPath };
