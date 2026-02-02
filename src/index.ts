import fs from "fs";
import path from "path";
import { defaultConfig } from "./config.ts";

// CLI actions
export function initRepo() {
  const configPath = path.join(process.cwd(), ".autogitrc.json");
  if (fs.existsSync(configPath)) {
    console.log("AutoGit config already exists!");
    return;
  }
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log("AutoGit config initialized!");
}

export function startWatcher() {
  console.log("Watcher started (placeholder for now)");
  // Later: import watcher.ts and start file watching
}

export function stopWatcher() {
  console.log("Watcher stopped (placeholder, Ctrl+C works)");
}

export function showConfig() {
  const configPath = path.join(process.cwd(), ".autogitrc.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("Current AutoGit config:", config);
  } else {
    console.log('Config not found. Run "autogit init" first.');
  }
}
