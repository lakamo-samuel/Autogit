import fs from "fs";
import os from "os";
import path from "path";

export const defaultConfig = {
  watchDirs: ["src"],
  interval: 300000,
  ignored: ["node_modules", ".git", "dist", "build", ".*","package-lock.json","yarn.lock","*.log","package.json"],
  autoAdd: true,
  maxDiffLines: 2000,
};

const CONFIG_DIR = path.join(os.homedir(), ".autogit");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function saveApiKey(key) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR);
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ geminiKey: key }, null, 2));

  console.log("✅ API key saved successfully");
}

export function getApiKey() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log("❌ No API key found.");
    console.log("Run: autogit login");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));

  return config.geminiKey;
}
