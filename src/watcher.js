import chokidar from "chokidar";
import path from "path";
import { defaultConfig } from "./config.js";
import {
  isGitRepo,
  hasUncommittedChanges,
  stageAllChanges,
  commitChanges,
} from "./git.js";
import { generateCommitMessageAI } from "./aiMessage.js";

let watcher = null;
let commitTimer = null;
let isCommitting = false;

const COMMIT_DELAY = 5000;
const changedFiles = new Set();
export function startWatcher(config = defaultConfig) {
  if (watcher) {
    console.log("Watcher already running");
    return;
  }

  if (!isGitRepo()) {
    console.log("Not a git repository");
    return;
  }

  const watchPaths = config.watchDirs.map((dir) =>
    path.join(process.cwd(), dir),
  );

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
}

export function stopWatcher() {
  if (!watcher) {
    console.log("Watcher not running");
    return;
  }

  watcher.close();
  watcher = null;

  console.log("AutoGit watcher stopped");
}

function onFileEvent(type, filePath) {
  console.log(`[${type.toUpperCase()}] ${filePath}`);

  // track changed files
  changedFiles.add(filePath);

  // reset timer
  if (commitTimer) {
    clearTimeout(commitTimer);
  }

  commitTimer = setTimeout(async () => {
    if (isCommitting) return;

    if (changedFiles.size === 0) return;

    try {
      isCommitting = true;

      console.log(`📦 Preparing commit for ${changedFiles.size} files...`);

      console.log("Staging changes...");

      stageAllChanges();

      const message = await generateCommitMessageAI();

      const committed = commitChanges(message);

      if (committed) {
        console.log("✅ Commit created:", message);
      }

      // clear tracked files
      changedFiles.clear();
    } finally {
      isCommitting = false;
    }
  }, COMMIT_DELAY);
}

process.on("SIGINT", () => {
  if (watcher) watcher.close();
  process.exit();
});
