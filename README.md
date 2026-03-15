# AutoSync Git

Automatically commit your code with AI-generated commit messages.

AutoSync Git watches your project files, stages changes, generates intelligent commit messages using AI, and creates commits automatically — keeping your Git history clean and organized.

## Features

- **AI-Generated Commit Messages** — Creates meaningful commit messages based on your staged changes.
- **Automatic File Watching** — Detects file changes in real time.
- **Smart Staging** — Automatically stages modified files before committing.
- **Conventional Commit Format** — Commit messages follow conventional commit style.
- **Works With Any Git Repository** — Simply initialize inside a Git project and start coding.

## Installation

Install globally using npm:

```bash
npm install -g autosync-git
```

## Getting Started

### 1. Initialize AutoSync Git

```bash
autosync-git init
```

This will create the necessary configuration files for AutoSync Git in your project.

### 2. Add your AI API key

```bash
autosync-git login
```

You will be prompted to enter your Gemini API key. This key is used to generate AI commit messages.

### 3. Start watching your project

```bash
autosync-git start
```

AutoSync Git will now:

- Watch for file changes
- Stage modified files
- Generate an AI commit message
- Commit automatically

### 4. Stop watching

```bash
autosync-git stop
```

Stops the file watcher and prevents automatic commits.

## Example Workflow

After starting AutoSync Git:

```bash
autosync-git start
```

Edit your files, for example:

```
src/auth/loginController.js
src/auth/authMiddleware.js
```

When changes are detected, AutoSync Git generates a commit like:

```
feat(auth): add jwt authentication middleware
```

Another commit could look like:

```
fix(api): correct user data validation
```

## Commands

| Command | Description |
|---|---|
| `autosync-git init` | Initialize AutoSync Git configuration |
| `autosync-git login` | Add your AI API key |
| `autosync-git start` | Start the file watcher |
| `autosync-git stop` | Stop the watcher |
| `autosync-git config` | Show current configuration |

## Requirements

- Node.js 18 or higher
- Git installed
- Gemini API key for AI commit generation

## License

MIT License