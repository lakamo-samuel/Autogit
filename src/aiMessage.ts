import { execSync } from "child_process";
import "dotenv/config";
import { generateCommitMessage } from "./commitMessage.ts";

/**
 * Generate commit message using Gemini API
 */
const API_KEY = process.env.GEMINI_API_KEY;
export async function generateCommitMessageAI(): Promise<string> {
  let diff = "";

  try {
    diff = execSync("git diff --cached", { encoding: "utf-8" }).trim();
  } catch {
    return generateCommitMessage();
  }

  // If nothing is staged, don’t call AI
  if (!diff) {
    console.log("🧱 No staged changes, using fallback commit message");
    return generateCommitMessage();
  }

  try {
  const res = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a senior software engineer.

Analyze the git diff and write ONE concise commit message.

Rules:
- Imperative mood
- Conventional commits
- Mention what changed

Git diff:
${diff}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 60,
        responseMimeType: "text/plain"
      }
    })
  }
);

    if (!res.ok) {
       const err = await res.text();
       console.error(err);
      console.warn(
        `🧱 Gemini HTTP ${res.status}, using fallback commit message`,
      );
      return generateCommitMessage();
    }

    const data = (await res.json()) as any;

    const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiMessage) {
      console.log("🧱 Gemini returned empty message, using fallback");
      return generateCommitMessage();
    }

    console.log("🤖 Using AI-generated commit message");
    return aiMessage;
  } catch (error) {
    console.error("🧱 Gemini failed, using fallback:", error);
    return generateCommitMessage();
  }
}
