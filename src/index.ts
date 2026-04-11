import fs from "fs";
import path from "path";
import "dotenv/config";
import { defaultConfig } from "./config.js";
import {
    startWatcher as runWatcher,
    stopWatcher as haltWatcher,
} from "./watcher.js";

const CONFIG_FILE_NAME = ".Autosync-gitrc.json";

export const initRepo = (): void => {
    const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(configPath)) {
        console.log("Autosync-git config already exists!");
        return;
    }

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("Autosync-git config initialized!");
};

export const startWatcher = (): void => {
    runWatcher();
};

export const stopWatcher = (): void => {
    haltWatcher();
};

export const showConfig = (): void => {
    const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        console.log("Current Autosync-git config:", config);
        return;
    }

    console.log("Config not found. Run \"Autosync-git init\" first.");
};
