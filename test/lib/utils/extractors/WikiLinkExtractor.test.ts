import WikiLinkExtractor from "../../../../src/lib/utils/extractors/WikiLinkExtractor";
import { describe, expect, it } from "vitest";
import Parser from "../../../../src/lib/utils/parser";

describe("WikiLinkExtractor", () => {
    it("Wiki Link Test", () => {
        const extractor = new WikiLinkExtractor();
        const parser = new Parser();
        const ast = parser.parseAst("# Hello World [[link1]], [[link2]]");
        const links = extractor.extract(ast);
        expect(links).contain("link1").contain("link2");
    });
});
