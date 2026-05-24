# [Unit Name]

> Template for the `requirements.md` file. Focuses on WHAT the unit does, not how.

## Overview
[What it is, what problem it solves, 2 to 3 lines]

## Responsibilities
- [Responsibility 1]
- [Responsibility 2]

## Business Rules
- [Rule 1] 🟢
- [Rule 2] 🟡
- [Unknown behavior] 🔴

## Functional Requirements

| ID | Requirement | Priority | Acceptance Criterion |
|----|-------------|----------|---------------------|
| FR-01 | [Description] | Must | [How to validate] |
| FR-02 | [Description] | Should | [How to validate] |

## Non-Functional Requirements

| Type | Inferred Requirement | Code Evidence | Confidence |
|------|---------------------|---------------|------------|
| Performance | [e.g., 30s timeout on external calls] | `path/file.ext:line` | 🟢 |
| Security | [e.g., mandatory authentication on route] | `path/file.ext:line` | 🟡 |
| Scalability | [e.g., Redis cache usage] | `path/file.ext:line` | 🟢 |
| Availability | [e.g., automatic retry on failure] | `path/file.ext:line` | 🟡 |

> Inferred from code. Validate with operations team.

## Acceptance Criteria

```gherkin
Given [precondition]
When [action]
Then [expected result]

Given [error condition]
When [invalid action]
Then [expected failure behavior]
```

## Priority (MoSCoW)

| Requirement | MoSCoW | Justification |
|-------------|--------|---------------|
| [Main responsibility] | Must | Critical path, called in every flow |
| [Central business rule] | Must | Business rule without fallback |
| [Secondary feature] | Should | Important but with alternative |
| [Edge case] | Could | Rarely triggered |

> Priority inferred by call frequency and position in the dependency chain.

## Code Traceability

| File | Function / Class | Coverage |
|------|-----------------|----------|
| `path/file.ext` | `ClassName` | 🟢 |
