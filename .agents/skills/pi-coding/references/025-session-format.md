---
title: Session format
url: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/session-format.md
source: git
fetched_at: 2026-04-29T12:03:03.532661679-03:00
rendered_js: false
optimized: true
optimized_at: 2026-04-29T15:30:00Z
tags:
    - jsonl
    - file-format
    - data-schema
    - coding-agent
    - session-management
    - message-types
category: reference
word_count: 926
---
# Session File Format

Sessions are stored as JSONL (JSON Lines) files. Each line is a JSON object with a `type` field. Session entries form a tree structure via `id`/`parentId` fields, enabling in-place branching without creating new files.

## File Location

```
~/.pi/agent/sessions/--<path>--/<timestamp>_<uuid>.jsonl
```

Where `<path>` is the working directory with `/` replaced by `-`.

## Deleting Sessions

Delete `.jsonl` files under `~/.pi/agent/sessions/`, or use `/resume` → select session → `Ctrl+D` → confirm. Pi uses the `trash` CLI to avoid permanent deletion.

## Session Version

Sessions auto-migrate to the current version (v3) on load.

| Version | Description |
|---------|-------------|
| v1 | Linear entry sequence (legacy) |
| v2 | Tree structure with `id`/`parentId` linking |
| v3 | Renamed `hookMessage` role to `custom` (extensions unification) |

## Source Files

For TypeScript definitions, inspect `node_modules/@mariozechner/pi-coding-agent/dist/` and `node_modules/@mariozechner/pi-ai/dist/`.

| File | Purpose |
|------|---------|
| `session-manager.ts` | Session entry types and SessionManager |
| `messages.ts` | Extended message types (BashExecutionMessage, CustomMessage, etc.) |
| `packages/ai/src/types.ts` | Base message types (UserMessage, AssistantMessage, ToolResultMessage) |
| `packages/agent/src/types.ts` | AgentMessage union type |

## Message Types

### Content Blocks

```typescript
interface TextContent {
  type: "text";
  text: string;
}

interface ImageContent {
  type: "image";
  data: string;      // base64 encoded
  mimeType: string;  // e.g., "image/jpeg", "image/png"
}

interface ThinkingContent {
  type: "thinking";
  thinking: string;
}

interface ToolCall {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, any>;
}
```

### Base Message Types (from pi-ai)

```typescript
interface UserMessage {
  role: "user";
  content: string | (TextContent | ImageContent)[];
  timestamp: number;  // Unix ms
}

interface AssistantMessage {
  role: "assistant";
  content: (TextContent | ThinkingContent | ToolCall)[];
  api: string;
  provider: string;
  model: string;
  usage: Usage;
  stopReason: "stop" | "length" | "toolUse" | "error" | "aborted";
  errorMessage?: string;
  timestamp: number;
}

interface ToolResultMessage {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: (TextContent | ImageContent)[];
  details?: any;      // Tool-specific metadata
  isError: boolean;
  timestamp: number;
}

interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}
```

### Extended Message Types (from pi-coding-agent)

```typescript
interface BashExecutionMessage {
  role: "bashExecution";
  command: string;
  output: string;
  exitCode: number | undefined;
  cancelled: boolean;
  truncated: boolean;
  fullOutputPath?: string;
  excludeFromContext?: boolean;  // true for !! prefix commands
  timestamp: number;
}

interface CustomMessage {
  role: "custom";
  customType: string;            // Extension identifier
  content: string | (TextContent | ImageContent)[];
  display: boolean;              // Show in TUI
  details?: any;                 // Extension-specific metadata
  timestamp: number;
}

interface BranchSummaryMessage {
  role: "branchSummary";
  summary: string;
  fromId: string;                // Entry we branched from
  timestamp: number;
}

interface CompactionSummaryMessage {
  role: "compactionSummary";
  summary: string;
  tokensBefore: number;
  timestamp: number;
}
```

### AgentMessage Union

```typescript
type AgentMessage =
  | UserMessage
  | AssistantMessage
  | ToolResultMessage
  | BashExecutionMessage
  | CustomMessage
  | BranchSummaryMessage
  | CompactionSummaryMessage;
```

## Entry Base

All entries (except `SessionHeader`) extend `SessionEntryBase`:

```typescript
interface SessionEntryBase {
  type: string;
  id: string;           // 8-char hex ID
  parentId: string | null;  // Parent entry ID (null for first entry)
  timestamp: string;    // ISO timestamp
}
```

## Entry Types

### SessionHeader

First line of the file. Metadata only, not part of the tree (no `id`/`parentId`).

```json
{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project"}
```

For sessions with a parent (created via `/fork`, `/clone`, or `newSession({ parentSession })`):

```json
{"type":"session","version":3,"id":"uuid","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/path/to/project","parentSession":"/path/to/original/session.jsonl"}
```

### SessionMessageEntry

```json
{"type":"message","id":"a1b2c3d4","parentId":"prev1234","timestamp":"2024-12-03T14:00:01.000Z","message":{"role":"user","content":"Hello"}}
{"type":"message","id":"b2c3d4e5","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:00:02.000Z","message":{"role":"assistant","content":[{"type":"text","text":"Hi!"}],"provider":"anthropic","model":"claude-sonnet-4-5","usage":{...},"stopReason":"stop"}}
{"type":"message","id":"c3d4e5f6","parentId":"b2c3d4e5","timestamp":"2024-12-03T14:00:03.000Z","message":{"role":"toolResult","toolCallId":"call_123","toolName":"bash","content":[{"type":"text","text":"output"}],"isError":false}}
```

### ModelChangeEntry

Emitted when the user switches models mid-session.

```json
{"type":"model_change","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:05:00.000Z","provider":"openai","modelId":"gpt-4o"}
```

### ThinkingLevelChangeEntry

```json
{"type":"thinking_level_change","id":"e5f6g7h8","parentId":"d4e5f6g7","timestamp":"2024-12-03T14:06:00.000Z","thinkingLevel":"high"}
```

### CompactionEntry

```json
{"type":"compaction","id":"f6g7h8i9","parentId":"e5f6g7h8","timestamp":"2024-12-03T14:10:00.000Z","summary":"User discussed X, Y, Z...","firstKeptEntryId":"c3d4e5f6","tokensBefore":50000}
```

- `details`: Implementation-specific data (e.g., `{ readFiles: string[], modifiedFiles: string[] }`)
- `fromHook`: `true` if generated by an extension

### BranchSummaryEntry

Captures context from an abandoned branch path.

```json
{"type":"branch_summary","id":"g7h8i9j0","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:15:00.000Z","fromId":"f6g7h8i9","summary":"Branch explored approach A..."}
```

- `details`: File tracking data
- `fromHook`: `true` if generated by an extension

### CustomEntry

Extension state persistence. Does NOT participate in LLM context.

```json
{"type":"custom","id":"h8i9j0k1","parentId":"g7h8i9j0","timestamp":"2024-12-03T14:20:00.000Z","customType":"my-extension","data":{"count":42}}
```

Use `customType` to identify your extension's entries on reload.

### CustomMessageEntry

Extension-injected messages that DO participate in LLM context.

```json
{"type":"custom_message","id":"i9j0k1l2","parentId":"h8i9j0k1","timestamp":"2024-12-03T14:25:00.000Z","customType":"my-extension","content":"Injected context...","display":true}
```

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string \| (TextContent \| ImageContent)[]` | Same as UserMessage |
| `display` | `boolean` | `true` = show in TUI, `false` = hidden |
| `details` | `any` | Optional extension-specific metadata |

### LabelEntry

User-defined bookmark/marker on an entry.

```json
{"type":"label","id":"j0k1l2m3","parentId":"i9j0k1l2","timestamp":"2024-12-03T14:30:00.000Z","targetId":"a1b2c3d4","label":"checkpoint-1"}
```

Set `label` to `undefined` to clear a label.

### SessionInfoEntry

Session metadata (e.g., user-defined display name). Set via `/name` command or `pi.setSessionName()`.

```json
{"type":"session_info","id":"k1l2m3n4","parentId":"j0k1l2m3","timestamp":"2024-12-03T14:35:00.000Z","name":"Refactor auth module"}
```

The session name is displayed in the session selector (`/resume`) instead of the first message when set.

## Tree Structure

Entries form a tree:
- First entry has `parentId: null`
- Each subsequent entry points to its parent via `parentId`
- Branching creates new children from an earlier entry
- The "leaf" is the current position in the tree

```
[user msg] ─── [assistant] ─── [user msg] ─── [assistant] ─┬─ [user msg] ← current leaf
                                                            │
                                                            └─ [branch_summary] ─── [user msg] ← alternate branch
```

## Context Building

`buildSessionContext()` walks from the current leaf to the root, producing the message list for the LLM:

1. Collects all entries on the path
2. Extracts current model and thinking level settings
3. If a `CompactionEntry` is on the path:
   - Emits the summary first
   - Then messages from `firstKeptEntryId` to compaction
   - Then messages after compaction
4. Converts `BranchSummaryEntry` and `CustomMessageEntry` to appropriate message formats

## Parsing Example

```typescript
import { readFileSync } from "fs";

const lines = readFileSync("session.jsonl", "utf8").trim().split("\n");

for (const line of lines) {
  const entry = JSON.parse(line);

  switch (entry.type) {
    case "session":
      console.log(`Session v${entry.version ?? 1}: ${entry.id}`);
      break;
    case "message":
      console.log(`[${entry.id}] ${entry.message.role}: ${JSON.stringify(entry.message.content)}`);
      break;
    case "compaction":
      console.log(`[${entry.id}] Compaction: ${entry.tokensBefore} tokens summarized`);
      break;
    case "branch_summary":
      console.log(`[${entry.id}] Branch from ${entry.fromId}`);
      break;
    case "custom":
      console.log(`[${entry.id}] Custom (${entry.customType}): ${JSON.stringify(entry.data)}`);
      break;
    case "custom_message":
      console.log(`[${entry.id}] Extension message (${entry.customType}): ${entry.content}`);
      break;
    case "label":
      console.log(`[${entry.id}] Label "${entry.label}" on ${entry.targetId}`);
      break;
    case "model_change":
      console.log(`[${entry.id}] Model: ${entry.provider}/${entry.modelId}`);
      break;
    case "thinking_level_change":
      console.log(`[${entry.id}] Thinking: ${entry.thinkingLevel}`);
      break;
  }
}
```

## SessionManager API

### Static Creation Methods

| Method | Description |
|--------|-------------|
| `create(cwd, sessionDir?)` | New session |
| `open(path, sessionDir?)` | Open existing session file |
| `continueRecent(cwd, sessionDir?)` | Continue most recent or create new |
| `inMemory(cwd?)` | No file persistence |
| `forkFrom(sourcePath, targetCwd, sessionDir?)` | Fork session from another project |

### Static Listing Methods

| Method | Description |
|--------|-------------|
| `list(cwd, sessionDir?, onProgress?)` | List sessions for a directory |
| `listAll(onProgress?)` | List all sessions across all projects |

### Instance Methods - Session Management

| Method | Description |
|--------|-------------|
| `newSession(options?)` | Start a new session (`{ parentSession?: string }`) |
| `setSessionFile(path)` | Switch to a different session file |
| `createBranchedSession(leafId)` | Extract branch to new session file |

### Instance Methods - Appending

All return entry ID.

| Method | Description |
|--------|-------------|
| `appendMessage(message)` | Add message |
| `appendThinkingLevelChange(level)` | Record thinking change |
| `appendModelChange(provider, modelId)` | Record model change |
| `appendCompaction(summary, firstKeptEntryId, tokensBefore, details?, fromHook?)` | Add compaction |
| `appendCustomEntry(customType, data?)` | Extension state (not in context) |
| `appendSessionInfo(name)` | Set session display name |
| `appendCustomMessageEntry(customType, content, display, details?)` | Extension message (in context) |
| `appendLabelChange(targetId, label)` | Set/clear label |

### Instance Methods - Tree Navigation

| Method | Description |
|--------|-------------|
| `getLeafId()` | Current position |
| `getLeafEntry()` | Get current leaf entry |
| `getEntry(id)` | Get entry by ID |
| `getBranch(fromId?)` | Walk from entry to root |
| `getTree()` | Get full tree structure |
| `getChildren(parentId)` | Get direct children |
| `getLabel(id)` | Get label for entry |
| `branch(entryId)` | Move leaf to earlier entry |
| `resetLeaf()` | Reset leaf to null |
| `branchWithSummary(entryId, summary, details?, fromHook?)` | Branch with context summary |

### Instance Methods - Context & Info

| Method | Description |
|--------|-------------|
| `buildSessionContext()` | Get messages, thinkingLevel, and model for LLM |
| `getEntries()` | All entries (excluding header) |
| `getHeader()` | Session header metadata |
| `getSessionName()` | Get display name from latest session_info entry |
| `getCwd()` | Working directory |
| `getSessionDir()` | Session storage directory |
| `getSessionId()` | Session UUID |
| `getSessionFile()` | Session file path (undefined for in-memory) |
| `isPersisted()` | Whether session is saved to disk |