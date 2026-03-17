import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.js";
import { defaultConfig, getApiKey } from "./config.js";

const BACKEND_URL = "http://localhost:3000"; // TODO: replace with your deployed backend URL

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = (diff) => `You are an expert software engineer.

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
${diff}`;

export async function generateCommitMessageAI() {
  let diff = "";

  // get diff
  try {
    diff = execSync("git diff --cached --ignore-all-space", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return generateCommitMessage();
  }

  if (!diff) {
    console.log("🧱 No staged changes, using fallback");
    return generateCommitMessage();
  }

  // trim diff if too long
  const diffLines = diff.split("\n");
  if (diffLines.length > defaultConfig.maxDiffLines) {
    diff = diffLines.slice(0, defaultConfig.maxDiffLines).join("\n");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const userKey = getApiKey(); // from ~/.autosync-git/config.json — null if not set

    let data;

    if (userKey) {
      // --- direct mode: user's own key, no rate limit ---
      console.log("🔑 Using your Gemini API key...");

      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": userKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT(diff) }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 60,
            responseMimeType: "text/plain",
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini error: ${res.status} ${res.statusText}`);
      }

      data = await res.json();
    } else {
      // --- backend mode: your key, rate limited ---
      console.log("🧠 Generating commit via autosync service...");

      const res = await fetch(`${BACKEND_URL}/api/v1/getmessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ diff }),
      });

      if (res.status === 429) {
        const errData = await res.json();
        console.warn(
          `⚠️  Rate limited: ${errData.error} (retry in ${errData.retryAfter})`,
        );
        console.warn(
          "💡 Tip: run autosync-git login to add your key for unlimited use",
        );
        return generateCommitMessage();
      }

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      data = await res.json();

      // backend returns { message } directly, not Gemini's raw response
      const backendMessage = data?.message;
      clearTimeout(timeout);

      if (!backendMessage) {
        console.log("Empty response, using fallback");
        return generateCommitMessage();
      }

      console.log("✅ AI Commit:", backendMessage);
      return backendMessage;
    }

    clearTimeout(timeout);

    // parse Gemini's raw response (only reached in direct mode)
    const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiMessage) {
      console.log("Empty AI message, using fallback");
      return generateCommitMessage();
    }

    console.log("✅ AI Commit:", aiMessage);
    return aiMessage;
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      console.warn("⏱️  Request timed out, using fallback");
    } else {
      console.error("❌ Request failed:", err.message);
    }

    return generateCommitMessage();
  }
}
