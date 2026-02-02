#!/usr/bin/env node
import { Command } from "commander";
import {
  initRepo,
  startWatcher,
  stopWatcher,
  showConfig,
} from "../src/index.ts";

const program = new Command();

program
  .name("autogit")
  .description("Auto commit your code with AI-generated messages")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize AutoGit config")
  .action(initRepo);

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
