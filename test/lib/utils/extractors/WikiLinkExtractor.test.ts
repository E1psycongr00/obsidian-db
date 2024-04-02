import WikiLinkExtractor from "../../../../src/lib/utils/extractors/WikiLinkExtractor";
import { describe, expect, it } from "vitest";
import Parser from "../../../../src/lib/utils/parser";

describe("WikiLinkExtractor", () => {
    it("Wiki Link Test", () => {
        const extractor = new WikiLinkExtractor();
        const parser = new Parser({ permalinks: ["/", "/lc/link1", "/link2"] });
        const ast = parser.parseAst("# Hello World [[link1]], [[link2]]");
        const links = extractor.extract(ast);
        expect(links).contain("lc/link1").contain("link2");
    });

    it("Wki Link가 index인 경우", () => {
        const extractor = new WikiLinkExtractor();
        const parser = new Parser({ permalinks: ["/", "/lc/index", "/link2"] });
        const ast = parser.parseAst("# Hello World [[/]]");
        const links = extractor.extract(ast);
        expect(links).contain("/");
    });

    it("Wki Link가 어떤 파일에도 없는 경우", () => {
        const extractor = new WikiLinkExtractor();
        const parser = new Parser({ permalinks: ["/", "/lc/index", "/link2"] });
        const ast = parser.parseAst("# Hello World [[notExist]]");
        const links = extractor.extract(ast);
        expect(links.length).toBe(0);
    })
});
