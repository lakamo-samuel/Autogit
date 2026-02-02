import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import { defaultConfig } from "./config.ts";
import {
  isGitRepo,
  hasUncommittedChanges,
  stageAllChanges,
  commitChanges,
} from "./git.ts";
import { generateCommitMessageAI } from "./aiMessage.ts";

let watcher: FSWatcher | null = null;
let commitTimer: NodeJS.Timeout | null = null;
const COMMIT_DELAY = 3000; // 3 seconds of silence

export function startWatcher(config = defaultConfig) {
  if (watcher) {
    console.log("Watcher is already running");
    return;
  }

  const watchPaths = config.watchDirs.map((dir) =>
    path.join(process.cwd(), dir),
  );

  watcher = chokidar.watch(watchPaths, {
    ignored: config.ignored,
    ignoreInitial: true,
    persistent: true,
  });

  watcher
    .on("add", (filePath) => onFileEvent("added", filePath))
    .on("change", (filePath) => onFileEvent("modified", filePath))
    .on("unlink", (filePath) => onFileEvent("deleted", filePath));

  console.log("AutoGit watcher started");
}

export function stopWatcher() {
  if (!watcher) {
    console.log("Watcher is not running");
    return;
  }

  watcher.close();
  watcher = null;
  console.log("AutoGit watcher stopped");
}

function onFileEvent(type: "added" | "modified" | "deleted", filePath: string) {
  console.log(`[${type.toUpperCase()}] ${filePath}`);

  if (!isGitRepo()) return;

  // Reset timer if changes keep coming
  if (commitTimer) {
    clearTimeout(commitTimer);
  }


commitTimer = setTimeout(async () => {
  if (!hasUncommittedChanges()) return;

  stageAllChanges();

  // AI-generated commit message
  const message = await generateCommitMessageAI();

  const committed = commitChanges(message);

  if (committed) {
    console.log("Auto-commit created:", message);
  }
}, COMMIT_DELAY);

}
