import { Root } from "remark-gfm";
import { visit } from "unist-util-visit";
import LinkExtractor from "./linkExtractor.js";

abstract class AbstractLinkExtractor implements LinkExtractor {
    private readonly linkType: string;

    constructor(linkType: string) {
        this.linkType = linkType;
    }

    public extract(ast: Root): string[] {
        const targetLinks: string[] = [];
        visit(ast, this.linkType, (node: any) => {
            const targetLink = this.customExtractLogic(node);
            if (targetLink) {
                targetLinks.push(this.toUrlPath(targetLink));
            }
        });
        return targetLinks;
    }

    protected abstract customExtractLogic(node: any): string;

    private toUrlPath(source: string) {
        source = source.replace(/\\/g, "/");
        if (source.startsWith("/") && source.length > 1) {
            return source.slice(1);
        }
        return source;
    }
}

export default AbstractLinkExtractor;
