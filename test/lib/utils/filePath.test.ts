import { describe, it, expect } from "vitest";
import { findFilePathsAll } from "../../../src/lib/utils/filePath";
import * as path from "path";

describe("findFilesAll", () => {
    it("should return the full path of a file", () => {
        const rootDir = path.join("./test/__mock__", "contents");
        const files = findFilePathsAll(rootDir);
        expect(files).toEqual([
            "test/__mock__/contents/A.md",
            "test/__mock__/contents/B.md",
            "test/__mock__/contents/dep1a/C.md",
            "test/__mock__/contents/dep1a/D.md",
            "test/__mock__/contents/dep1a/dep2a/F.md",
            "test/__mock__/contents/dep1b/E.md",
        ]);
    });
});
