import { execSync } from "child_process";

function runGitCommand(command) {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function isGitRepo() {
  const result = runGitCommand("git rev-parse --is-inside-work-tree");
  return result === "true";
}

export function hasUncommittedChanges() {
  const status = runGitCommand("git status --porcelain");
  return status.length > 0;
}

export function stageAllChanges() {
  runGitCommand("git add .");
}
export function commitChanges(message) {
  try {
    execSync(`git commit -m "${message}"`, {
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}
export function hasStagedChanges() {
  const diff = runGitCommand("git diff --cached --name-only");
  return diff.length > 0;
}




