import { unified } from "unified";
import markdownParse from "remark-parse";
import { remarkWikiLink } from "@portaljs/remark-wiki-link";
import gfm, { Root } from "remark-gfm";
import { Plugin } from "unified";
import matter from "gray-matter";
import * as fs from "fs";
import { Metadata } from "./scheme/files.js";
import { File } from "./scheme/files.js";
import path from "path";
import LinkExtractor from "./extractors/linkExtractor.js";
import WikiLinkExtractor from "./extractors/WikiLinkExtractor.js";
import MdLinkExtractor from "./extractors/MdLinkExtractor.js";
import ImageWikiLinkExtractor from "./extractors/ImageWikiLinkExtractor.js";

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

class Parser {
    private readonly processor: any;
    private readonly linkExtractors: LinkExtractor[];

    constructor(
        buildAstOptions: BuildAstOptions = {},
        linkExtractors: LinkExtractor[] = []
    ) {
        this.processor = this.initProcessor(buildAstOptions);
        this.linkExtractors = this.initLinkExtractors(linkExtractors);
    }

    public parseFile(filePath: string, rootDir: string) {
        const source = fs.readFileSync(filePath, "utf-8");
        const { content } = matter(source);
        const ast = this.parseAst(content);
        const metadata = this.parseMetadata(source);
        const { urlPath, fileType } = this.splitFilePath(
            path.relative(rootDir, filePath)
        );
        const links = this.parseLinks(ast, urlPath);
        const file = {
            filePath: filePath,
            urlPath: urlPath,
            fileType: fileType,
            metadata: metadata,
        } as File;
        return { file, links };
    }

    public parseAst(content: string): Root {
        return this.processor.parse(content);
    }

    public parseMetadata(source: string): Metadata {
        const { data: metadata, content } = matter(source);
        const tags = metadata?.tags || [];
        const hashtagRegex = /#[가-힣A-Za-z0-9_]+/g;
        let match;
        while ((match = hashtagRegex.exec(content)) !== null) {
            tags.push(match[0].slice(1));
        }
        return {
            title: metadata.title,
            tags: tags,
            date: metadata.date,
        };
    }

    public parseLinks(ast: Root, sourceUrlPath: string): UrlLink[] {
        const targetLinks: string[] = [];
        for (const linkExtractor of this.linkExtractors) {
            const target = linkExtractor.extract(ast);
            targetLinks.push(...target);
        }
        return targetLinks.map(targetPath => {
            return {
                source: sourceUrlPath,
                target: targetPath,
            } as UrlLink;
        });
    }

    private initProcessor(buildAstOptions: BuildAstOptions) {
        return unified()
            .use(markdownParse)
            .use([
                gfm,
                [
                    remarkWikiLink,
                    {
                        pathFormat: "obsidian-short",
                        permalinks: buildAstOptions?.permalinks,
                    },
                ],
                ...(buildAstOptions?.remarkPlugins || []),
            ]);
    }

    private initLinkExtractors(linkExtractors: LinkExtractor[]) {
        const wikiLinkExtractor = new WikiLinkExtractor();
        const mdLinkExtractor = new MdLinkExtractor();
        const imageLinkextractor = new ImageWikiLinkExtractor();
        return [
            ...linkExtractors,
            wikiLinkExtractor,
            mdLinkExtractor,
            imageLinkextractor,
        ];
    }

    private splitFilePath(filePath: string) {
        const split = filePath.split(".");
        const fileType = split[split.length - 1];
        const urlPath = split.slice(0, split.length - 1).join(".");
        return { urlPath, fileType };
    }
}

export default Parser;
export { ParseOptions, BuildAstOptions, UrlLink };
