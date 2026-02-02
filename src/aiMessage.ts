import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.ts"; // fallback

/**
 * Generate commit message using Gemini free API (Node 18+ fetch)
 */
export async function generateCommitMessageAI(): Promise<string> {
  // Get staged diff
  const diff = execSync("git diff --cached", { encoding: "utf-8" });

  if (!diff) return generateCommitMessage(); // fallback

  try {
    const response = await fetch("https://api.gemini.com/v1/ai/commit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer YOUR_FREE_GEMINI_KEY`, // replace with free key
      },
      body: JSON.stringify({
        prompt: `Summarize these git changes into a concise commit message:\n\n${diff}`,
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    const data = (await response.json()) as any;
    return data?.message ?? generateCommitMessage();

  } catch (err) {
    console.error("Gemini AI failed, using local commit message", err);
    return generateCommitMessage(); // fallback
  }
}
