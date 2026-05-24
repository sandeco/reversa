# Translation Loop: Reversa Repository → English

## Goal
Translate all remaining ~110 files in the repository from Portuguese to English, one file per iteration.

## Workflow (one file per iteration)

In each iteration, follow these EXACT steps:

### Step 1: Read the task list
Read `.ralph/task-list.md` to find the next unchecked file. Pick the **first file with an unchecked checkbox `[ ]`**. If there are no unchecked files, output `ALL COMPLETE` and stop.

### Step 2: Read the subagent prompt template
Read `.ralph/subagent-prompt.md` to get the translation instructions template.

### Step 3: Spawn a subagent for translation
Spawn a subagent with this prompt (replace `{{FILE_PATH}}` with the actual file path):

```
Translate the file at `{{FILE_PATH}}` to English.

Rules:
1. Preserve structure: Keep YAML frontmatter, code blocks, file paths, headings, formatting exactly as they are.
2. Translate all human-readable text to clear, professional English.
3. Keep technical terms: Framework names, tool names, proper nouns (Three.js, D3.js, Highcharts, N8N, Claude Code, Cursor, etc.) stay in original form.
4. Keep agent/command names unchanged.
5. For SKILL.md files: Keep the `name` field in YAML frontmatter as-is. Only translate `description` and body text.
6. For shell scripts: Translate only comments, not commands or variables.
7. For engine config files: Translate only comments, not configuration keys or values.
8. Write the translated content back to the same file.
9. Make a git commit with message: `translate: <relative-file-path>`
10. When done, output the word `DONE` on its own line.
```

### Step 4: Wait for subagent completion
Wait for the subagent to finish. Verify the file was translated (check that Portuguese content is gone) and that a git commit was made.

### Step 5: Update task list
Mark the file as completed in `.ralph/task-list.md` by changing `[ ]` to `[x]`. Update the "Current Phase" and "Overall" progress counters at the top.

### Step 6: Commit task list update
Make a git commit with message: `docs: update task list — mark {{FILE_PATH}} as done`

### Step 7: Advance iteration
Call `ralph_done` to advance to the next iteration.

## Important Notes
- Process exactly ONE file per iteration. Do not try to process multiple files.
- Always verify the subagent actually translated the file and committed.
- If a file has no Portuguese content, mark it as done anyway (it may already be English).
- For Phase 4 (Cleanup & Renaming), this is a decision-making phase — skip it for now and note it as pending.