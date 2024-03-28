import { describe, it, expect } from "vitest";
import MdLinkExtractor from "../../../../src/lib/utils/extractors/MdLinkExtractor";
import Parser from "../../../../src/lib/utils/parser";

describe("MdLinkExtractor", () => {
    it("should extract link", () => {
        const extractor = new MdLinkExtractor();
        const parser = new Parser({
            permalinks: ["/test/__mock__/contents/A"],
        });
        const ast = parser.parseAst("[link!!](/test/__mock__/contents/A)");
        console.log(JSON.stringify(ast, null, 2));
        const links = extractor.extract(ast);
        expect(links).toEqual(["/test/__mock__/contents/A"]);
    });
});
