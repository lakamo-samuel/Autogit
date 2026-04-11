import { execSync } from "child_process";

const runGitCommand = (command) => {
    try {
        return execSync(command, {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
    } catch {
        return "";
    }
}

export const isGitRepo = () => {
    const result = runGitCommand("git rev-parse --is-inside-work-tree");
    return result === "true";
}

export const hasUncommittedChanges = () => {
    const status = runGitCommand("git status --porcelain");
    return status.length > 0;
}

export const stageAllChanges = () => {
    runGitCommand("git add .");
}
export const commitChanges = (message) => {
    try {
        execSync(`git commit -m "${message}"`, {
            stdio: ["ignore", "ignore", "ignore"],
        });
        return true;
    } catch {
        return false;
    }
}
export const hasStagedChanges = () => {
    const diff = runGitCommand("git diff --cached --name-only");
    return diff.length > 0;
}