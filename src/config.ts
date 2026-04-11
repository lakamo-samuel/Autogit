import fs from "fs";
import os from "os";
import path from "path";

export interface AutoSyncConfig {
    watchDirs: string[];
    interval: number;
    ignored: string[];
    autoAdd: boolean;
    maxDiffLines: number;
}

export const defaultConfig: AutoSyncConfig = {
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

interface StoredConfig {
    geminiKey?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".autosync-git");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const loadConfig = (): StoredConfig => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return {};
        }
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        return JSON.parse(raw) as StoredConfig;
    } catch {
        return {};
    }
};

const writeConfig = (data: StoredConfig): void => {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
};

export const saveApiKey = (key: string): void => {
    const existing = loadConfig();
    writeConfig({ ...existing, geminiKey: key });
    console.log("API key saved. Unlimited mode enabled.");
};

export const getApiKey = (): string | null => {
    const config = loadConfig();
    return config.geminiKey ?? null;
};

export const removeApiKey = (): void => {
    const config = loadConfig();

    if (!config.geminiKey) {
        console.log("No API key saved.");
        return;
    }

    delete config.geminiKey;
    writeConfig(config);
    console.log("API key removed. Switching to autosync service.");
};

export const showStatus = (): void => {
    const key = getApiKey();

    if (key) {
        console.log("Mode: Direct (personal Gemini API key)");
        console.log("Unlimited usage, billed to your Google account");
        return;
    }

    console.log("Mode: Autosync Service (shared backend)");
    console.log("Rate limited: 5 requests/min, 50 requests/day");
    console.log("Run autosync-git login to add your key for unlimited use");
};
