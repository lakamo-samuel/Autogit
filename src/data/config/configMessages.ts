export const CONFIG_MESSAGES = {
    apiKeySaved: "API key saved. Unlimited mode enabled.",
    apiKeyNone: "No API key saved.",
    apiKeyRemoved: "API key removed. Switching to autosync service.",

    statusDirect: "Mode: Direct (personal Gemini API key)",
    statusDirectDetail: "Unlimited usage, billed to your Google account",

    statusShared: "Mode: Autosync Service (shared backend)",
    statusSharedDetail: "Rate limited: 5 requests/min, 50 requests/day",
    statusSharedHint: "Run autosync-git login to add your key for unlimited use",

    initAlreadyExists: "Autosync-git config already exists!",
    initSuccess: "Autosync-git config initialized!",
    showConfig: (config: unknown) => `Current Autosync-git config: ${JSON.stringify(config, null, 2)}`,
    showConfigNotFound: `Config not found. Run "Autosync-git init" first.`,
} as const;