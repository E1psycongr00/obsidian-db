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
                targetLinks.push(targetLink);
            }
        });
        return targetLinks;
    }

    protected abstract customExtractLogic(node: any): string;
}

export default AbstractLinkExtractor;
