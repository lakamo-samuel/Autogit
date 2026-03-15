#!/usr/bin/env node
import { Command } from "commander";
import {
  initRepo,
  startWatcher,
  stopWatcher,
  showConfig,
} from "../src/index.js";
import { loginUser } from "../src/login.js";

const program = new Command();

program
  .name("autosync-git")
  .description("Auto commit your code with AI-generated messages")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize AutoGit config")
  .action(initRepo);
program
  .command("login")
  .description("Add your Gemini API key")
  .action(loginUser);
program
  .command("start")
  .description("Start AutoGit watcher")
  .action(startWatcher);

program.command("stop").description("Stop AutoGit watcher").action(stopWatcher);

program
  .command("config")
  .description("Show current AutoGit config")
  .action(showConfig);
program.parse(process.argv);
