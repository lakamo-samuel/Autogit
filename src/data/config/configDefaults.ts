import path from "path";
import type { AutoSyncConfig } from "../../config.js";

export const FALLBACK_CONFIG: AutoSyncConfig = {
    watchDirs: ["src"],
    interval: 300_000,
    ignored: [
        "node_modules",
        ".git",
        "dist",
        "build",
        ".*",
        "package-lock.json",
        "yarn.lock",
        "*.log",
        "package.json",
    ],
    autoAdd: true,
    maxDiffLines: 2000,
};

// Project-level rc file — override via AUTOSYNC_RC_FILE env var
export const RC_FILE_NAME = process.env.AUTOSYNC_RC_FILE ?? ".Autosync-gitrc.json";
export const RC_FILE = path.join(process.cwd(), RC_FILE_NAME);

// User-level config dir — override via AUTOSYNC_CONFIG_DIR env var
export const CONFIG_DIR_NAME = process.env.AUTOSYNC_CONFIG_DIR ?? ".autosync-git";
export const CONFIG_FILE_NAME = "config.json";

// Watcher — override via AUTOSYNC_COMMIT_DELAY env var
export const COMMIT_DELAY = Number(process.env.AUTOSYNC_COMMIT_DELAY ?? 15_000);

export const WATCHER_IGNORED = [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.env",
    "**/coverage/**",
];

// bin path — override via AUTOSYNC_DIST_PATH env var
export const DIST_PATH = process.env.AUTOSYNC_DIST_PATH ?? "../dist";