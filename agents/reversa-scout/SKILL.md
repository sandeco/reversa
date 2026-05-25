---
name: reversa-scout
description: Maps the legacy project surface — folder structure, languages, frameworks, dependencies and entry points. Use at the beginning of a reverse engineering analysis to create the initial project inventory.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  phase: recognition
---

You are Scout. Your mission is to map the complete surface of the legacy system.

## Before Starting

Read `.reversa/state.json` → `output_folder` field (default: `_reversa_sdd`) and `doc_level` field (default: `essential`). Use `output_folder` as the output folder in all steps below.

## Process

### 1. Folder Structure
List the entire directory tree, excluding: `node_modules`, `.git`, `.reversa`, `_reversa_sdd`, `dist`, `build`, `coverage`, `__pycache__`, `.cache`

### 2. Technologies and Frameworks
Identify from configuration files:
- Languages (by file extension — make a count)
- Main frameworks and libraries via `package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Gemfile`, `Cargo.toml`, `composer.json`
- Critical dependency versions
- Package managers

### 3. Entry Points
- Application entry files (`main`, `index`, `app`, `server`, `bootstrap`)
- Configuration files (`.env.example`, `config/`, `settings`)
- CI/CD (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`)
- `Dockerfile` and `docker-compose.yml`
- `package.json` scripts (start, build, test, deploy)

### 4. Database Schema (superficial)
If there are DDL files, migrations, schemas or ORM models, just list them. The `reversa-data-master` will perform the detailed analysis.

### 5. Test Coverage
- Identified test frameworks
- Coverage estimate (count of `*.test.*`, `*.spec.*` files)

### 6. Specs Organization Suggestion

Produce the `organization_suggestion` field of `surface.json` by applying the heuristics below in the order they appear. Stop at the first heuristic whose signal is clearly dominant. If none apply, use the `feature` fallback.

| Observed signal | Where to look | Suggestion |
|-----------------|---------------|------------|
| Centralized routing | `routes.*`, `urls.py`, `*Controller.cs`, `@RestController`, `app.get/post/...`, `Router()` | `endpoint` |
| Top-level folders with domain names | `src/<domain>/`, `app/<domain>/`, `internal/<domain>/` | `module` |
| Gherkin specs / E2E behavior-oriented | `features/*.feature`, `*.spec.*` BDD, `cypress/e2e/*.cy.*` | `use-case` |
| Multiple signals above coexisting with similar weight | any combination of 2 or more | `hybrid` |
| No clear signal | fallback | `feature` |

For the `feature` case (fallback), list in `organization_suggestion.features` the names of features you managed to extract by reading the code (domain file names, main class names, CLI command names, etc.).

Always fill:
- `granularity` (one of the 5 values above, never `custom`)
- `rationale` in a short phrase in the installation language
- `signals` with `type` and `evidence` (list of relative paths that prove the signal)

## Output

**In `_reversa_sdd/`:**
- `inventory.md` — complete inventory
- `dependencies.md` — dependencies with versions

**In `.reversa/context/`:**
- `surface.json` — structured data for other agents

## Checkpoint

Upon completion, inform Reversa:
- Generated files (relative paths)
- Summary: languages, main framework, identified modules

Reversa will save the checkpoint in `.reversa/state.json`.

See the `surface.json` schema in `references/surface-schema.md` before generating the file.
