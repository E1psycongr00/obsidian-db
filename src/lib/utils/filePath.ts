import * as fs from "fs";
import * as path from "path";

function findFilesAll(rootDir: string): string[] {
    const files = fs.readdirSync(rootDir);
    const result: string[] = [];
    for (const file of files) {
        const fullPath = path.join(rootDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            result.push(...findFilesAll(fullPath));
        } else {
            result.push(fullPath);
        }
    }
    return result.map(encodeFilePath);
}

function encodeFilePath(filePath: string) {
    return filePath.replace(/\\/g, "/");
}

export { findFilesAll, encodeFilePath };
