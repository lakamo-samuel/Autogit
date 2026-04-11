import fs from "fs";
import os from "os";
import path from "path";

export const defaultConfig = {
    watchDirs: ["src"],
    interval: 300000,
    ignored: [
        "node_modules",
        ".git",
        "dist",
        "build",
        ".*",
        "package-lock.json",
        "yarn.lock",
        "*.log",
        "package.json",
    ],
    autoAdd: true,
    maxDiffLines: 2000,
};

const CONFIG_DIR = path.join(os.homedir(), ".autosync-git");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

/* internal helpers */
const loadConfig = () => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return {};
        return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
        return {};
    }
}

const writeConfig = (data) => {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

/* API key */
export const saveApiKey = (key) => {
    const existing = loadConfig();
    writeConfig({ ...existing, geminiKey: key });
    console.log("API key saved. You're now in unlimited mode.");
}

export const getApiKey = () => {
    const config = loadConfig();
    return config.geminiKey || null; // null = use backend mode
}

export const removeApiKey = () => {
    const config = loadConfig();

    if (!config.geminiKey) {
        console.log("No API key saved.");
        return;
    }

    delete config.geminiKey;
    writeConfig(config);
    console.log(
        "API key removed. Switching to autosync service (rate limited).",
    );
}

/* status */
export const showStatus = () => {
    const key = getApiKey();

    if (key) {
        console.log("   Mode: Direct (your Gemini API key)");
        console.log("   Unlimited usage, billed to your Google account");
    } else {
        console.log("   Mode: Autosync (shared backend)");
        console.log("   Rate limited: 5 req/min, 50 req/day");
        console.log("   Run: autosync-git login  → add your key for unlimited use");
    }
}