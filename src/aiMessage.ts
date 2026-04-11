import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.js";
import { defaultConfig, getApiKey } from "./config.js";

const BACKEND_URL = "http://localhost:3000";
const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = (diff: string): string => `You are an expert software engineer.

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

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

interface BackendResponse {
    message?: string;
}

export const generateCommitMessageAI = async (): Promise<string> => {
    let diff = "";

    const fallback = (): string => {
        const fallbackMessage = generateCommitMessage();
        console.log("  fallback commit message:", fallbackMessage);
        return fallbackMessage;
    };

    try {
        diff = execSync("git diff --cached --ignore-all-space", {
            encoding: "utf-8",
        }).trim();
    } catch {
        return fallback();
    }

    if (!diff) {
        console.log("No staged changes, using fallback");
        return fallback();
    }

    const diffLines = diff.split("\n");
    console.log(`  diff lines: ${diffLines.length}`);
    if (diffLines.length > defaultConfig.maxDiffLines) {
        diff = diffLines.slice(0, defaultConfig.maxDiffLines).join("\n");
        console.log(
            `  diff truncated to ${defaultConfig.maxDiffLines} lines (original ${diffLines.length})`,
        );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
        const userKey = getApiKey();

        if (userKey) {
            console.log("Using your Gemini API key...");

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

            const resText = await res.text();

            if (!res.ok) {
                console.error("Gemini response error:", res.status, res.statusText);
                console.error("  response body:", resText);
                throw new Error(`Gemini error: ${res.status} ${res.statusText}`);
            }

            let data: GeminiResponse = {};
            try {
                data = resText ? (JSON.parse(resText) as GeminiResponse) : {};
            } catch (parseErr) {
                console.error("Failed to parse Gemini response:", (parseErr as Error).message);
                console.error("  raw response:", resText);
                throw new Error("Gemini response parse error");
            }

            clearTimeout(timeout);

            const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!aiMessage) {
                console.log("Empty AI message, using fallback");
                return fallback();
            }

            console.log("AI Commit:", aiMessage);
            return aiMessage;
        }

        console.log("Generating commit via autosync service...");

        const res = await fetch(`${BACKEND_URL}/api/v1/getmessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ diff }),
        });

        if (res.status === 429) {
            const errData = (await res.json()) as { error?: string; retryAfter?: string };
            console.warn(`Rate limited: ${errData.error} (retry in ${errData.retryAfter})`);
            console.warn("Run autosync-git login to add your key for unlimited use");
            return fallback();
        }

        if (!res.ok) {
            throw new Error(`Backend error: ${res.status}`);
        }

        const data = (await res.json()) as BackendResponse;
        const backendMessage = data.message;
        clearTimeout(timeout);

        if (!backendMessage) {
            console.log("Empty response, using fallback");
            return fallback();
        }

        console.log("AI Commit:", backendMessage);
        return backendMessage;
    } catch (err) {
        clearTimeout(timeout);

        if ((err as Error).name === "AbortError") {
            console.warn("Request timed out, using fallback");
        } else {
            console.error("Request failed:", (err as Error).message);
        }

        return fallback();
    }
};