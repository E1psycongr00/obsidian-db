import AbstractLinkExtractor from "./AbstractLinkExtractor.js";
import LinkExtractor from "./linkExtractor.js";

class ImageWikiLinkExtractor
    extends AbstractLinkExtractor
    implements LinkExtractor
{
    constructor() {
        super("wikiLink");
    }

    protected customExtractLogic(node: any): string {
        const data = node.data;
        if (data.isEmbed === true && data.exists === true) {
            return data.permalink;
        }
        return "";
    }
}

export default ImageWikiLinkExtractor;
