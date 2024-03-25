import { unified } from "unified";
import markdownParse from "remark-parse";
import { remarkWikiLink } from "@portaljs/remark-wiki-link";
import gfm, { Root } from "remark-gfm";
import { Plugin } from "unified";
import { Metadata } from "./scheme/files.js";
import matter from "gray-matter";
import { visit } from "unist-util-visit";

interface ParseOptions {
    buildAstOptions?: BuildAstOptions;
    linkExtractors?: LinkExtractor[];
}

interface BuildAstOptions {
    remarkPlugins?: Array<Plugin>;
    permalinks?: string[];
}

interface UrlLink {
    source: string;
    target: string;
    linkType?: "normal" | "embed";
}

interface LinkExtractor {
    extract: (ast: Root) => any[];
}

function parseFile(source: string, options: ParseOptions = {}) {
    const { data: meta, content: body } = matter(source);

    const ast = buildAst(body, options.buildAstOptions || {});
    const metaData = extractMetadata({ data: meta, content: body });
    const links = extractLinks(metaData, ast, options.linkExtractors || []);
    return { ast, metaData, body, links };
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

function extractMetadata({
    data: metadata,
    content,
}: {
    data: { [key: string]: any };
    content: string;
}) {
    const tags = metadata?.tags || [];
    const hashtagRegex = /#[가-힣A-Za-z0-9_]+/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
        tags.push(match[0]);
    }

    return {
        title: metadata.title,
        tags: tags,
        date: metadata.date,
    } as Metadata;
}

function extractLinks(
    meta: Metadata,
    ast: Root,
    linkExtractors: LinkExtractor[]
) {
    const defaultExtractors = [
        {
            extract(ast: Root) {
                const links: UrlLink[] = [];
                visit(ast, "wikiLink", (node: any) => {
                    links.push({
                        source: meta.title ?? "",
                        target: node.data.permalink,
                    });
                });
            },
        } as LinkExtractor,
    ];
    const links: UrlLink[] = [];
    linkExtractors = linkExtractors.concat(defaultExtractors);
    for (const linkExtractor of linkExtractors) {
        links.concat(linkExtractor.extract(ast));
    }
    return links;
}

export {
    ParseOptions,
    BuildAstOptions,
    UrlLink,
    LinkExtractor,
    buildAst,
    extractMetadata,
    extractLinks,
    parseFile,
};
