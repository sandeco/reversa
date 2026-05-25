# [Unit Name], Implementation Tasks

> Template for the `tasks.md` file. Focuses on a sequence of executable tasks to reimplement the unit from the legacy, with traceability to the original code.

## Prerequisites
- [ ] Unit dependencies listed in `design.md` are available
- [ ] Database schema/migrations compatible (if applicable)
- [ ] Required environment variables / configs documented

## Tasks

> Each task references the legacy file from which the behavior was extracted.

- [ ] T-01, [Task description]
  - Legacy source: `path/file.ext:line`
  - Definition of done: [how to validate]
  - Confidence: 🟢 / 🟡 / 🔴

- [ ] T-02, [Task description]
  - Legacy source: `path/file.ext:line`
  - Definition of done: [how to validate]
  - Confidence: 🟢 / 🟡 / 🔴

## Test Tasks

- [ ] TT-01, Happy path test for main flow (see `requirements.md`, Acceptance Criteria)
- [ ] TT-02, Main error case test
- [ ] TT-03, [Other relevant scenarios]

## Data Migration Tasks (if applicable)

- [ ] TM-01, [Data migration X, with reference to legacy schema]

## Suggested Order
1. [Which tasks should be done first and why]
2. [Dependencies between tasks]

## Pending Gaps (🔴)
[List here the decisions that depend on human validation before implementation]
