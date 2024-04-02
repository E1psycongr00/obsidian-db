import { describe, it, expect } from "vitest";
import {
    findFilePathsAll,
    findPermalinksAll,
} from "../../../../src/lib/utils/permalinks/filePath";
import * as path from "path";

describe("findFilesAll", () => {
    it("자식 디렉토리 파일을 반환해야 함", () => {
        const rootDir = path.join("./test/__mock__", "contents");
        const files = findFilePathsAll(rootDir);
        expect(files).toEqual([
            "test/__mock__/contents/A.md",
            "test/__mock__/contents/B.md",
            "test/__mock__/contents/dep1a/C.mdx",
            "test/__mock__/contents/dep1a/D.md",
            "test/__mock__/contents/dep1a/dep2a/F.md",
            "test/__mock__/contents/dep1b/E.md",
            "test/__mock__/contents/dep1b/index.md",
            "test/__mock__/contents/index.md",
        ]);
    });

    it("extension 입력이 주어진 경우 해당 확장자 파일만 반환해야 함", () => {
        const rootDir = path.join("./test/__mock__", "contents");
        const files = findFilePathsAll(rootDir, ["mdx"]);
        expect(files).toEqual(["test/__mock__/contents/dep1a/C.mdx"]);
    });

    it("extension 입력이 여러개 주어진 경우 해당 확장자 파일만 반환해야 함", () => {
        const rootDir = path.join("./test/__mock__", "contents");
        const files = findFilePathsAll(rootDir, ["mdx", "md"]);
        expect(files).toEqual([
            "test/__mock__/contents/A.md",
            "test/__mock__/contents/B.md",
            "test/__mock__/contents/dep1a/C.mdx",
            "test/__mock__/contents/dep1a/D.md",
            "test/__mock__/contents/dep1a/dep2a/F.md",
            "test/__mock__/contents/dep1b/E.md",
            "test/__mock__/contents/dep1b/index.md",
            "test/__mock__/contents/index.md",
        ]);
    });
});

describe("findPermalinksAll", () => {
    it("자식 디렉토리 파일 permalink를 반환해야 함", () => {
        const rootDir = "test/__mock__/contents";
        const permalinks = findPermalinksAll(rootDir);
        expect(permalinks).toEqual([
            "/A",
            "/B",
            "/dep1a/C",
            "/dep1a/D",
            "/dep1a/dep2a/F",
            "/dep1b/E",
            "/dep1b",
            "/",
        ]);
    });

    it("extension 입력이 주어진 경우 해당 확장자 파일 permalink만 반환해야 함", () => {
        const rootDir = "test/__mock__/contents";
        const permalinks = findPermalinksAll(rootDir, ["mdx"]);
        expect(permalinks).toEqual(["/dep1a/C"]);
    });
});
