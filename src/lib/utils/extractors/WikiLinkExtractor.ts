import LinkExtractor from "./linkExtractor.js";
import AbstractLinkExtractor from "./AbstractLinkExtractor.js";

class WikiLinkExtractor extends AbstractLinkExtractor implements LinkExtractor {
    constructor() {
        super("wikiLink");
    }

    protected customExtractLogic(node: any): string {
        return node.data.permalink;
    }
}

export default WikiLinkExtractor;
