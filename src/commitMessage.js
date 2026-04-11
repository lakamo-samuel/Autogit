import { execSync } from "child_process";
import path from "path";

/**
 * Generate a commit message based on staged files.
 * - TS files → feat
 * - JS files → feat
 * - Test files → test
 * - Others → fix
 *
 * Later: can be replaced with AI summaries
 */
export const generateCommitMessage = () => {
    // Get staged files
    const output = execSync("git diff --cached --name-only", {
        encoding: "utf-8",
    }).trim();

    const changedFiles = output.split("\n").filter(Boolean);

    if (changedFiles.length === 0) return "autogit: update";

    const summaries = changedFiles.map((file) => {
        const fileName = path.basename(file);

        if (fileName.includes("test")) return `test: update ${fileName}`;
        if (fileName.endsWith(".ts")) return `feat: update ${fileName}`;
        if (fileName.endsWith(".js")) return `feat: update ${fileName}`;
        return `fix: modify ${fileName}`;
    });

    // Join multiple files with ;
    return summaries.join("; ");
}