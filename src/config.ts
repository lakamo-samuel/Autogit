import fs from "fs";
import os from "os";
import path from "path";

import { FALLBACK_CONFIG, RC_FILE, CONFIG_DIR_NAME, CONFIG_FILE_NAME } from "./data/config/configDefaults.js";
import { CONFIG_MESSAGES } from "./data/config/configMessages.js";

export interface AutoSyncConfig {
    watchDirs: string[];
    interval: number;
    ignored: string[];
    autoAdd: boolean;
    maxDiffLines: number;
}

// Project-level config file (.autogitrc.json in cwd)
const loadRcConfig = (): Partial<AutoSyncConfig> => {
    try {
        if (!fs.existsSync(RC_FILE)) return {};
        const raw = fs.readFileSync(RC_FILE, "utf-8");
        return JSON.parse(raw) as Partial<AutoSyncConfig>;
    } catch {
        return {};
    }
};

// Resolved config: fallback → .autogitrc.json
export const defaultConfig: AutoSyncConfig = {
    ...FALLBACK_CONFIG,
    ...loadRcConfig(),
};

// User-level stored config `~/.autosync-git/config.json`
interface StoredConfig {
    geminiKey?: string;
}

const CONFIG_DIR = path.join(os.homedir(), CONFIG_DIR_NAME);
const CONFIG_FILE = path.join(CONFIG_DIR, CONFIG_FILE_NAME);

const loadConfig = (): StoredConfig => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return {};
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
    console.log(CONFIG_MESSAGES.apiKeySaved);
};

export const getApiKey = (): string | null => {
    const config = loadConfig();
    return config.geminiKey ?? null;
};

export const removeApiKey = (): void => {
    const config = loadConfig();

    if (!config.geminiKey) {
        console.log(CONFIG_MESSAGES.apiKeyNone);
        return;
    }

    delete config.geminiKey;
    writeConfig(config);
    console.log(CONFIG_MESSAGES.apiKeyRemoved);
};

export const showStatus = (): void => {
    const key = getApiKey();

    if (key) {
        console.log(CONFIG_MESSAGES.statusDirect);
        console.log(CONFIG_MESSAGES.statusDirectDetail);
        return;
    }

    console.log(CONFIG_MESSAGES.statusShared);
    console.log(CONFIG_MESSAGES.statusSharedDetail);
    console.log(CONFIG_MESSAGES.statusSharedHint);
};