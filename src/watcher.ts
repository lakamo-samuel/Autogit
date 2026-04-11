import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import { defaultConfig, AutoSyncConfig } from "./config.js";
import { stageAllChanges, commitChanges, isGitRepo } from "./git.js";
import { generateCommitMessageAI } from "./aiMessage.js";
import { COMMIT_DELAY, WATCHER_IGNORED } from "./data/config/configDefaults.js";
import { WATCHER_STRINGS } from "./data/config/watcher/watcherStrings.js";

let watcher: FSWatcher | null = null;
let commitTimer: NodeJS.Timeout | null = null;
let isCommitting = false;

const changedFiles = new Set<string>();

export const startWatcher = (config: AutoSyncConfig = defaultConfig): void => {
    if (watcher) {
        console.log(WATCHER_STRINGS.alreadyRunning);
        return;
    }

    if (!isGitRepo()) {
        console.log(WATCHER_STRINGS.notGitRepo);
        return;
    }

    const watchPaths = config.watchDirs.map((dir) => path.join(process.cwd(), dir));

    watcher = chokidar.watch(watchPaths, {
        ignored: WATCHER_IGNORED,
        ignoreInitial: true,
        persistent: true,
    });

    watcher
        .on("add", (filePath) => onFileEvent("added", filePath))
        .on("change", (filePath) => onFileEvent("modified", filePath))
        .on("unlink", (filePath) => onFileEvent("deleted", filePath));

    console.log(WATCHER_STRINGS.watching);
};

export const stopWatcher = (): void => {
    if (!watcher) {
        console.log(WATCHER_STRINGS.notRunning);
        return;
    }

    watcher.close();
    watcher = null;

    if (commitTimer) {
        clearTimeout(commitTimer);
        commitTimer = null;
    }

    console.log(WATCHER_STRINGS.stopped);
};

const onFileEvent = (type: "added" | "modified" | "deleted", filePath: string): void => {
    console.log(WATCHER_STRINGS.fileEvent(type, filePath));

    changedFiles.add(filePath);

    if (commitTimer) {
        clearTimeout(commitTimer);
    }

    commitTimer = setTimeout(async () => {
        if (isCommitting || changedFiles.size === 0) return;

        try {
            isCommitting = true;

            const tracked = [...changedFiles].map((file) => path.relative(process.cwd(), file));

            console.log(WATCHER_STRINGS.preparingCommit(tracked.length));
            console.log(WATCHER_STRINGS.trackedFiles(tracked));
            console.log(WATCHER_STRINGS.staging);

            stageAllChanges();

            const message = await generateCommitMessageAI();
            console.log(WATCHER_STRINGS.aiFallbackMessage(message));

            const committed = commitChanges(message);

            if (committed) {
                console.log(WATCHER_STRINGS.commitCreated(message));
            } else {
                console.warn(WATCHER_STRINGS.commitFailed);
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