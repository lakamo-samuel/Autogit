import fs from "fs";
import path from "path";
import "dotenv/config";
import { defaultConfig } from "./config.js";

import { RC_FILE_NAME } from "./data/config/configDefaults.js";
import { CONFIG_MESSAGES } from "./data/config/configMessages.js";

import {
    startWatcher as runWatcher,
    stopWatcher as haltWatcher,
} from "./watcher.js";

export const initRepo = (): void => {
    const configPath = path.join(process.cwd(), RC_FILE_NAME);

    if (fs.existsSync(configPath)) {
        console.log(CONFIG_MESSAGES.initAlreadyExists);
        return;
    }

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(CONFIG_MESSAGES.initSuccess);
};

export const startWatcher = (): void => {
    runWatcher();
};

export const stopWatcher = (): void => {
    haltWatcher();
};

export const showConfig = (): void => {
    const configPath = path.join(process.cwd(), RC_FILE_NAME);

    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        console.log(CONFIG_MESSAGES.showConfig(config));
        return;
    }

    console.log(CONFIG_MESSAGES.showConfigNotFound);
};