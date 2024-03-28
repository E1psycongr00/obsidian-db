import ImageWikiLinkExtractor from "../../../../src/lib/utils/extractors/ImageWikiLinkExtractor";
import Parser from "../../../../src/lib/utils/parser";
import { describe, it } from "vitest";

describe("ImageLinkExtractor", () => {
    it("should extract image link", () => {
        const extractor = new ImageWikiLinkExtractor();
        const parser = new Parser({permalinks: ["imageLink"]});
        const ast = parser.parseAst("![[imageLink]]");
        const links = extractor.extract(ast);
        console.log(links);
    });
});
