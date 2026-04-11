import promptSync from "prompt-sync";
import { saveApiKey, getApiKey, removeApiKey } from "./config.js";

const prompt = promptSync({ sigint: true });

export const loginUser = (): void => {
    const existingKey = getApiKey();

    if (existingKey) {
        console.log("You already have an API key saved.");
        console.log("You're currently in unlimited mode.\n");
        const replace = prompt("Replace existing key? (y/n): ");
        if (replace?.toLowerCase() !== "y") {
            console.log("Keeping existing key.");
            return;
        }
    }

    console.log("");
    console.log("Options:");
    console.log("  1. Enter your Gemini API key → unlimited mode (your quota)");
    console.log("  2. Skip → use autosync service (rate limited, free)");
    console.log("");

    const key = prompt("Enter your Gemini API key (or press Enter to skip): ", {
        echo: "*",
    });

    if (!key || key.trim().length === 0) {
        console.log("");
        console.log("No key set. Using autosync service.");
        console.log("Limits: 5 requests/min, 50 requests/day");
        console.log("Run autosync-git login anytime to add your key.");
        return;
    }

    if (key.trim().length < 10) {
        console.log("Invalid API key. Try again.");
        return;
    }

    saveApiKey(key.trim());
    console.log("");
    console.log("You're all set in unlimited mode!");
};

export const logoutUser = (): void => {
    const existingKey = getApiKey();

    if (!existingKey) {
        console.log("No API key saved. Already using autosync service.");
        return;
    }

    const confirm = prompt("Remove your saved API key? (y/n): ");
    if (confirm?.toLowerCase() !== "y") {
        console.log("Key kept.");
        return;
    }

    removeApiKey();
};