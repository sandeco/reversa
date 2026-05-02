import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function readState(projectRoot) {
  const statePath = join(projectRoot, '.reversa', 'state.json');
  if (!existsSync(statePath)) return null;
  return JSON.parse(readFileSync(statePath, 'utf8'));
}

function readFileSafe(baseDir, relPath) {
  const filePath = join(baseDir, relPath);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

function buildConfig() {
  const server = new McpServer({
    name: 'reversa',
    version: '1.2.14',
  }, {
    capabilities: { tools: {}, resources: {} },
  });

  server.tool(
    'reversa_status',
    'Get the current Reversa analysis state for a project',
    {
      path: z.string().describe('Absolute path to the project directory'),
    },
    async ({ path }) => {
      const state = readState(path);
      if (!state) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ installed: false, message: 'Reversa is not installed in this project.' }, null, 2) }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ installed: true, ...state }, null, 2) }],
      };
    },
  );

  server.tool(
    'reversa_analyze',
    'Check if a Reversa analysis can be started or resumed on a project',
    {
      path: z.string().describe('Absolute path to the project directory'),
      level: z.enum(['essencial', 'completo', 'detalhado']).optional().describe('Documentation depth level'),
    },
    async ({ path, level }) => {
      const state = readState(path);
      if (!state) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            error: 'Reversa not installed',
            message: `Open the project in the AI agent and type "reversa". The skill will set up the state automatically.`,
          }, null, 2) }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({
          status: 'ready',
          phase: state.phase,
          completed: state.completed || [],
          pending: state.pending || [],
          message: `Reversa analysis is at phase "${state.phase}". Open the project in the AI agent and type "reversa" to resume.`,
          doc_level: level || state.doc_level || 'completo',
        }, null, 2) }],
      };
    },
  );

  server.tool(
    'reversa_confidence',
    'Get the confidence report from a completed or in-progress Reversa analysis',
    {
      path: z.string().describe('Absolute path to the project directory'),
    },
    async ({ path }) => {
      const outputFolder = '_reversa_sdd';
      const content = readFileSafe(path, join(outputFolder, 'confidence-report.md'));
      if (!content) {
        return {
          content: [{ type: 'text', text: JSON.stringify({
            error: 'No confidence report found',
            message: 'Run the Reversa analysis pipeline first.',
          }, null, 2) }],
        };
      }
      return {
        content: [{ type: 'text', text: content.substring(0, 8000) }],
      };
    },
  );

  server.resource(
    'reversa-state',
    'reversa://state',
    async (uri) => {
      const projectRoot = process.cwd();
      const state = readState(projectRoot);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(state || { installed: false }, null, 2),
        }],
      };
    },
  );

  server.resource(
    'reversa-inventory',
    'reversa://inventory',
    async (uri) => {
      const projectRoot = process.cwd();
      const content = readFileSafe(projectRoot, '_reversa_sdd/inventory.md');
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: content || '# No inventory found\nRun the Reversa analysis pipeline first.',
        }],
      };
    },
  );

  server.prompt(
    'reversa-new-analysis',
    'Start a new Reversa analysis of a project',
    {
      path: z.string().describe('Absolute path to the project directory'),
      level: z.enum(['essencial', 'completo', 'detalhado']).default('completo'),
    },
    async ({ path, level }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `I want to run a Reversa analysis on the project at ${path} with documentation level ${level}. Please activate the Reversa orchestrator by typing "reversa" and guide me through the process.`,
        },
      }],
    }),
  );

  return server;
}

export default async function startMcpServer() {
  const server = buildConfig();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
