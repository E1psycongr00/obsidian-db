import { unified } from "unified";
import markdownParse from "remark-parse";
import { remarkWikiLink } from "@portaljs/remark-wiki-link";
import gfm from "remark-gfm";
import { Plugin } from "unified";
import { Link } from "./scheme/links";

interface ParseOptions {
    buildAstOptions: BuildAstOptions;
    linkExtractor?: LinkExtractor;
}

interface BuildAstOptions {
    remarkPlugins?: Array<Plugin>;
    permalinks?: string[];
}

interface WikiLink extends Link {}

interface LinkExtractor {
    [key: string]: (node: any) => WikiLink;
}

function buildAst(content: string, options: BuildAstOptions = {}) {
    const processor = unified()
        .use(markdownParse)
        .use([
            gfm,
            [
                remarkWikiLink,
                {
                    pathFormat: "obsidian-short",
                    permalinks: options?.permalinks,
                },
            ],
            ...(options?.remarkPlugins || []),
        ]);
    return processor.parse(content);
}

function extractMetadata(content: string) {}

function extractLinks(ast: any) {}

export {
    ParseOptions,
    BuildAstOptions,
    WikiLink,
    LinkExtractor,
    buildAst,
    extractMetadata,
    extractLinks,
};
