import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.ts"; // fallback

interface PaLMResponse {
  candidates?: { output?: string }[];
}

/**
 * Generate commit message using Google Gemini / PaLM API
 * Requires:
 * - GOOGLE_API_KEY environment variable set
 */
export async function generateCommitMessageAI(): Promise<string> {
  // Get staged diff
  const diff = execSync("git diff --cached", { encoding: "utf-8" });
  if (!diff) return generateCommitMessage(); // fallback

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return generateCommitMessage(); // fallback

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: {
            text: `Summarize these git changes into a concise commit message:\n\n${diff}`,
          },
          temperature: 0.3,
          maxOutputTokens: 50,
        }),
      },
    );

    const data: PaLMResponse = await response.json();
    const message = data.candidates?.[0]?.output?.trim();

    return message || generateCommitMessage(); // fallback if API returns nothing
  } catch (err) {
    console.error("Gemini/PaLM AI failed, using local commit message", err);
    return generateCommitMessage(); // fallback
  }
}
