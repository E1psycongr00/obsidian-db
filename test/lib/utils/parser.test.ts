import { describe, it, expect, beforeAll } from "vitest";
import Parser from "../../../src/lib/utils/parser";
import { visit } from "unist-util-visit";
import path from "path";

describe("Parser", () => {
    describe("extractAst", () => {
        it("should parse markdown content", () => {
            const parser = new Parser();
            const result = parser.parseAst("# Hello World") as any;
            visit(result, "heading", (node, index, parent) => {
                expect(node.children[0].value).toBe("Hello World");
            });
        });

        it("should parse markdown content with wiki links", () => {
            const parser = new Parser();
            const result = parser.parseAst("# Hello World [[link]]") as any; // Add type assertion
            visit(result, "wikiLink", (node, index, parent) => {
                expect(node.data.hName).toBe("a");
                expect(node.data.permalink).toBe("link");
            });
        });

        it("shold parse markdown content with wiki links and permalinks", () => {
            const parser = new Parser({ permalinks: ["content/a/link"] });
            const result = parser.parseAst("# Hello World [[link]]") as any;
            visit(result, "wikiLink", (node, index, parent) => {
                expect(node.data.hProperties.href).toBe("content/a/link");
            });
        });
    });

    describe("extractMetadata", () => {
        it("should extract metadata", () => {
            const parser = new Parser();
            const source =
                "---\ntitle: Hello World\ndate: 2021-01-01\ntags: [tag1, tag2]\n--- #tag3";
            const result = parser.parseMetadata(source);
            expect(result.tags).contain("tag1").contain("tag2").contain("tag3");
        });
    });

    describe("extractLinks", () => {
        it("should extract links", () => {
            const parser = new Parser({ permalinks: ["link"]});
            const source = "# Hello World [[link]]";
            const ast = parser.parseAst(source);
            const links = parser.parseLinks(ast, "source");
            expect(links[0].source).toBe("source");
            expect(links[0].target).toBe("link");
        });
    });

    describe("parseFile", () => {
        it("should parse file content", () => {
            const parser = new Parser();
            const filePath = path.resolve("test/__mock__/contents/A.md");
            const {file, links} = parser.parseFile(filePath, "test/__mock__/contents");
            console.log(file);
            expect(file).toBeTruthy();
            expect(links).toBeTruthy();
        });
    });
});
