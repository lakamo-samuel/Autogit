export const WATCHER_STRINGS = {
    alreadyRunning: "Watcher already running",
    notGitRepo: "Not a git repository",
    watching: "AutoGit watching for changes...",
    notRunning: "Watcher not running",
    stopped: "AutoGit watcher stopped",

    fileEvent: (type: string, filePath: string) => `[${type.toUpperCase()}] ${filePath}`,
    preparingCommit: (count: number) => ` Preparing commit for ${count} files...`,
    trackedFiles: (files: string[]) => `  tracked files: ${files.join(", ")}`,
    staging: "Staging changes...",
    aiFallbackMessage: (msg: string) => `  AI/fallback message: ${msg}`,
    commitCreated: (msg: string) => `Commit created: ${msg}`,
    commitFailed: "git commit failed",
} as const;