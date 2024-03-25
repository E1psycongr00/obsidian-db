import { findFilePathsAll } from "./filePath.js";
import Parser, { UrlLink } from "./parser.js";
import { batchInsertFiles } from "./query/fileQuery.js";
import { batchInsertLinks } from "./query/linkQuery.js";
import { Knex } from "knex";
import { Link } from "./scheme/links.js";

async function batchInsertDirectories(db: Knex, dir: string, parser: Parser) {
    const filePaths = findFilePathsAll(dir);
    const { files, urlLinks } = transFiles(filePaths, parser);
    await batchInsertFiles(db, files);
    const fileData = await db.select("id", "urlPath").from("files");
    const links = convertIdLinks(fileData, urlLinks);
    await batchInsertLinks(db, links);
}

function transFiles(filePaths: string[], parser: Parser) {
    const files = [];
    const urlLinks = [];
    for (const filePath of filePaths) {
        const { file, links } = parser.parseFile(filePath);
        files.push(file);
        urlLinks.push(...links);
    }
    return { files, urlLinks };
}

function convertIdLinks(fileData: any[], urlLinks: UrlLink[]) {
    const links = [];
    for (const urlLink of urlLinks) {
        try {
            links.push(convertLink(fileData, urlLink));
        } catch (error) {
            console.error(error + " so disconnect link");   
        }
    }
    return links;
}

function convertLink(
    fileData: { id: number; urlPath: string }[],
    link: UrlLink
) {
    const source = fileData.find(f => f.urlPath === link.source);
    if (!source) {
        throw new Error(`source file not found. link source: ${link.source}`);
    }
    const target = fileData.find(f => f.urlPath === link.target);
    if (!target) {
        throw new Error(`target file not found. link target: ${link.target}`);
    }
    const type: "normal" | "embed" = link.linkType || "normal";
    return {
        sourceFileId: source.id,
        targetFileId: target.id,
        type: type,
    } as Link;
}

export { batchInsertDirectories };
