import fs from "fs";
import path from "path";
import { defaultConfig } from "./config.js";
import "dotenv/config";
import {
    startWatcher as runWatcher,
    stopWatcher as haltWatcher,
} from "./watcher.js";

// CLI actions
export const initRepo = () => {
    const configPath = path.join(process.cwd(), ".Autosync-gitrc.json");
    if (fs.existsSync(configPath)) {
        console.log("Autosync-git config already exists!");
        return;
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("Autosync-git config initialized!");
}


export const startWatcher = () => {
    runWatcher();
}

export const stopWatcher = () => {
    haltWatcher();
}

export const showConfig = () => {
    const configPath = path.join(process.cwd(), ".Autosync-gitrc.json");
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        console.log("Current Autosync-git config:", config);
    } else {
        console.log('Config not found. Run "Autosync-git init" first.');
    }
}