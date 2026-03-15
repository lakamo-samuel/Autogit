import promptSync from "prompt-sync";
import { saveApiKey } from "./config.js";

export function loginUser() {
  const prompt = promptSync({ sigint: true });

  const key = prompt("Enter your Gemini API key: ", { echo: "*" });

  if (!key || key.trim().length < 10) {
    console.log("❌ Invalid API key");
    return;
  }

  saveApiKey(key.trim());
}
