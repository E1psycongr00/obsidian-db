import { findFilePathsAll } from "./filePath.js";
import Parser, { UrlLink } from "./parser.js";
import { batchInsertFiles } from "./query/fileQuery.js";
import { batchInsertLinks } from "./query/linkQuery.js";
import { Knex } from "knex";
import { Link } from "./scheme/links.js";

async function batchInsertDirectories(
    db: Knex,
    dir: string,
    parser: Parser
) {
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
        const {file, links} = parser.parseFile(filePath);
        files.push(file);
        urlLinks.push(...links);
    }
    return { files, urlLinks };
}

function convertIdLinks(fileData: any[], urlLinks: UrlLink[]) {
    return urlLinks.map(link => {
        const sourceId: number = fileData.find(
            f => f.urlPath === link.source
        ).id;
        const targetId: number = fileData.find(
            f => f.urlPath === link.target
        ).id;
        const type: "normal" | "embed" = link.linkType || "normal";
        return {
            sourceFileId: sourceId,
            targetFileId: targetId,
            type: type,
        } as Link;
    });
}

export { batchInsertDirectories };
