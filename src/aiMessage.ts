import { execSync } from "child_process";
import { generateCommitMessage } from "./commitMessage.js";
import { defaultConfig, getApiKey } from "./config.js";
import {
    BACKEND_URL,
    GEMINI_URL,
    GEMINI_GENERATION_CONFIG,
    AI_TIMEOUT_MS,
    COMMIT_PROMPT,
} from "./data/ai/aiDefaults.js";
import { AI_STRINGS } from "./data/ai/aiStrings.js";

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
        console.log(AI_STRINGS.fallback(fallbackMessage));
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
        console.log(AI_STRINGS.noStagedChanges);
        return fallback();
    }

    const diffLines = diff.split("\n");
    console.log(AI_STRINGS.diffLines(diffLines.length));

    if (diffLines.length > defaultConfig.maxDiffLines) {
        diff = diffLines.slice(0, defaultConfig.maxDiffLines).join("\n");
        console.log(AI_STRINGS.diffTruncated(defaultConfig.maxDiffLines, diffLines.length));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
        const userKey = getApiKey();

        if (userKey) {
            console.log(AI_STRINGS.usingUserKey);

            const res = await fetch(GEMINI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": userKey,
                },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: COMMIT_PROMPT(diff) }] }],
                    generationConfig: GEMINI_GENERATION_CONFIG,
                }),
            });

            const resText = await res.text();

            if (!res.ok) {
                console.error(AI_STRINGS.geminiResponseError(res.status, res.statusText));
                console.error(AI_STRINGS.geminiResponseBody(resText));
                throw new Error(`Gemini error: ${res.status} ${res.statusText}`);
            }

            let data: GeminiResponse = {};
            try {
                data = resText ? (JSON.parse(resText) as GeminiResponse) : {};
            } catch (parseErr) {
                console.error(AI_STRINGS.geminiParseError((parseErr as Error).message));
                console.error(AI_STRINGS.geminiRawResponse(resText));
                throw new Error("Gemini response parse error");
            }

            clearTimeout(timeout);

            const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!aiMessage) {
                console.log(AI_STRINGS.geminiEmptyMessage);
                return fallback();
            }

            console.log(AI_STRINGS.aiCommit(aiMessage));
            return aiMessage;
        }

        console.log(AI_STRINGS.usingBackend);

        const res = await fetch(`${BACKEND_URL}/api/v1/getmessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ diff }),
        });

        if (res.status === 429) {
            const errData = (await res.json()) as { error?: string; retryAfter?: string };
            console.warn(AI_STRINGS.rateLimited(errData.error ?? "", errData.retryAfter ?? ""));
            console.warn(AI_STRINGS.rateLimitedHint);
            return fallback();
        }

        if (!res.ok) {
            throw new Error(`Backend error: ${res.status}`);
        }

        const data = (await res.json()) as BackendResponse;
        const backendMessage = data.message;
        clearTimeout(timeout);

        if (!backendMessage) {
            console.log(AI_STRINGS.backendEmptyMessage);
            return fallback();
        }

        console.log(AI_STRINGS.aiCommit(backendMessage));
        return backendMessage;
    } catch (err) {
        clearTimeout(timeout);

        if ((err as Error).name === "AbortError") {
            console.warn(AI_STRINGS.requestTimeout);
        } else {
            console.error(AI_STRINGS.requestFailed((err as Error).message));
        }

        return fallback();
    }
};