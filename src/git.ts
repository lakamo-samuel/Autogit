import { execSync } from "child_process";

function runGitCommand(command: string): string {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

export function isGitRepo(): boolean {
  const result = runGitCommand("git rev-parse --is-inside-work-tree");
  return result === "true";
}

export function hasUncommittedChanges(): boolean {
  const status = runGitCommand("git status --porcelain");
  return status.length > 0;
}

export function stageAllChanges(): void {
  runGitCommand("git add .");
}
export function commitChanges(message: string): boolean {
  try {
    execSync(`git commit -m "${message}"`, {
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

