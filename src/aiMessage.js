import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.js";
import { getApiKey, defaultConfig } from "./config.js";


export async function generateCommitMessageAI() {
const API_KEY = getApiKey();

  let diff = "";

  try {
    diff = execSync("git diff --cached --ignore-all-space", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return generateCommitMessage();
  }

  if (!diff) {
    console.log("🧱 No staged changes, using fallback commit message");
    return generateCommitMessage();
  }

  // Limit diff size
  const diffLines = diff.split("\n");

  if (diffLines.length > defaultConfig.maxDiffLines) {
    diff = diffLines.slice(0, defaultConfig.maxDiffLines).join("\n");
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    console.log("🧠 Generating AI commit message...");

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert software engineer.

Analyze the git diff and create a concise conventional commit message.

Rules:
- format: type(scope): description
- types: feat, fix, refactor, chore, docs, test
- max 12 words
- imperative mood
- lowercase
- no punctuation at end

Example outputs:
feat(auth): add jwt authentication
fix(api): handle null user response
refactor(db): simplify query builder

Git diff:
${diff}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 60,
            responseMimeType: "text/plain",
          },
        }),
      },
    );

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`🧱 Gemini HTTP ${res.status}, using fallback`);
      return generateCommitMessage();
    }

    const data = await res.json();

    const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiMessage) {
      console.log("🧱 Empty AI message, using fallback");
      return generateCommitMessage();
    }

    console.log("🤖 AI Commit:", aiMessage);

    return aiMessage;
  } catch (error) {
    console.error("🧱 AI request failed:", error.message);
    return generateCommitMessage();
  }
}
