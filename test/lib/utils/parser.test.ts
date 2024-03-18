import { describe, it, expect } from "vitest";
import {buildAst} from "../../../src/lib/utils/parser";
import {visit} from "unist-util-visit";

describe("buildAst", () => {
    it("should parse markdown content", () => {
        const result = buildAst("# Hello World") as any;
        visit(result, "heading", (node, index, parent) => {
            expect(node.children[0].value).toBe("Hello World");
        });
    });

    it("should parse markdown content with wiki links", () => {
        const result = buildAst("# Hello World [[link]]") as any; // Add type assertion
        // console.log(JSON.stringify(result, null, 2));
        visit(result, "wikiLink", (node, index, parent) => {
            expect(node.data.hName).toBe("a");
            expect(node.data.permalink).toBe("link");
        });
    });

    it("shold parse markdown content with wiki links and permalinks", () => {
        const result = buildAst("# Hello World [[link]]", {
            permalinks: ["content/a/link"]
        }) as any;
        visit(result, "wikiLink", (node, index, parent) => {
            expect(node.data.hProperties.href).toBe("content/a/link");
        });
    })
});