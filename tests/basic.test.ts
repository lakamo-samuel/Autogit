import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

vi.mock("fs");
vi.mock("child_process");

const mockFs       = vi.mocked(fs);
const { execSync } = await import("child_process");

// config.ts

describe("config", () => {
    const CONFIG_DIR  = path.join(os.homedir(), ".autosync-git");
    const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    

    describe("getApiKey", () => {
        it("returns null when config file does not exist", async () => {
            mockFs.existsSync.mockReturnValue(false);

            const { getApiKey } = await import("../src/config.js");
            expect(getApiKey()).toBeNull();
        });

        it("returns saved key when config file exists", async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({ geminiKey: "test-key-123" }));

            const { getApiKey } = await import("../src/config.js");
            expect(getApiKey()).toBe("test-key-123");
        });

        it("returns null when config file is malformed", async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue("not-json{{{");

            const { getApiKey } = await import("../src/config.js");
            expect(getApiKey()).toBeNull();
        });
    });

    

    describe("saveApiKey", () => {
        it("creates config dir and writes key", async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({}));

            const { saveApiKey } = await import("../src/config.js");
            saveApiKey("my-api-key");

            expect(mockFs.mkdirSync).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true });
            expect(mockFs.writeFileSync).toHaveBeenCalledWith(
                CONFIG_FILE,
                expect.stringContaining("my-api-key"),
            );
        });

        it("merges with existing config", async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({ geminiKey: "old-key" }));

            const { saveApiKey } = await import("../src/config.js");
            saveApiKey("new-key");

            const written = JSON.parse(
                (mockFs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
            );
            expect(written.geminiKey).toBe("new-key");
        });
    });

    

    describe("removeApiKey", () => {
        it("does nothing when no key is saved", async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({}));

            const { removeApiKey } = await import("../src/config.js");
            removeApiKey();

            expect(mockFs.writeFileSync).not.toHaveBeenCalled();
        });

        it("removes key and writes updated config", async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(JSON.stringify({ geminiKey: "to-remove" }));

            const { removeApiKey } = await import("../src/config.js");
            removeApiKey();

            const written = JSON.parse(
                (mockFs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string,
            );
            expect(written.geminiKey).toBeUndefined();
        });
    });

    

    describe("defaultConfig", () => {
        it("falls back to FALLBACK_CONFIG when rc file does not exist", async () => {
            mockFs.existsSync.mockReturnValue(false);

            const { defaultConfig } = await import("../src/config.js");
            expect(defaultConfig.watchDirs).toEqual(["src"]);
            expect(defaultConfig.autoAdd).toBe(true);
        });

        it("merges rc file values over fallback", async () => {
            mockFs.existsSync.mockImplementation((p) => String(p).endsWith(".json"));
            mockFs.readFileSync.mockReturnValue(
                JSON.stringify({ watchDirs: ["src", "lib"], maxDiffLines: 500 }),
            );

            const { defaultConfig } = await import("../src/config.js");
            expect(defaultConfig.watchDirs).toEqual(["src", "lib"]);
            expect(defaultConfig.maxDiffLines).toBe(500);
            expect(defaultConfig.autoAdd).toBe(true); // fallback preserved
        });
    });
});

// git.ts

describe("git", () => {
    const mockExecSync = vi.mocked(execSync);

    beforeEach(() => vi.clearAllMocks());

    

    describe("isGitRepo", () => {
        it("returns true inside a git repo", async () => {
            mockExecSync.mockReturnValue("true" as any);

            const { isGitRepo } = await import("../src/git.js");
            expect(isGitRepo()).toBe(true);
        });

        it("returns false outside a git repo", async () => {
            mockExecSync.mockImplementation(() => { throw new Error("not a repo"); });

            const { isGitRepo } = await import("../src/git.js");
            expect(isGitRepo()).toBe(false);
        });
    });

    

    describe("hasUncommittedChanges", () => {
        it("returns true when there are changes", async () => {
            mockExecSync.mockReturnValue("M src/index.ts\n" as any);

            const { hasUncommittedChanges } = await import("../src/git.js");
            expect(hasUncommittedChanges()).toBe(true);
        });

        it("returns false when working tree is clean", async () => {
            mockExecSync.mockReturnValue("" as any);

            const { hasUncommittedChanges } = await import("../src/git.js");
            expect(hasUncommittedChanges()).toBe(false);
        });
    });

    

    describe("hasStagedChanges", () => {
        it("returns true when files are staged", async () => {
            mockExecSync.mockReturnValue("src/index.ts\n" as any);

            const { hasStagedChanges } = await import("../src/git.js");
            expect(hasStagedChanges()).toBe(true);
        });

        it("returns false when nothing is staged", async () => {
            mockExecSync.mockReturnValue("" as any);

            const { hasStagedChanges } = await import("../src/git.js");
            expect(hasStagedChanges()).toBe(false);
        });
    });

    

    describe("commitChanges", () => {
        it("returns true on successful commit", async () => {
            mockExecSync.mockReturnValue("" as any);

            const { commitChanges } = await import("../src/git.js");
            expect(commitChanges("feat: add tests")).toBe(true);
        });

        it("returns false when commit fails", async () => {
            mockExecSync.mockImplementation(() => { throw new Error("nothing to commit"); });

            const { commitChanges } = await import("../src/git.js");
            expect(commitChanges("feat: add tests")).toBe(false);
        });
    });
});

// watcher.ts

describe("watcher", () => {
    const mockClose = vi.fn();
    const mockOn    = vi.fn().mockReturnThis();
    const mockWatch = vi.fn().mockReturnValue({ on: mockOn, close: mockClose });

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.mock("chokidar", () => ({ default: { watch: mockWatch } }));
        vi.mock("../src/git.js", () => ({
            isGitRepo:        vi.fn().mockReturnValue(true),
            stageAllChanges:  vi.fn(),
            commitChanges:    vi.fn().mockReturnValue(true),
        }));
        vi.mock("../src/aiMessage.js", () => ({
            generateCommitMessageAI: vi.fn().mockResolvedValue("feat: mock commit"),
        }));
    });

    

    describe("startWatcher", () => {
        it("starts chokidar watcher when not already running", async () => {
            const { startWatcher } = await import("../src/watcher.js");
            startWatcher();

            expect(mockWatch).toHaveBeenCalledOnce();
        });

        it("does not start a second watcher if already running", async () => {
            const { startWatcher } = await import("../src/watcher.js");
            startWatcher();
            startWatcher();

            expect(mockWatch).toHaveBeenCalledOnce();
        });

        it("does not start when not in a git repo", async () => {
            vi.mock("../src/git.js", () => ({
                isGitRepo:       vi.fn().mockReturnValue(false),
                stageAllChanges: vi.fn(),
                commitChanges:   vi.fn(),
            }));

            const { startWatcher } = await import("../src/watcher.js");
            startWatcher();

            expect(mockWatch).not.toHaveBeenCalled();
        });
    });

    

    describe("stopWatcher", () => {
        it("closes watcher and clears timer when running", async () => {
            const { startWatcher, stopWatcher } = await import("../src/watcher.js");
            startWatcher();
            stopWatcher();

            expect(mockClose).toHaveBeenCalledOnce();
        });

        it("does nothing when watcher is not running", async () => {
            const { stopWatcher } = await import("../src/watcher.js");
            stopWatcher();

            expect(mockClose).not.toHaveBeenCalled();
        });
    });
});