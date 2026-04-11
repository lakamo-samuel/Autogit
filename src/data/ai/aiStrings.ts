export const AI_STRINGS = {
    fallback: (msg: string) => `  fallback commit message: ${msg}`,
    noStagedChanges: "No staged changes, using fallback",
    diffLines: (count: number) => `  diff lines: ${count}`,
    diffTruncated: (max: number, original: number) =>
        `  diff truncated to ${max} lines (original ${original})`,

    usingUserKey: "Using your Gemini API key...",
    geminiResponseError: (status: number, text: string) =>
        `Gemini response error: ${status} ${text}`,
    geminiResponseBody: (body: string) => `  response body: ${body}`,
    geminiParseError: (msg: string) => `Failed to parse Gemini response: ${msg}`,
    geminiRawResponse: (raw: string) => `  raw response: ${raw}`,
    geminiEmptyMessage: "Empty AI message, using fallback",

    usingBackend: "Generating commit via autosync service...",
    rateLimited: (error: string, retryAfter: string) =>
        `Rate limited: ${error} (retry in ${retryAfter})`,
    rateLimitedHint: "Run autosync-git login to add your key for unlimited use",
    backendEmptyMessage: "Empty response, using fallback",

    aiCommit: (msg: string) => `AI Commit: ${msg}`,
    requestTimeout: "Request timed out, using fallback",
    requestFailed: (msg: string) => `Request failed: ${msg}`,
} as const;