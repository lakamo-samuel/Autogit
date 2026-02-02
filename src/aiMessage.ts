import { execSync } from "child_process";
import "dotenv/config";
import { generateCommitMessage } from "./commitMessage.ts";

/**
 * Generate commit message using Gemini API
 */
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a senior software engineer.

Analyze the following git diff and write ONE concise,
human-like git commit message.

Rules:
- Use imperative mood (Add, Fix, Remove, Refactor)
- Be specific, not generic
- Mention WHAT changed (and WHY if obvious)
- Follow conventional commits if applicable
- Do NOT wrap in quotes

Git diff:
${diff}
                  `,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 60,
          },
        }),
      },
    );

    if (!res.ok) {
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
