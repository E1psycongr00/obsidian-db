import * as fs from "fs";
import { findFilesAll } from "./filePath.js";
import { ParseOptions, parseFile } from "./parser.js";
import { File } from "./scheme/files.js";
import { batchInsertFiles } from "./query/fileQuery.js";
import { batchInsertLinks } from "./query/linkQuery.js";
import { Knex } from "knex";
import { Link } from "./scheme/links.js";

async function batchInsertDirectories(
    db: Knex,
    dir: string,
    parseOptions: ParseOptions = {}
) {
    const filePaths = findFilesAll(dir);
    if (!parseOptions.buildAstOptions) {
        const permalinks = filePaths.map(filePath => {
            const { urlPath } = splitFilePath(filePath);
            return urlPath;
        });
        parseOptions.buildAstOptions = { permalinks };
    }
    const { files, titleLinks } = transFiles(filePaths, parseOptions);
    await batchInsertFiles(db, files);
    const fileData = await db.select("id", "urlPath").from("files");
    const links = titleLinks.map(link => {
        const sourceId: number = fileData.find(
            f => f.urlPath === link.source
        )?.id;
        const targetId: number = fileData.find(
            f => f.urlPath === link.target
        )?.id;
        const type: "normal" | "embed" = link.linkType || "normal";
        return {
            sourceFileId: sourceId,
            targetFileId: targetId,
            type: type,
        } as Link;
    });
    await batchInsertLinks(db, links);
}

function transFiles(filePaths: string[], parseOptions?: ParseOptions) {
    const files = [];
    const titleLinks = [];
    for (const filePath of filePaths) {
        const file = fs.readFileSync(filePath, "utf8");
        const { metaData: metadata, links: fileLinks } = parseFile(
            file,
            parseOptions
        );
        const { urlPath, fileType } = splitFilePath(filePath);
        files.push({
            filePath,
            urlPath,
            fileType,
            metadata,
        } as File);
        titleLinks.push(...fileLinks);
    }
    return { files, titleLinks };
}

function splitFilePath(filePath: string) {
    const split = filePath.split(".");
    const fileType = split[split.length - 1];
    const urlPath = split.slice(0, split.length - 1).join(".");
    return { urlPath, fileType };
}

export { batchInsertDirectories };
