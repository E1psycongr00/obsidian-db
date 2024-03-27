import LinkExtractor from "./linkExtractor";
import AbstractLinkExtractor from "./AbstractLinkExtractor";

class WikiLinkExtractor extends AbstractLinkExtractor implements LinkExtractor {
    constructor() {
        super("wikiLink");
    }

    protected customExtractLogic(node: any): string {
        return node.data.permalink;
    }
}

export default WikiLinkExtractor;
