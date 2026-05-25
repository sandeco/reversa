#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { clearTerminalForLogo, renderReversaLogo } from '../lib/utils/banner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const [,, command, ...args] = process.argv;

const commands = {
  install:            () => import('../lib/commands/install.js'),
  update:             () => import('../lib/commands/update.js'),
  status:             () => import('../lib/commands/status.js'),
  uninstall:          () => import('../lib/commands/uninstall.js'),
  'add-agent':        () => import('../lib/commands/add-agent.js'),
  'add-engine':       () => import('../lib/commands/add-engine.js'),
  'export-diagrams':  () => import('../lib/commands/export-diagrams.js'),
};

if (!command || command === '--help' || command === '-h') {
  clearTerminalForLogo();
  console.log(renderReversaLogo(chalk) + `

  reversa v${pkg.version}

  Usage: npx reversa <command>

  Commands:
    install            Install Reversa in the current project
    update             Update the agents to the latest version
    status             Show the current analysis status
    uninstall          Remove Reversa from the project
    add-agent          Add an agent to the project
    add-engine         Add support for an engine
    export-diagrams    Export Mermaid diagrams as SVG/PNG images
                       Options: --format=svg|png  --output=<folder>
                       Requires: npm install -g @mermaid-js/mermaid-cli

  Documentation: https://github.com/sandeco/reversa
  `);
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log(pkg.version);
  process.exit(0);
}

if (!commands[command]) {
  console.error(`\n  Unknown command: "${command}"`);
  console.error('  Run "npx reversa --help" to see the available commands.\n');
  process.exit(1);
}

const mod = await commands[command]();
await mod.default(args);
