import fs from "fs";
import path from "path";
import { defaultConfig } from "./config.ts";
import "dotenv/config";
import {
  startWatcher as runWatcher,
  stopWatcher as haltWatcher,
} from "./watcher.ts";

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
  runWatcher();
  console.log("API KEY:", process.env.GEMINI_API_KEY ? "✅ Found" : "❌ Not Found");

}

export function stopWatcher() {
  haltWatcher();
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
