# Translation Project: Reversa Repository → English

## Goal
Translate all ~130+ non-English files in the repository to English. Files are organized in TRANSLATION_PLAN.md with checkboxes.

## Rules
1. **One subagent at a time** - Use a subagent for each individual file translation. Do NOT run more than one subagent in parallel.
2. **Update TRANSLATION_PLAN.md** - After translating each file, check off its checkbox in TRANSLATION_PLAN.md.
3. **Commit per subgroup** - After completing each phase/subgroup (e.g., all core agents), make a git commit.
4. **Preserve YAML frontmatter** - For SKILL.md files, keep `name` fields as-is, only translate `description` and body text.
5. **Keep technical terms** - Framework names, tool names, proper nouns stay in original form (Three.js, D3.js, Highcharts, N8N, Claude Code, etc.).
6. **Don't stop** - Continue until ALL files are translated. The loop ends when all checkboxes in TRANSLATION_PLAN.md are checked.

## Translation Strategy per File
- Read the file
- Identify Portuguese/Spanish content
- Translate to clear, professional English
- Preserve code blocks, file paths, and technical references
- Write back the translated content

## Current Task Order (by todo dependencies)
1. Phase 1.1 (remaining): Core agents — reversa-reconstructor (3 files)
2. Phase 1.2: Forward cycle agents (11 files)
3. Phase 1.3: Migration team agents (14 files)
4. Phase 1.4: New project agents (9 files)
5. Phase 1.5: Visualization & specialist agents (19 files)
6. Phase 1.6: Pricing agents (6 files)
7. Phase 1.7: Docs team agents (10 files)
8. Phase 2.1: Forward templates (8 files)
9. Phase 2.2: Migration templates (21 files)
10. Phase 2.3: Engine config files (5 files)
11. Phase 2.4: Documentation templates (9 files)
12. Phase 3: Configuration & Metadata (5 files)
13. Phase 4: Cleanup & Renaming

## File List for Current Phase (Phase 1.1 remaining: Core agents — reversa-reconstructor)
- `agents/reversa-reconstructor/SKILL.md`
- `agents/reversa-reconstructor/references/reconstruction-plan-template.md`
- `agents/reversa-reconstructor/references/reconstruction-plan-migration-template.md`