export const BACKEND_URL = "http://localhost:3000";
export const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const GEMINI_GENERATION_CONFIG = {
    temperature: 0.3,
    maxOutputTokens: 60,
    responseMimeType: "text/plain",
} as const;

export const AI_TIMEOUT_MS = 12_000;

export const COMMIT_PROMPT = (diff: string): string =>
    `You are an expert software engineer.

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