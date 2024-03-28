import LinkExtractor from "./linkExtractor.js";
import AbstractLinkExtractor from "./AbstractLinkExtractor.js";

class WikiLinkExtractor extends AbstractLinkExtractor implements LinkExtractor {
    constructor() {
        super("wikiLink");
    }

    protected customExtractLogic(node: any): string {
        const data = node.data;
        if (data.isEmbed === false && data.exists === true) {
            return data.permalink;
        }
        return "";
    }
}

export default WikiLinkExtractor;
