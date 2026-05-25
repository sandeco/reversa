# Data extraction policy (Mapper)

Defines when to invoke extraction scripts versus reuse cache in `.reversa/documentation/assets/data/`.

## Cache hit (reuse)

Use the existing JSON when **all** conditions are true:

1. The file exists in `.reversa/documentation/assets/data/<name>.json`.
2. JSON `mtime` is greater than the maximum `mtime` among all relevant source files:
   - For `modules.json`: highest `mtime` inside source code (excluding `.reversa/`, `_reversa_sdd/`, `node_modules/`, `.git/`).
   - For `deps.json`: highest `mtime` of source code AND `modules.json`.
3. JSON `schemaVersion` is compatible with the current version (1).

## Cache miss (regenerate)

In any other case, invoke the corresponding Python script:

```bash
python templates/documentation/scripts/extract_modules.py \
    --root . \
    --out .reversa/documentation/assets/data/modules.json

python templates/documentation/scripts/extract_deps.py \
    --modules .reversa/documentation/assets/data/modules.json \
    --out .reversa/documentation/assets/data/deps.json
```

## Python unavailable

Perform inline extraction in the AI engine:

1. Use Glob to list files by extension (`*.py`, `*.js`, `*.ts`, `*.go`, `*.java`).
2. Use Read to count non-empty lines of each file.
3. Build a structure identical to the `modules.json` schema (see `specs/reversa-docs/design.md`).
4. For `deps.json`, if there is no AST parser, start with `nodes` populated and `edges: []`. Mark in `.config.json.pagesPlanned` that dependencies were not extracted.

## Force regeneration

If the user passes `--force-extract` to `/reversa-docs-mapper`, ignore the cache and regenerate. Back up the previous JSON to `.backup-<timestamp>/assets/data/`.

## When Analyst runs in isolation

If `Analyst` runs before Mapper or in isolated mode and does not find `modules.json`/`deps.json`, it must invoke the **same scripts** following this same policy. The result is shared: a later Mapper will use the cache.
