import { execSync } from "child_process";
import "dotenv/config";
import { generateCommitMessage } from "./commitMessage.ts";

/**
 * Generate commit message using Gemini API
 */
export async function generateCommitMessageAI(): Promise<string> {
  const diff = execSync("git diff --cached", { encoding: "utf-8" });

  if (!diff.trim()) return generateCommitMessage();

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
                  text: `Write a concise, conventional git commit message for these changes:\n\n${diff}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          },
        }),
      },
    );

    const data = (await res.json()) as any;

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      generateCommitMessage()
    );
  } catch (error) {
    console.error("Gemini failed, using fallback:", error);
    return generateCommitMessage();
  }
}
