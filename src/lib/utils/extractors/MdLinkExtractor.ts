import AbstractLinkExtractor from "./AbstractLinkExtractor.js";
import LinkExtractor from "./linkExtractor.js";

class MdLinkExtractor extends AbstractLinkExtractor implements LinkExtractor {

    constructor() {
        super("link");
    }

    protected customExtractLogic(node: any): string {
        const url = node.url;
        return url;
    }

}

export default MdLinkExtractor;