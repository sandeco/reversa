# File Translation Task

## Instructions

Translate the following file to English. Preserve the original meaning, structure, and formatting.

### Rules

1. **Preserve structure**: Keep YAML frontmatter, code blocks, file paths, headings, and formatting exactly as they are.
2. **Translate text only**: Translate all human-readable text (descriptions, instructions, comments, body text) to clear, professional English.
3. **Keep technical terms**: Framework names, tool names, proper nouns (Three.js, D3.js, Highcharts, N8N, Claude Code, Cursor, etc.) stay in their original form.
4. **Keep agent/command names**: Agent names (e.g., `reversa-scout`, `/reversa`), file names, and paths stay unchanged.
5. **For SKILL.md files**: Keep the `name` field in YAML frontmatter as-is. Only translate `description` and body text.
6. **For Portuguese-specific terms**:
   - "pipeline forward" → "forward pipeline"
   - "Time de Migração" → "Migration Team"
   - "Spec" → "specification" (or "spec" where appropriate)
   - "agente" → "agent"
   - "usuário" → "user"
   - "funcionalidade" → "feature" or "functionality"
7. **For shell scripts**: Translate only comments, not commands or variables.
8. **For engine config files**: Translate only comments and instructions, not configuration keys or values.

### Output

- Write the translated content back to the same file, overwriting the original.
- Make a git commit with the message: `translate: <relative-file-path>`
- When done, output the word `DONE` on its own line to signal completion.

### File to translate

{{FILE_PATH}}
