#!/usr/bin/env node
import { Command } from "commander";

const DIST = process.env.AUTOSYNC_DIST_PATH ?? "../dist";

const { initRepo, startWatcher, stopWatcher, showConfig } = await import(`${DIST}/index.js`);
const { loginUser, logoutUser }                           = await import(`${DIST}/login.js`);
const { showStatus }                                      = await import(`${DIST}/config.js`);

const program = new Command();

program
    .name("autosync-git")
    .description("Auto commit your code with AI-generated messages")
    .version("0.1.0");

program
    .command("init")
    .description("Initialize autosync-git in current repo")
    .action(initRepo);

program
    .command("login")
    .description("Set your Gemini API key for unlimited mode")
    .action(loginUser);

program
    .command("logout")
    .description("Remove saved API key, switch back to autosync service")
    .action(logoutUser);

program
    .command("start")
    .description("Start autosync watcher")
    .action(startWatcher);

program
    .command("stop")
    .description("Stop autosync watcher")
    .action(stopWatcher);

program
    .command("config")
    .description("Show current autosync config")
    .action(showConfig);

program
    .command("status")
    .description("Show current mode (direct key or autosync service)")
    .action(showStatus);

program.parse(process.argv);