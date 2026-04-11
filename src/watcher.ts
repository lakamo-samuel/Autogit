import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import { defaultConfig, AutoSyncConfig } from "./config.js";
import { stageAllChanges, commitChanges, isGitRepo } from "./git.js";
import { generateCommitMessageAI } from "./aiMessage.js";

let watcher: FSWatcher | null = null;
let commitTimer: NodeJS.Timeout | null = null;
let isCommitting = false;

const COMMIT_DELAY = 15000;
const changedFiles = new Set<string>();

export const startWatcher = (config: AutoSyncConfig = defaultConfig): void => {
    if (watcher) {
        console.log("Watcher already running");
        return;
    }

    if (!isGitRepo()) {
        console.log("Not a git repository");
        return;
    }

    const watchPaths = config.watchDirs.map((dir) => path.join(process.cwd(), dir));

    watcher = chokidar.watch(watchPaths, {
        ignored: [
            "**/node_modules/**",
            "**/.git/**",
            "**/dist/**",
            "**/build/**",
            "**/.env",
            "**/coverage/**",
        ],
        ignoreInitial: true,
        persistent: true,
    });

    watcher
        .on("add", (filePath) => onFileEvent("added", filePath))
        .on("change", (filePath) => onFileEvent("modified", filePath))
        .on("unlink", (filePath) => onFileEvent("deleted", filePath));

    console.log("AutoGit watching for changes...");
};

export const stopWatcher = (): void => {
    if (!watcher) {
        console.log("Watcher not running");
        return;
    }

    watcher.close();
    watcher = null;
    if (commitTimer) {
        clearTimeout(commitTimer);
        commitTimer = null;
    }

    console.log("AutoGit watcher stopped");
};

const onFileEvent = (type: "added" | "modified" | "deleted", filePath: string): void => {
    console.log(`[${type.toUpperCase()}] ${filePath}`);

    changedFiles.add(filePath);

    if (commitTimer) {
        clearTimeout(commitTimer);
    }

    commitTimer = setTimeout(async () => {
        if (isCommitting) {
            return;
        }

        if (changedFiles.size === 0) {
            return;
        }

        try {
            isCommitting = true;

            const tracked = [...changedFiles].map((file) => path.relative(process.cwd(), file));

            console.log(` Preparing commit for ${tracked.length} files...`);
            console.log("  tracked files:", tracked);

            console.log("Staging changes...");
            stageAllChanges();

            const message = await generateCommitMessageAI();
            console.log("  AI/fallback message:", message);

            const committed = commitChanges(message);

            if (committed) {
                console.log("Commit created:", message);
            } else {
                console.warn("git commit failed");
            }

            changedFiles.clear();
        } finally {
            isCommitting = false;
        }
    }, COMMIT_DELAY);
};

const cleanup = (): void => {
    if (watcher) {
        watcher.close();
        watcher = null;
    }

    if (commitTimer) {
        clearTimeout(commitTimer);
        commitTimer = null;
    }
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);