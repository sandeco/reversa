---
title: Extensions
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
source: git
fetched_at: 2026-04-29T12:02:55.407350979-03:00
rendered_js: false
word_count: 3287
summary: This document explains how to develop TypeScript-based extensions for the pi coding agent, covering event subscription, tool registration, custom UI creation, and state management.
tags:
    - typescript
    - automation
    - extensibility
    - agent-development
    - cli-tools
    - event-driven
category: guide
optimized: true
optimized_at: 2026-04-29T15:00:00.000Z
---
> [!tip]
> pi can create extensions. Ask it to build one for your use case.

# Extensions

Extensions are TypeScript modules that extend pi's behavior: subscribe to lifecycle events, register custom tools, add commands, and customize UI.

> [!warning]
> Extensions run with full system permissions and can execute arbitrary code. Only install from trusted sources.

## Placement for /reload

Put extensions in `~/.pi/agent/extensions/` (global) or `.pi/extensions/` (project-local) for auto-discovery. Use `pi -e ./path.ts` only for quick tests.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| **Custom tools** | Register tools the LLM can call via `pi.registerTool()` |
| **Event interception** | Block or modify tool calls, inject context, customize compaction |
| **User interaction** | Prompt users via `ctx.ui` (select, confirm, input, notify) |
| **Custom UI components** | Full TUI components with keyboard input via `ctx.ui.custom()` |
| **Custom commands** | Register commands like `/mycommand` via `pi.registerCommand()` |
| **Session persistence** | Store state that survives restarts via `pi.appendEntry()` |
| **Custom rendering** | Control how tool calls/results and messages appear in TUI |

## Example Use Cases

- Permission gates (confirm before `rm -rf`, `sudo`, etc.)
- Git checkpointing (stash at each turn, restore on branch)
- Path protection (block writes to `.env`, `node_modules/`)
- Custom compaction (summarize conversation your way)
- Conversation summaries
- Interactive tools (questions, wizards, custom dialogs)
- Stateful tools (todo lists, connection pools)
- External integrations (file watchers, webhooks, CI triggers)
- Games while you wait

## Quick Start

Create `~/.pi/agent/extensions/my-extension.ts`:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  // React to events
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
      const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
      if (!ok) return { block: true, reason: "Blocked by user" };
    }
  });

  // Register a custom tool
  pi.registerTool({
    name: "greet",
    label: "Greet",
    description: "Greet someone by name",
    parameters: Type.Object({
      name: Type.String({ description: "Name to greet" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      return {
        content: [{ type: "text", text: `Hello, ${params.name}!` }],
        details: {},
      };
    },
  });

  // Register a command
  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => {
      ctx.ui.notify(`Hello ${args || "world"}!`, "info");
    },
  });
}
```

Test with `--extension` (or `-e`) flag:

```bash
pi -e ./my-extension.ts
```

## Extension Locations

Extensions are auto-discovered from:

| Location | Scope |
|----------|-------|
| `~/.pi/agent/extensions/*.ts` | Global (all projects) |
| `~/.pi/agent/extensions/*/index.ts` | Global (subdirectory) |
| `.pi/extensions/*.ts` | Project-local |
| `.pi/extensions/*/index.ts` | Project-local (subdirectory) |

Additional paths via `settings.json`:

```json
{
  "packages": [
    "npm:@foo/bar@1.0.0",
    "git:github.com/user/repo@v1"
  ],
  "extensions": [
    "/path/to/local/extension.ts",
    "/path/to/local/extension/dir"
  ]
}
```

> [!note]
> To share extensions via npm or git as pi packages, see [[005-packages|Pi Packages]].

## Available Imports

| Package | Purpose |
|---------|---------|
| `@mariozechner/pi-coding-agent` | Extension types (`ExtensionAPI`, `ExtensionContext`, events) |
| `typebox` | Schema definitions for tool parameters |
| `@mariozechner/pi-ai` | AI utilities (`StringEnum` for Google-compatible enums) |
| `@mariozechner/pi-tui` | TUI components for custom rendering |

npm dependencies work too. Add a `package.json` next to your extension, run `npm install`, and imports from `node_modules/` are resolved automatically.

> [!note]
> For distributed pi packages installed with `pi install` (npm or git), runtime deps must be in `dependencies`. Package installation uses production installs (`npm install --omit=dev`) by default, so `devDependencies` are not available at runtime.

Node.js built-ins (`node:fs`, `node:path`, etc.) are also available.

## Writing an Extension

An extension exports a default factory function that receives `ExtensionAPI`. The factory can be synchronous or asynchronous. Extensions are loaded via [jiti](https://github.com/unjs/jiti), so TypeScript works without compilation.

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("event_name", async (event, ctx) => {
    const ok = await ctx.ui.confirm("Title", "Are you sure?");
    ctx.ui.notify("Done!", "success");
    ctx.ui.setStatus("my-ext", "Processing...");
    ctx.ui.setWidget("my-ext", ["Line 1", "Line 2"]);
  });

  pi.registerTool({ ... });
  pi.registerCommand("name", { ... });
  pi.registerShortcut("ctrl+x", { ... });
  pi.registerFlag("my-flag", { ... });
}
```

If the factory returns a `Promise`, pi awaits it before continuing startup — before `session_start`, before `resources_discover`, and before provider registrations queued via `pi.registerProvider()` are flushed.

### Async factory functions

Use an async factory for one-time startup work such as fetching remote configuration or dynamically discovering available models:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default async function (pi: ExtensionAPI) {
  const response = await fetch("http://localhost:1234/v1/models");
  const payload = (await response.json()) as {
    data: Array<{
      id: string;
      name?: string;
      context_window?: number;
      max_tokens?: number;
    }>;
  };

  pi.registerProvider("local-openai", {
    baseUrl: "http://localhost:1234/v1",
    apiKey: "LOCAL_OPENAI_API_KEY",
    api: "openai-completions",
    models: payload.data.map((model) => ({
      id: model.id,
      name: model.name ?? model.id,
      reasoning: false,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: model.context_window ?? 128000,
      maxTokens: model.max_tokens ?? 4096,
    })),
  });
}
```

### Extension Styles

**Single file** — for small extensions:
```
~/.pi/agent/extensions/
└── my-extension.ts
```

**Directory with index.ts** — for multi-file extensions:
```
~/.pi/agent/extensions/
└── my-extension/
    ├── index.ts        # Entry point (exports default function)
    ├── tools.ts        # Helper module
    └── utils.ts        # Helper module
```

**Package with dependencies** — for extensions that need npm packages:
```
~/.pi/agent/extensions/
└── my-extension/
    ├── package.json    # Declares dependencies and entry points
    ├── package-lock.json
    ├── node_modules/   # After npm install
    └── src/
        └── index.ts
```

```json
{
  "name": "my-extension",
  "dependencies": {
    "zod": "^3.0.0",
    "chalk": "^5.0.0"
  },
  "pi": {
    "extensions": ["./src/index.ts"]
  }
}
```

Run `npm install` in the extension directory, then imports from `node_modules/` work automatically.

## Events

### Lifecycle Overview

```
pi starts
  ├─► session_start { reason: "startup" }
  └─► resources_discover { reason: "startup" }
      ▼
user sends prompt ─────────────────────────────────────────┐
  ├─► (extension commands checked first, bypass if found)  │
  ├─► input (can intercept, transform, or handle)           │
  ├─► (skill/template expansion if not handled)             │
  ├─► before_agent_start (can inject message, modify system prompt)
  ├─► agent_start                                          │
  ├─► message_start / message_update / message_end         │
  │   ┌─── turn (repeats while LLM calls tools) ───┐        │
  │   ├─► turn_start                               │        │
  │   ├─► context (can modify messages)            │        │
  │   ├─► before_provider_request                  │        │
  │   ├─► after_provider_response                  │        │
  │   ├─► tool_execution_start                     │        │
  │   ├─► tool_call (can block)                    │        │
  │   ├─► tool_execution_update                    │        │
  │   ├─► tool_result (can modify)                 │        │
  │   └─► tool_execution_end                       │        │
  │   └─► turn_end                                 │        │
  └─► agent_end                                            │
                                                           │
user sends another prompt ◄────────────────────────────────┘

/new or /resume:
  ├─► session_before_switch (can cancel)
  ├─► session_shutdown
  ├─► session_start { reason: "new" | "resume" }
  └─► resources_discover { reason: "startup" }

/fork or /clone:
  ├─► session_before_fork (can cancel)
  ├─► session_shutdown
  ├─► session_start { reason: "fork" }
  └─► resources_discover { reason: "startup" }

/compact or auto-compaction:
  ├─► session_before_compact (can cancel or customize)
  └─► session_compact

/tree navigation:
  ├─► session_before_tree (can cancel or customize)
  └─► session_tree

/model or Ctrl+P:
  └─► model_select

exit (Ctrl+C, Ctrl+D, SIGHUP, SIGTERM):
  └─► session_shutdown
```

### Resource Events

#### resources_discover

Fired after `session_start` so extensions can contribute additional skill, prompt, and theme paths.

```typescript
pi.on("resources_discover", async (event, _ctx) => {
  // event.cwd - current working directory
  // event.reason - "startup" | "reload"
  return {
    skillPaths: ["/path/to/skills"],
    promptPaths: ["/path/to/prompts"],
    themePaths: ["/path/to/themes"],
  };
});
```

### Session Events

> [!note]
> See [[025-session-format|Session File Format]] for session storage internals and the SessionManager API.

#### session_start

Fired when a session is started, loaded, or reloaded.

```typescript
pi.on("session_start", async (event, ctx) => {
  // event.reason - "startup" | "reload" | "new" | "resume" | "fork"
  // event.previousSessionFile - present for "new", "resume", and "fork"
  ctx.ui.notify(`Session: ${ctx.sessionManager.getSessionFile() ?? "ephemeral"}`, "info");
});
```

#### session_before_switch

Fired before starting a new session (`/new`) or switching sessions (`/resume`).

```typescript
pi.on("session_before_switch", async (event, ctx) => {
  // event.reason - "new" or "resume"
  // event.targetSessionFile - session we're switching to (only for "resume")

  if (event.reason === "new") {
    const ok = await ctx.ui.confirm("Clear?", "Delete all messages?");
    if (!ok) return { cancel: true };
  }
});
```

After a successful switch, pi emits `session_shutdown` for the old extension instance, reloads and rebinds extensions, then emits `session_start` with `reason: "new" | "resume"`.

#### session_before_fork

Fired when forking via `/fork` or cloning via `/clone`.

```typescript
pi.on("session_before_fork", async (event, ctx) => {
  // event.entryId - ID of the selected entry
  // event.position - "before" for /fork, "at" for /clone
  return { cancel: true };
});
```

#### session_before_compact / session_compact

Fired on compaction. See [[011-compaction|Compaction & Branch Summarization]] for details.

```typescript
pi.on("session_before_compact", async (event, ctx) => {
  const { preparation, branchEntries, customInstructions, signal } = event;

  // Cancel:
  return { cancel: true };

  // Custom summary:
  return {
    compaction: {
      summary: "...",
      firstKeptEntryId: preparation.firstKeptEntryId,
      tokensBefore: preparation.tokensBefore,
    }
  };
});

pi.on("session_compact", async (event, ctx) => {
  // event.compactionEntry - the saved compaction
  // event.fromExtension - whether extension provided it
});
```

#### session_before_tree / session_tree

Fired on `/tree` navigation. See [[007-sessions|Sessions]] for tree navigation concepts.

```typescript
pi.on("session_before_tree", async (event, ctx) => {
  const { preparation, signal } = event;
  return { cancel: true };
});

pi.on("session_tree", async (event, ctx) => {
  // event.newLeafId, oldLeafId, summaryEntry, fromExtension
});
```

#### session_shutdown

Fired before an extension runtime is torn down.

```typescript
pi.on("session_shutdown", async (event, ctx) => {
  // event.reason - "quit" | "reload" | "new" | "resume" | "fork"
  // event.targetSessionFile - destination session for session replacement flows
});
```

### Agent Events

#### before_agent_start

Fired after user submits prompt, before agent loop. Can inject a message and/or modify the system prompt.

```typescript
pi.on("before_agent_start", async (event, ctx) => {
  // event.prompt, event.images, event.systemPrompt, event.systemPromptOptions

  return {
    // Inject a persistent message (stored in session, sent to LLM)
    message: {
      customType: "my-extension",
      content: "Additional context for the LLM",
      display: true,
    },
    // Replace the system prompt for this turn (chained across extensions)
    systemPrompt: event.systemPrompt + "\n\nExtra instructions for this turn...",
  };
});
```

The `systemPromptOptions` field gives extensions access to structured data Pi uses to build the system prompt: custom prompts, guidelines, tool snippets, context files, skills.

Inside `before_agent_start`, `event.systemPrompt` and `ctx.getSystemPrompt()` both reflect the chained system prompt as of the current handler.

#### agent_start / agent_end

Fired once per user prompt.

```typescript
pi.on("agent_start", async (_event, ctx) => {});

pi.on("agent_end", async (event, ctx) => {
  // event.messages - messages from this prompt
});
```

#### turn_start / turn_end

Fired for each turn (one LLM response + tool calls).

```typescript
pi.on("turn_start", async (event, ctx) => {
  // event.turnIndex, event.timestamp
});

pi.on("turn_end", async (event, ctx) => {
  // event.turnIndex, event.message, event.toolResults
});
```

#### message_start / message_update / message_end

Fired for message lifecycle updates. `message_start` and `message_end` fire for user, assistant, and toolResult messages. `message_update` fires for assistant streaming updates.

```typescript
pi.on("message_start", async (event, ctx) => { /* event.message */ });
pi.on("message_update", async (event, ctx) => { /* event.message, event.assistantMessageEvent */ });
pi.on("message_end", async (event, ctx) => { /* event.message */ });
```

#### tool_execution_start / tool_execution_update / tool_execution_end

Fired for tool execution lifecycle updates.

In parallel tool mode:
- `tool_execution_start` is emitted in assistant source order during the preflight phase
- `tool_execution_update` events may interleave across tools
- `tool_execution_end` is emitted in tool completion order
- final `toolResult` message events are still emitted later in assistant source order

```typescript
pi.on("tool_execution_start", async (event, ctx) => {
  // event.toolCallId, event.toolName, event.args
});
pi.on("tool_execution_update", async (event, ctx) => {
  // event.toolCallId, event.toolName, event.args, event.partialResult
});
pi.on("tool_execution_end", async (event, ctx) => {
  // event.toolCallId, event.toolName, event.result, event.isError
});
```

#### context

Fired before each LLM call. Modify messages non-destructively.

```typescript
pi.on("context", async (event, ctx) => {
  // event.messages - deep copy, safe to modify
  return { messages: filtered };
});
```

#### before_provider_request

Fired after the provider-specific payload is built, right before the request is sent. Handlers run in extension load order.

```typescript
pi.on("before_provider_request", (event, ctx) => {
  // event.payload - the request payload
  // Return undefined to keep unchanged, or return a modified payload
});
```

This hook can rewrite provider-level system instructions or remove them entirely. Those payload-level changes are not reflected by `ctx.getSystemPrompt()`.

#### after_provider_response

Fired after an HTTP response is received and before its stream body is consumed.

```typescript
pi.on("after_provider_response", (event, ctx) => {
  // event.status - HTTP status code
  // event.headers - normalized response headers
});
```

### Model Events

#### model_select

Fired when the model changes via `/model` command, model cycling (`Ctrl+P`), or session restore.

```typescript
pi.on("model_select", async (event, ctx) => {
  // event.model - newly selected model
  // event.previousModel - previous model (undefined if first selection)
  // event.source - "set" | "cycle" | "restore"
});
```

### Tool Events

#### tool_call

Fired after `tool_execution_start`, before the tool executes. **Can block.** Use `isToolCallEventType` to narrow and get typed inputs.

`event.input` is mutable. Mutate it in place to patch tool arguments before execution.

```typescript
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

pi.on("tool_call", async (event, ctx) => {
  // event.toolName, event.toolCallId, event.input (mutable)

  if (isToolCallEventType("bash", event)) {
    // event.input is { command: string; timeout?: number }
    event.input.command = `source ~/.profile\n${event.input.command}`;

    if (event.input.command.includes("rm -rf")) {
      return { block: true, reason: "Dangerous command" };
    }
  }
});
```

**Typing custom tool input:**

```typescript
// my-extension.ts
export type MyToolInput = Static<typeof myToolSchema>;

pi.on("tool_call", (event) => {
  if (isToolCallEventType<"my_tool", MyToolInput>("my_tool", event)) {
    event.input.action;  // typed
  }
});
```

#### tool_result

Fired after tool execution finishes and before `tool_execution_end`. **Can modify result.** Handlers chain like middleware — each handler sees the latest result after previous handler changes.

```typescript
import { isBashToolResult } from "@mariozechner/pi-coding-agent";

pi.on("tool_result", async (event, ctx) => {
  // event.toolName, event.toolCallId, event.input
  // event.content, event.details, event.isError

  if (isBashToolResult(event)) {
    // event.details is typed as BashToolDetails
  }

  // Modify result:
  return { content: [...], details: {...}, isError: false };
});
```

### User Bash Events

#### user_bash

Fired when user executes `!` or `!!` commands. **Can intercept.**

```typescript
import { createLocalBashOperations } from "@mariozechner/pi-coding-agent";

pi.on("user_bash", (event, ctx) => {
  // event.command, event.excludeFromContext, event.cwd

  // Option 1: Provide custom operations (e.g., SSH)
  return { operations: remoteBashOps };

  // Option 2: Wrap pi's built-in local bash backend
  const local = createLocalBashOperations();
  return {
    operations: {
      exec(command, cwd, options) {
        return local.exec(`source ~/.profile\n${command}`, cwd, options);
      }
    }
  };

  // Option 3: Full replacement
  return { result: { output: "...", exitCode: 0, cancelled: false, truncated: false } };
});
```

### Input Events

#### input

Fired when user input is received, after extension commands are checked but before skill and template expansion.

**Processing order:**
1. Extension commands (`/cmd`) checked first — if found, handler runs and input event is skipped
2. `input` event fires — can intercept, transform, or handle
3. If not handled: skill commands (`/skill:name`) expanded
4. If not handled: prompt templates (`/template`) expanded
5. Agent processing begins

```typescript
pi.on("input", async (event, ctx) => {
  // event.text - raw input, event.images, event.source

  // Transform: rewrite input before expansion
  if (event.text.startsWith("?quick "))
    return { action: "transform", text: `Respond briefly: ${event.text.slice(7)}` };

  // Handle: respond without LLM
  if (event.text === "ping") {
    ctx.ui.notify("pong", "info");
    return { action: "handled" };
  }

  return { action: "continue" };  // Default: pass through
});
```

**Results:** `continue` (default), `transform` (modify text/images), `handled` (skip agent entirely).

## ExtensionContext

All handlers receive `ctx: ExtensionContext`.

| Property | Description |
|----------|-------------|
| `ctx.ui` | UI methods for user interaction |
| `ctx.hasUI` | `false` in print mode and JSON mode; `true` in interactive and RPC mode |
| `ctx.cwd` | Current working directory |
| `ctx.sessionManager` | Read-only access to session state |
| `ctx.modelRegistry` / `ctx.model` | Access to models and API keys |
| `ctx.signal` | Current agent abort signal (typically defined during turn events) |

### ctx.isIdle() / ctx.abort() / ctx.hasPendingMessages()

Control flow helpers.

### ctx.shutdown()

Request a graceful shutdown of pi.

- **Interactive mode:** Deferred until the agent becomes idle.
- **RPC mode:** Deferred until the next idle state.
- **Print mode:** No-op.

```typescript
pi.on("tool_call", (event, ctx) => {
  if (isFatal(event.input)) {
    ctx.shutdown();
  }
});
```

### ctx.getContextUsage()

Returns current context usage for the active model.

```typescript
const usage = ctx.getContextUsage();
if (usage && usage.tokens > 100_000) { /* ... */ }
```

### ctx.compact()

Trigger compaction without awaiting completion.

```typescript
ctx.compact({
  customInstructions: "Focus on recent changes",
  onComplete: (result) => { ctx.ui.notify("Compaction completed", "info"); },
  onError: (error) => { ctx.ui.notify(`Compaction failed: ${error.message}`, "error"); },
});
```

### ctx.getSystemPrompt()

Returns Pi's current system prompt string.

- During `before_agent_start`, this reflects chained system-prompt changes so far.
- It does not include later `context` message mutations.
- It does not include `before_provider_request` payload rewrites.

## ExtensionCommandContext

Command handlers receive `ExtensionCommandContext`, which extends `ExtensionContext` with session control methods. These are only available in commands because they can deadlock if called from event handlers.

### ctx.waitForIdle()

Wait for the agent to finish streaming:

```typescript
pi.registerCommand("my-cmd", {
  handler: async (args, ctx) => {
    await ctx.waitForIdle();
    // Agent is now idle, safe to modify session
  },
});
```

### ctx.newSession(options?)

Create a new session:

```typescript
const parentSession = ctx.sessionManager.getSessionFile();
const result = await ctx.newSession({
  parentSession,
  setup: async (sm) => {
    sm.appendMessage({
      role: "user",
      content: [{ type: "text", text: "Context from previous session..." }],
      timestamp: Date.now(),
    });
  },
  withSession: async (ctx) => {
    await ctx.sendUserMessage("Continue in the replacement session");
  },
});
if (result.cancelled) { /* An extension cancelled the new session */ }
```

### ctx.fork(entryId, options?)

Fork from a specific entry:

```typescript
const result = await ctx.fork("entry-id-123", {
  withSession: async (ctx) => {
    ctx.ui.notify("Now in the forked session", "info");
  },
});
const cloneResult = await ctx.fork("entry-id-456", { position: "at" });
```

Options:
- `position`: `"before"` (default) forks before the selected user message; `"at"` duplicates the active path
- `withSession`: run post-switch work against a fresh replacement-session context

### ctx.navigateTree(targetId, options?)

Navigate to a different point in the session tree:

```typescript
const result = await ctx.navigateTree("entry-id-456", {
  summarize: true,
  customInstructions: "Focus on error handling changes",
  replaceInstructions: false,
  label: "review-checkpoint",
});
```

### ctx.switchSession(sessionPath, options?)

Switch to a different session file:

```typescript
const result = await ctx.switchSession("/path/to/session.jsonl", {
  withSession: async (ctx) => {
    await ctx.sendUserMessage("Resume work in the replacement session");
  },
});
```

To discover available sessions:

```typescript
import { SessionManager } from "@mariozechner/pi-coding-agent";

pi.registerCommand("switch", {
  handler: async (args, ctx) => {
    const sessions = await SessionManager.list(ctx.cwd);
    if (sessions.length === 0) return;
    const choice = await ctx.ui.select("Pick session:", sessions.map(s => s.file));
    if (choice) {
      await ctx.switchSession(choice, { withSession: async (ctx) => {
        ctx.ui.notify("Switched session", "info");
      }});
    }
  },
});
```

### Session replacement lifecycle

`withSession` receives a fresh `ReplacedSessionContext`, which extends `ExtensionCommandContext` with async `sendMessage()` and `sendUserMessage()` helpers bound to the replacement session.

**Footguns:**
- `withSession` runs only after the old session has emitted `session_shutdown`, the old runtime has been torn down, the replacement session has been rebound, and the new extension instance has received `session_start`.
- Captured old `pi` / old command `ctx` session-bound objects are stale after replacement and will throw if used.
- Previously extracted raw objects are still your responsibility. Only capture plain data that survives shutdown cleanly.

**Safe pattern:**
```typescript
pi.registerCommand("handoff", {
  handler: async (_args, ctx) => {
    await ctx.newSession({
      withSession: async (ctx) => {
        await ctx.sendUserMessage("Continue from the replacement session");
      },
    });
  },
});
```

### ctx.reload()

Run the same reload flow as `/reload`.

```typescript
pi.registerCommand("reload-runtime", {
  handler: async (_args, ctx) => {
    await ctx.reload();
    return;
  },
});
```

> [!warning]
> `await ctx.reload()` emits `session_shutdown`, then reloads resources and emits `session_start` with `reason: "reload"`. The currently running command handler still continues in the old call frame. Code after `await ctx.reload()` must not assume old in-memory extension state is still valid. For predictable behavior, treat reload as terminal for that handler.

Tools run with `ExtensionContext` and cannot call `ctx.reload()` directly. Use a command as the reload entrypoint, then expose a tool that queues that command as a follow-up user message:

```typescript
export default function (pi: ExtensionAPI) {
  pi.registerCommand("reload-runtime", {
    handler: async (_args, ctx) => {
      await ctx.reload();
      return;
    },
  });

  pi.registerTool({
    name: "reload_runtime",
    label: "Reload Runtime",
    description: "Reload extensions, skills, prompts, and themes",
    parameters: Type.Object({}),
    async execute() {
      pi.sendUserMessage("/reload-runtime", { deliverAs: "followUp" });
      return {
        content: [{ type: "text", text: "Queued /reload-runtime as a follow-up command." }],
      };
    },
  });
}
```

## ExtensionAPI Methods

### pi.on(event, handler)

Subscribe to events. See [Events](#events) for event types and return values.

### pi.registerTool(definition)

Register a custom tool callable by the LLM. Works during extension load, after startup, inside event handlers, and in commands. New tools are refreshed immediately.

```typescript
import { Type } from "typebox";
import { StringEnum } from "@mariozechner/pi-ai";

pi.registerTool({
  name: "my_tool",
  label: "My Tool",
  description: "What this tool does",
  promptSnippet: "Summarize or transform text according to action",
  promptGuidelines: ["Use my_tool when the user asks to summarize previously generated text."],
  parameters: Type.Object({
    action: StringEnum(["list", "add"] as const),
    text: Type.Optional(Type.String()),
  }),
  prepareArguments(args) {
    // Optional compatibility shim. Runs before schema validation.
    return args;
  },
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    onUpdate?.({ content: [{ type: "text", text: "Working..." }] });
    return {
      content: [{ type: "text", text: "Done" }],
      details: { result: "..." },
    };
  },
  renderCall(args, theme, context) { ... },
  renderResult(result, options, theme, context) { ... },
});
```

> [!warning]
> `promptGuidelines` bullets are appended flat to the `Guidelines` section with no tool name prefix. Each guideline must name the tool it refers to — avoid "Use this tool when..." because the LLM cannot tell which tool "this" means.

### pi.sendMessage(message, options?)

Inject a custom message into the session.

```typescript
pi.sendMessage({
  customType: "my-extension",
  content: "Message text",
  display: true,
}, {
  triggerTurn: true,
  deliverAs: "steer",
});
```

| Option | Description |
|--------|-------------|
| `deliverAs: "steer"` (default) | Queues message while streaming, delivered after current turn finishes |
| `deliverAs: "followUp"` | Waits for agent to finish, delivered only when agent has no more tool calls |
| `deliverAs: "nextTurn"` | Queued for next user prompt |
| `triggerTurn: true` | If agent is idle, trigger an LLM response immediately |

### pi.sendUserMessage(content, options?)

Send a user message to the agent. Always triggers a turn.

```typescript
// Simple text
pi.sendUserMessage("What is 2+2?");

// With content array (text + images)
pi.sendUserMessage([
  { type: "text", text: "Describe this image:" },
  { type: "image", source: { type: "base64", mediaType: "image/png", data: "..." } },
]);

// During streaming - must specify delivery mode
pi.sendUserMessage("Focus on error handling", { deliverAs: "steer" });
```

### pi.appendEntry(customType, data?)

Persist extension state (does NOT participate in LLM context).

```typescript
pi.appendEntry("my-state", { count: 42 });

// Restore on reload
pi.on("session_start", async (_event, ctx) => {
  for (const entry of ctx.sessionManager.getEntries()) {
    if (entry.type === "custom" && entry.customType === "my-state") {
      // Reconstruct from entry.data
    }
  }
});
```

### pi.setSessionName(name) / pi.getSessionName()

Set or get the session display name (shown in session selector instead of first message).

### pi.setLabel(entryId, label)

Set or clear a label on an entry. Labels persist in the session and survive restarts.

```typescript
pi.setLabel(entryId, "checkpoint-before-refactor");
pi.setLabel(entryId, undefined);  // Clear
const label = ctx.sessionManager.getLabel(entryId);
```

### pi.registerCommand(name, options)

Register a command. If multiple extensions register the same command name, pi assigns numeric suffixes (e.g., `/review:1` and `/review:2`).

```typescript
pi.registerCommand("stats", {
  description: "Show session statistics",
  handler: async (args, ctx) => {
    const count = ctx.sessionManager.getEntries().length;
    ctx.ui.notify(`${count} entries`, "info");
  },
  getArgumentCompletions: (prefix: string) => {
    const envs = ["dev", "staging", "prod"];
    return envs.filter(e => e.startsWith(prefix)).map(e => ({ value: e, label: e }));
  },
});
```

### pi.getCommands()

Get slash commands available for invocation. Includes extension commands, prompt templates, and skill commands.

```typescript
const commands = pi.getCommands();
const bySource = commands.filter((command) => command.source === "extension");
```

Each entry has:

```typescript
{
  name: string;          // Invokable command name (may be suffixed like "review:1")
  description?: string;
  source: "extension" | "prompt" | "skill";
  sourceInfo: {
    path: string;
    source: string;
    scope: "user" | "project" | "temporary";
    origin: "package" | "top-level";
    baseDir?: string;
  };
}
```

### pi.registerMessageRenderer(customType, renderer)

Register a custom TUI renderer for messages with your `customType`.

```typescript
pi.registerMessageRenderer("my-extension", (message, options, theme) => {
  const { expanded } = options;
  let text = theme.fg("accent", `[${message.customType}] `);
  text += message.content;
  return new Text(text, 0, 0);
});
```

### pi.registerShortcut(shortcut, options)

Register a keyboard shortcut. See [[021-keybindings|Keybindings]] for the shortcut format.

```typescript
pi.registerShortcut("ctrl+shift+p", {
  description: "Toggle plan mode",
  handler: async (ctx) => {
    ctx.ui.notify("Toggled!");
  },
});
```

### pi.registerFlag(name, options)

Register a CLI flag.

```typescript
pi.registerFlag("plan", {
  description: "Start in plan mode",
  type: "boolean",
  default: false,
});
```

### pi.exec(command, args, options?)

Execute a shell command.

```typescript
const result = await pi.exec("git", ["status"], { signal, timeout: 5000 });
// result.stdout, result.stderr, result.code, result.killed
```

### pi.getActiveTools() / pi.getAllTools() / pi.setActiveTools(names)

Manage active tools. Works for both built-in and dynamically registered tools.

```typescript
const active = pi.getActiveTools();
const all = pi.getAllTools();
const builtinTools = all.filter((t) => t.sourceInfo.source === "builtin");
pi.setActiveTools(["read", "bash"]); // Switch to read-only
```

Typical `sourceInfo.source` values: `builtin` for built-in tools, `sdk` for tools passed via `createAgentSession()`, extension metadata for tools registered by extensions.

### pi.setModel(model)

Set the current model. Returns `false` if no API key is available. See [[014-models|Custom Models]].

```typescript
const model = ctx.modelRegistry.find("anthropic", "claude-sonnet-4-5");
if (model) {
  const success = await pi.setModel(model);
}
```

### pi.getThinkingLevel() / pi.setThinkingLevel(level)

Get or set the thinking level. Level is clamped to model capabilities.

```typescript
const current = pi.getThinkingLevel();  // "off" | "minimal" | "low" | "medium" | "high" | "xhigh"
pi.setThinkingLevel("high");
```

### pi.events

Shared event bus for communication between extensions:

```typescript
pi.events.on("my:event", (data) => { ... });
pi.events.emit("my:event", { ... });
```

### pi.registerProvider(name, config)

Register or override a model provider dynamically.

```typescript
pi.registerProvider("my-proxy", {
  baseUrl: "https://proxy.example.com",
  apiKey: "PROXY_API_KEY",
  api: "anthropic-messages",
  models: [{
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet (proxy)",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 200000,
    maxTokens: 16384
  }]
});

// Override baseUrl for existing provider (keeps all models)
pi.registerProvider("anthropic", { baseUrl: "https://proxy.example.com" });
```

| Config option | Description |
|---------------|-------------|
| `baseUrl` | API endpoint URL. Required when defining models. |
| `apiKey` | API key or environment variable name. |
| `api` | API type: `"anthropic-messages"`, `"openai-completions"`, `"openai-responses"`, etc. |
| `headers` | Custom headers to include in requests. |
| `authHeader` | If true, adds `Authorization: Bearer` header automatically. |
| `models` | Array of model definitions. Replaces all existing models if provided. |
| `oauth` | OAuth provider config for `/login` support. |
| `streamSimple` | Custom streaming implementation for non-standard APIs. |

> [!note]
> Calls made during the extension factory function are queued and applied once the runner initializes. Calls made after that take effect immediately without requiring `/reload`. See [[002-custom-provider|Custom Providers]] for advanced topics: custom streaming APIs, OAuth details, model definition reference.

### pi.unregisterProvider(name)

Remove a previously registered provider and its models. Built-in models that were overridden are restored.

```typescript
pi.registerCommand("cleanup", {
  handler: async (_args, _ctx) => {
    pi.unregisterProvider("my-proxy");
  },
});
```

## State Management

Extensions with state should store it in tool result `details` for proper branching support:

```typescript
export default function (pi: ExtensionAPI) {
  let items: string[] = [];

  pi.on("session_start", async (_event, ctx) => {
    items = [];
    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type === "message" && entry.message.role === "toolResult") {
        if (entry.message.toolName === "my_tool") {
          items = entry.message.details?.items ?? [];
        }
      }
    }
  });

  pi.registerTool({
    name: "my_tool",
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      items.push("new item");
      return {
        content: [{ type: "text", text: "Added" }],
        details: { items: [...items] },  // Store for reconstruction
      };
    },
  });
}
```

## Custom Tools

### Tool Definition

```typescript
import { Type } from "typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { Text } from "@mariozechner/pi-tui";

pi.registerTool({
  name: "my_tool",
  label: "My Tool",
  description: "What this tool does (shown to LLM)",
  promptSnippet: "List or add items in the project todo list",
  promptGuidelines: ["Use my_tool for todo planning instead of direct file edits."],
  parameters: Type.Object({
    action: StringEnum(["list", "add"] as const),
    text: Type.Optional(Type.String()),
  }),
  prepareArguments(args) {
    // Optional: mimic older accepted input shape
    if (typeof (args as any).oldAction === "string") {
      return { ...args, action: (args as any).oldAction };
    }
    return args;
  },
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    if (signal?.aborted) {
      return { content: [{ type: "text", text: "Cancelled" }] };
    }
    onUpdate?.({ content: [{ type: "text", text: "Working..." }] });
    const result = await pi.exec("some-command", [], { signal });
    return { content: [{ type: "text", text: "Done" }], details: { data: result } };
  },
});
```

> [!warning]
> Use `StringEnum` from `@mariozechner/pi-ai` for string enums. `Type.Union`/`Type.Literal` doesn't work with Google's API.

> [!warning]
> Some models include `@` prefix in tool path arguments. Built-in tools strip a leading `@` before resolving paths. If your custom tool accepts a path, normalize a leading `@` as well.

**Signaling errors:** Throw an error from `execute()` to mark the tool as failed (sets `isError: true`). Returning a value never sets the error flag.

**Early termination:** Return `terminate: true` to hint that the automatic follow-up LLM call should be skipped after the current tool batch. Only takes effect when every finalized tool result in that batch is terminating.

```typescript
// Correct: throw to signal an error
async execute(toolCallId, params) {
  if (!isValid(params.input)) {
    throw new Error(`Invalid input: ${params.input}`);
  }
  return { content: [{ type: "text", text: "OK" }], details: {} };
}
```

### Overriding Built-in Tools

Extensions can override built-in tools by registering a tool with the same name:

```bash
pi -e ./tool-override.ts  # Extension's read tool replaces built-in read
pi --no-builtin-tools -e ./my-extension.ts  # No built-in tools, only extension tools
```

> [!note]
> Built-in tool implementations: [read.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/read.ts), [bash.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/bash.ts), [edit.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/edit.ts), [write.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/write.ts), [grep.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/grep.ts), [find.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/find.ts), [ls.ts](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/src/core/tools/ls.ts).

### Remote Execution

Built-in tools support pluggable operations for delegating to remote systems:

```typescript
import { createReadTool, createBashTool, type ReadOperations } from "@mariozechner/pi-coding-agent";

const remoteRead = createReadTool(cwd, {
  operations: {
    readFile: (path) => sshExec(remote, `cat ${path}`),
    access: (path) => sshExec(remote, `test -r ${path}`).then(() => {}),
  }
});

pi.registerTool({
  ...remoteRead,
  async execute(id, params, signal, onUpdate, _ctx) {
    const ssh = getSshConfig();
    if (ssh) {
      const tool = createReadTool(cwd, { operations: createRemoteOps(ssh) });
      return tool.execute(id, params, signal, onUpdate);
    }
    return localRead.execute(id, params, signal, onUpdate);
  },
});
```

**Operations interfaces:** `ReadOperations`, `WriteOperations`, `EditOperations`, `BashOperations`, `LsOperations`, `GrepOperations`, `FindOperations`

For `user_bash`, extensions can reuse pi's local shell backend via `createLocalBashOperations()`.

The bash tool also supports a spawn hook:

```typescript
import { createBashTool } from "@mariozechner/pi-coding-agent";

const bashTool = createBashTool(cwd, {
  spawnHook: ({ command, cwd, env }) => ({
    command: `source ~/.profile\n${command}`,
    cwd: `/mnt/sandbox${cwd}`,
    env: { ...env, CI: "1" },
  }),
});
```

### File Mutation Queue

If your custom tool mutates files, use `withFileMutationQueue()` so it participates in the same per-file queue as built-in `edit` and `write`. Without the queue, two tools can read the same old file contents, compute different updates, and whichever write lands last overwrites the other.

```typescript
import { withFileMutationQueue } from "@mariozechner/pi-coding-agent";

async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
  const absolutePath = resolve(ctx.cwd, params.path);
  return withFileMutationQueue(absolutePath, async () => {
    const current = await readFile(absolutePath, "utf8");
    const next = current.replace(params.oldText, params.newText);
    await writeFile(absolutePath, next, "utf8");
    return { content: [{ type: "text", text: `Updated ${params.path}` }], details: {} };
  });
}
```

### Output Truncation

**Tools MUST truncate their output** to avoid overwhelming the LLM context. Built-in limit is **50KB** (~10k tokens) and **2000 lines**, whichever is hit first.

```typescript
import {
  truncateHead, truncateTail, truncateLine, formatSize,
  DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES,
} from "@mariozechner/pi-coding-agent";

const truncation = truncateHead(output, {
  maxLines: DEFAULT_MAX_LINES,
  maxBytes: DEFAULT_MAX_BYTES,
});

if (truncation.truncated) {
  result += `\n\n[Output truncated: ${truncation.outputLines} of ${truncation.totalLines} lines`;
  result += ` (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}).`;
}
```

- Use `truncateHead` for content where the beginning matters (search results, file reads)
- Use `truncateTail` for content where the end matters (logs, command output)

### Custom Rendering

Tools can provide `renderCall` and `renderResult` for custom TUI display. See [[026-tui|TUI Components]] for the full component API.

```typescript
pi.registerTool({
  name: "my_tool",
  renderShell: "self",  // Use when tool should render its own shell
  async execute() {
    return { content: [{ type: "text", text: "ok" }], details: undefined };
  },
  renderCall(args, theme, context) {
    const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
    let content = theme.fg("toolTitle", theme.bold("my_tool "));
    content += theme.fg("muted", args.action);
    text.setText(content);
    return text;
  },
  renderResult(result, { expanded, isPartial }, theme, context) {
    if (isPartial) return new Text(theme.fg("warning", "Processing..."), 0, 0);
    if (result.details?.error) return new Text(theme.fg("error", `Error: ${result.details.error}`), 0, 0);
    return new Text(theme.fg("success", "✓ Done"), 0, 0);
  },
});
```

`context` includes: `args`, `state` (shared row-local state), `lastComponent`, `invalidate()`, `toolCallId`, `cwd`, `executionStarted`, `argsComplete`, `isPartial`, `expanded`, `showImages`, `isError`.

**Keybinding hints:**

```typescript
import { keyHint } from "@mariozechner/pi-coding-agent";

renderResult(result, { expanded }, theme, context) {
  let text = theme.fg("success", "✓ Done");
  if (!expanded) {
    text += ` (${keyHint("app.tools.expand", "to expand")})`;
  }
  return new Text(text, 0, 0);
}
```

Available functions: `keyHint(keybinding, description)`, `keyText(keybinding)`, `rawKeyHint(key, description)`.

> [!note]
> Available keybinding ids use namespaces: `app.*` for coding-agent (e.g., `app.tools.expand`, `app.editor.external`) and `tui.*` for shared TUI (e.g., `tui.select.confirm`, `tui.input.tab`). See [[021-keybindings|Keybindings]] for the exhaustive list.

## Custom UI

### Dialogs

```typescript
const choice = await ctx.ui.select("Pick one:", ["A", "B", "C"]);
const ok = await ctx.ui.confirm("Delete?", "This cannot be undone");
const name = await ctx.ui.input("Name:", "placeholder");
const text = await ctx.ui.editor("Edit:", "prefilled text");
ctx.ui.notify("Done!", "info");  // "info" | "warning" | "error"
```

**Timed dialogs with countdown:**

```typescript
const confirmed = await ctx.ui.confirm(
  "Timed Confirmation",
  "Auto-cancel in 5 seconds?",
  { timeout: 5000 }
);
```

Return values on timeout: `select()` returns `undefined`, `confirm()` returns `false`, `input()` returns `undefined`.

**Manual dismissal with AbortSignal:**

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

const confirmed = await ctx.ui.confirm("Title", "Message", { signal: controller.signal });
clearTimeout(timeoutId);

if (controller.signal.aborted) { /* Dialog timed out */ }
```

### Widgets, Status, and Footer

```typescript
// Status in footer
ctx.ui.setStatus("my-ext", "Processing...");
ctx.ui.setStatus("my-ext", undefined);  // Clear

// Working loader (during streaming)
ctx.ui.setWorkingMessage("Thinking deeply...");
ctx.ui.setWorkingVisible(false);  // Hide

// Working indicator
ctx.ui.setWorkingIndicator({
  frames: [
    ctx.ui.theme.fg("dim", "·"),
    ctx.ui.theme.fg("muted", "•"),
    ctx.ui.theme.fg("accent", "●"),
  ],
  intervalMs: 120,
});
ctx.ui.setWorkingIndicator({ frames: [] });  // Hide

// Widget above/below editor
ctx.ui.setWidget("my-widget", ["Line 1", "Line 2"]);
ctx.ui.setWidget("my-widget", undefined);  // Clear

// Custom footer
ctx.ui.setFooter((tui, theme) => ({
  render(width) { return [theme.fg("dim", "Custom footer")]; },
  invalidate() {},
}));

// Terminal title
ctx.ui.setTitle("pi - my-project");

// Editor text
ctx.ui.setEditorText("Prefill text");
const current = ctx.ui.getEditorText();

// Tools expansion
ctx.ui.setToolsExpanded(true);
```

### Autocomplete Providers

Stack custom autocomplete logic on top of built-in slash-command and path provider:

```typescript
ctx.ui.addAutocompleteProvider((current) => ({
  async getSuggestions(lines, cursorLine, cursorCol, options) {
    const line = lines[cursorLine] ?? "";
    const beforeCursor = line.slice(0, cursorCol);
    const match = beforeCursor.match(/(?:^|[ \t])#([^\s#]*)$/);
    if (!match) {
      return current.getSuggestions(lines, cursorLine, cursorCol, options);
    }
    return {
      prefix: `#${match[1] ?? ""}`,
      items: [{ value: "#2983", label: "#2983", description: "Extension API" }],
    };
  },
  applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
    return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
  },
}));
```

### Custom Components

For complex UI, use `ctx.ui.custom()`. This temporarily replaces the editor with your component until `done()` is called:

```typescript
import { Text, Component } from "@mariozechner/pi-tui";

const result = await ctx.ui.custom<boolean>((tui, theme, keybindings, done) => {
  const text = new Text("Press Enter to confirm, Escape to cancel", 1, 1);
  text.onKey = (key) => {
    if (key === "return") done(true);
    if (key === "escape") done(false);
    return true;
  };
  return text;
});
```

**Overlay mode (experimental):** Pass `{ overlay: true }` to render as a floating modal:

```typescript
const result = await ctx.ui.custom<string | null>(
  (tui, theme, keybindings, done) => new MyOverlayComponent({ onClose: done }),
  { overlay: true, overlayOptions: { anchor: "top-right", width: "50%", margin: 2 } }
);
```

### Custom Editor

Replace the main input editor with a custom implementation:

```typescript
import { CustomEditor } from "@mariozechner/pi-coding-agent";

class VimEditor extends CustomEditor {
  private mode: "normal" | "insert" = "insert";
  handleInput(data: string): void {
    if (matchesKey(data, "escape") && this.mode === "insert") {
      this.mode = "normal";
      return;
    }
    if (this.mode === "normal" && data === "i") {
      this.mode = "insert";
      return;
    }
    super.handleInput(data);
  }
}

pi.on("session_start", (_event, ctx) => {
  ctx.ui.setEditorComponent((_tui, theme, keybindings) =>
    new VimEditor(theme, keybindings)
  );
});
```

> [!tip]
> Extend `CustomEditor` (not base `Editor`) to get app keybindings (escape to abort, ctrl+d, model switching).

### Theme Colors

```typescript
theme.fg("toolTitle", text)   // Tool names
theme.fg("accent", text)      // Highlights
theme.fg("success", text)     // Success (green)
theme.fg("error", text)       // Errors (red)
theme.fg("warning", text)     // Warnings (yellow)
theme.fg("muted", text)       // Secondary text
theme.fg("dim", text)         // Tertiary text
theme.bold(text)
theme.italic(text)
theme.strikethrough(text)
```

For syntax highlighting:

```typescript
import { highlightCode, getLanguageFromPath } from "@mariozechner/pi-coding-agent";

const highlighted = highlightCode("const x = 1;", "typescript", theme);
const lang = getLanguageFromPath("/path/to/file.rs");  // "rust"
```

See [[009-themes|Themes]] for creating custom themes.

## Error Handling

| Situation | Behavior |
|-----------|----------|
| Extension errors | Logged, agent continues |
| `tool_call` errors | Block the tool (fail-safe) |
| Tool `execute` errors | Throw to signal; caught, reported to LLM with `isError: true`, execution continues |

## Mode Behavior

| Mode | UI Methods | Notes |
|------|-----------|-------|
| Interactive | Full TUI | Normal operation |
| RPC (`--mode rpc`) | JSON protocol | Host handles UI, see [[023-rpc|RPC Mode]] |
| JSON (`--mode json`) | No-op | Event stream to stdout, see [[020-json|JSON Event Stream Mode]] |
| Print (`-p`) | No-op | Extensions run but can't prompt |

In non-interactive modes, check `ctx.hasUI` before using UI methods.

## Examples Reference

See `examples/extensions/` for working implementations.

| Example | Description | Key APIs |
|---------|-------------|----------|
| **Tools** |||
| `hello.ts` | Minimal tool registration | `registerTool` |
| `question.ts` | Tool with user interaction | `registerTool`, `ui.select` |
| `questionnaire.ts` | Multi-step wizard tool | `registerTool`, `ui.custom` |
| `todo.ts` | Stateful tool with persistence | `registerTool`, `appendEntry`, session events |
| `dynamic-tools.ts` | Register tools after startup | `registerTool`, `session_start` |
| `structured-output.ts` | Final structured-output tool with `terminate: true` | `registerTool` |
| `truncated-tool.ts` | Output truncation | `registerTool`, `truncateHead` |
| `tool-override.ts` | Override built-in read tool | `registerTool` (same name) |
| **Commands** |||
| `pirate.ts` | Modify system prompt per-turn | `registerCommand`, `before_agent_start` |
| `summarize.ts` | Conversation summary command | `registerCommand`, `ui.custom` |
| `handoff.ts` | Cross-provider model handoff | `registerCommand`, `ui.editor` |
| `qna.ts` | Q&A with custom UI | `registerCommand`, `ui.custom` |
| `send-user-message.ts` | Inject user messages | `registerCommand`, `sendUserMessage` |
| `reload-runtime.ts` | Reload command and tool handoff | `registerCommand`, `ctx.reload()` |
| `shutdown-command.ts` | Graceful shutdown | `registerCommand`, `shutdown()` |
| **Events & Gates** |||
| `permission-gate.ts` | Block dangerous commands | `on("tool_call")`, `ui.confirm` |
| `protected-paths.ts` | Block writes to specific paths | `on("tool_call")` |
| `confirm-destructive.ts` | Confirm session changes | `on("session_before_*")` |
| `dirty-repo-guard.ts` | Warn on dirty git repo | `on("session_before_*")` |
| `input-transform.ts` | Transform user input | `on("input")` |
| `model-status.ts` | React to model changes | `on("model_select")` |
| `provider-payload.ts` | Inspect payloads | `on("before_provider_request")` |
| `system-prompt-header.ts` | Display system prompt info | `on("agent_start")` |
| `claude-rules.ts` | Load rules from files | `on("session_start")` |
| `prompt-customizer.ts` | Context-aware tool guidance | `on("before_agent_start")` |
| `file-trigger.ts` | File watcher triggers messages | `sendMessage` |
| **Compaction & Sessions** |||
| `custom-compaction.ts` | Custom compaction summary | `on("session_before_compact")` |
| `trigger-compact.ts` | Trigger compaction manually | `compact()` |
| `git-checkpoint.ts` | Git stash on turns | `on("turn_start")` |
| `auto-commit-on-exit.ts` | Commit on shutdown | `on("session_shutdown")` |
| **UI Components** |||
| `status-line.ts` | Footer status indicator | `setStatus` |
| `working-indicator.ts` | Customize streaming indicator | `setWorkingIndicator` |
| `github-issue-autocomplete.ts` | `#1234` issue completions | `addAutocompleteProvider` |
| `custom-footer.ts` | Replace footer entirely | `setFooter` |
| `modal-editor.ts` | Vim-style modal editor | `setEditorComponent`, `CustomEditor` |
| `widget-placement.ts` | Widget above/below editor | `setWidget` |
| `overlay-test.ts` | Overlay components | `ui.custom` with overlay |
| `timed-confirm.ts` | Dialogs with timeout | `ui.confirm` with timeout |
| **Remote & Sandbox** |||
| `ssh.ts` | SSH remote execution | `on("user_bash")`, tool operations |
| `sandbox/` | Sandboxed tool execution | Tool operations |
| `subagent/` | Spawn sub-agents | `registerTool`, `exec` |
| **Games** |||
| `snake.ts` | Snake game | `registerCommand`, `ui.custom` |
| `space-invaders.ts` | Space Invaders game | `registerCommand`, `ui.custom` |
| `doom-overlay/` | Doom in overlay | `ui.custom` with overlay |
| **Providers** |||
| `custom-provider-anthropic/` | Custom Anthropic proxy | `registerProvider` |
| `custom-provider-gitlab-duo/` | GitLab Duo integration | `registerProvider` with OAuth |
| **Session Metadata** |||
| `session-name.ts` | Name sessions | `setSessionName` |
| `bookmark.ts` | Bookmark entries | `setLabel` |
| **Misc** |||
| `inline-bash.ts` | Inline bash in tool calls | `on("tool_call")` |
| `bash-spawn-hook.ts` | Adjust bash command before execution | `createBashTool` |
| `with-deps/` | Extension with npm dependencies | Package structure |

#typescript #automation #extensibility #agent-development
