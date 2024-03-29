import * as fs from "fs";
import * as path from "path";

function findFilePathsAll(rootDir: string, extension: string[] = []): string[] {
    const files = fs.readdirSync(rootDir);
    const result: string[] = [];
    for (const file of files) {
        const fullPath = path.join(rootDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            result.push(...findFilePathsAll(fullPath));
        } else {
            result.push(fullPath);
        }
    }
    return result
        .filter(filePath => inExtension(filePath, extension))
        .map(filePath => fixWindowPath(filePath));
}

function findPermalinksAll(
    rootDir: string,
    extension: string[] = []
): string[] {
    const result = findFilePathsAll(rootDir);
    return result
        .filter(filePath => inExtension(filePath, extension))
        .map(filePath => toPermalink(filePath, rootDir))
        .map(filePath => fixWindowPath(filePath));
}

function toPermalink(filePath: string, rootDir: string) {
    const relativePath = path.relative(rootDir, filePath);
    const ext = path.extname(relativePath);
    return relativePath.slice(0, -ext.length);
}

function fixWindowPath(filePath: string) {
    return filePath.replace(/\\/g, "/");
}

function inExtension(filePath: string, extension: string[]) {
    if (extension.length === 0) return true;
    return extension.some(ext => filePath.endsWith(ext));
}

export { findFilePathsAll, findPermalinksAll, toPermalink, fixWindowPath };
