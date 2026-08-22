import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { inspectClaudeProfiles } from '../claude/profiles.js';
import { inspectCodexProfiles } from '../codex/profiles.js';
import { loadManifest } from '../installer/manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';

const ENGINE_DIAGNOSTICS = Object.freeze({
  'claude-code': Object.freeze({
    key: 'claude',
    label: 'Claude Code',
    inspect: inspectClaudeProfiles,
    effortCapability: 'effort_override',
    protectedConfig: '.claude/settings*.json',
  }),
  codex: Object.freeze({
    key: 'codex',
    label: 'Codex',
    inspect: inspectCodexProfiles,
    effortCapability: 'reasoning_override',
    protectedConfig: '.codex/config.toml',
  }),
});

function printTable(rows) {
  const headers = ['Agent', 'Class', 'Model', 'Effort', 'Profile'];
  const widths = headers.map((header, index) => Math.max(
    header.length,
    ...rows.map((row) => String(row[index]).length),
  ));
  const render = (row) => row.map((value, index) => String(value).padEnd(widths[index])).join('  ');
  console.log(render(headers));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  for (const row of rows) console.log(render(row));
}

function buildDiagnostics(routing, engine) {
  return {
    configured: routing.enabled,
    profile_generation_enabled: routing.profileGenerationEnabled,
    runtime_verification: routing.runtimeVerification,
    capabilities: routing.capabilities,
    overrides: routing.overrides,
    agents: routing.profiles.map((profile) => ({
      agent: profile.id,
      compute_class: profile.computeClass,
      configured_model: profile.model,
      profile_model: routing.capabilities.model_override ? profile.model : null,
      configured_effort: profile.effort,
      profile_effort: routing.capabilities[engine.effortCapability] ? profile.effort : null,
      profile_status: profile.status,
    })),
  };
}

function stateLabel(routing) {
  if (!routing.enabled) return 'Disabled';
  return routing.profileGenerationEnabled ? 'Configured' : 'Configured (skill fallback only)';
}

export default async function models(args) {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const statePath = join(projectRoot, '.reversa', 'state.json');
  if (!existsSync(statePath)) {
    console.log(chalk.yellow('\n  Reversa is not installed in this directory.\n'));
    return;
  }

  const state = readJsonSafe(statePath);
  const selectedEngines = Object.entries(ENGINE_DIAGNOSTICS)
    .filter(([engineId]) => (state.engines ?? []).includes(engineId));
  if (selectedEngines.length === 0) {
    console.log(chalk.yellow('\n  Model routing is not configured for this project.\n'));
    return;
  }

  try {
    const manifest = loadManifest(projectRoot);
    const inspected = selectedEngines.map(([engineId, engine]) => {
      const routing = engine.inspect(projectRoot, state.agents ?? [], manifest);
      return { engineId, engine, routing, diagnostics: buildDiagnostics(routing, engine) };
    });
    const result = {
      runtime_verification: 'unavailable',
      engines: Object.fromEntries(inspected.map(({ engine, diagnostics }) => [engine.key, diagnostics])),
    };
    if (args.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(chalk.bold('\n  Reversa Model Routing\n'));
    console.log('  Runtime verification unavailable; configured values are not claimed as effective.\n');
    for (const { engine, routing, diagnostics } of inspected) {
      console.log(chalk.bold(`  ${engine.label}`));
      console.log(`  State: ${stateLabel(routing)}`);
      console.log(`  Capabilities: ${Object.entries(routing.capabilities).map(([key, value]) => `${key}=${value}`).join(', ')}\n`);
      printTable(diagnostics.agents.map((agent) => [
        agent.agent,
        agent.compute_class,
        agent.profile_model ?? '(inherit)',
        agent.profile_effort ?? '(inherit)',
        agent.profile_status,
      ]));
      const overrideCount = Object.values(routing.overrides).reduce((sum, value) => sum + value, 0);
      console.log(`\n  Overrides: ${overrideCount}`);
      console.log(`  ${engine.protectedConfig}: untouched by Reversa\n`);
    }
  } catch (error) {
    console.error(chalk.red(`\n  Invalid model routing configuration: ${error.message}\n`));
    process.exitCode = 1;
  }
}
