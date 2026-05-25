# Spec Template — Practical RFC

> Usage instructions: replace all text within `[brackets]` with real content.
> Remove the italicized instructions when finished.
> Mark open items with `⚠️ OPEN:` so you don't forget to resolve them.

---

# Spec: [Feature Name]

**Version:** 1.0
**Status:** Draft | In Review | Approved | Implemented
**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Reviewers:** [Names or "N/A"]

---

## 1. Summary

> *1–3 sentences. What is this feature and why does it exist? Reading this should make the objective clear.*

[Concise description of the feature and its purpose.]

---

## 2. Context and Motivation

> *Why are we building this now? What problem or opportunity motivated the decision?*

**Problem:**
[Describe the problem that exists today. Be specific — include real examples if possible.]

**Evidence:**
[Data, feedback, metrics, or observations that justify the priority.]

**Why now:**
[What has changed that makes this urgent or opportune.]

---

## 3. Goals

> *What does this feature need to deliver to be considered successful?*
> *Each goal must be verifiable — if you can't measure it, rephrase it.*

- [ ] G-01: [Goal 1]
- [ ] G-02: [Goal 2]
- [ ] G-03: [Goal 3]

**Success Metrics:**
| Metric | Current Baseline | Target | Deadline |
|--------|-----------------|--------|----------|
| [e.g., Conversion rate] | [X%] | [Y%] | [date] |

---

## 4. Non-Goals

> *Explicit is better than implicit. State what will NOT be done in this version.*
> *This prevents scope creep and aligns expectations.*

- NG-01: [What will not be done]
- NG-02: [What will not be done]
- NG-03: [Future versions may include X, but not now]

---

## 5. Users and Personas

> *Who will use this? What is their context?*

**Primary user:** [Description — e.g., "Logged-in user with Pro plan, familiar with the platform"]
**Secondary user:** [If applicable — e.g., "Admin who configures permissions"]

**Current journey (without the feature):**
[Describe in 2–4 steps what the user does today to solve the same problem, or why they can't.]

**Future journey (with the feature):**
[Describe in 2–4 steps what the user will do with the feature completed.]

---

## 6. Functional Requirements

> *The core of the spec. Each requirement must be: atomic, testable, and unambiguous.*
> *Format: FR-XX — [System / User] must [concrete verb] [complement].*

### 6.1 Main Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-01 | [The system must...] | Must | [How to test that this works] |
| FR-02 | [The user must be able to...] | Must | [Verifiable condition] |
| FR-03 | [The system must...] | Should | [Verifiable condition] |
| FR-04 | [The system must...] | Could | [Verifiable condition] |

> Priorities: **Must** (required for MVP) / **Should** (important but negotiable) / **Could** (nice-to-have)

### 6.2 Main Flow (Happy Path)

> *Describe the most common flow, step by step.*

1. The user [action 1]
2. The system [response 1]
3. The user [action 2]
4. The system [response 2]
5. Result: [final state]

### 6.3 Alternative Flows

> *Variations of the main flow that must also work.*

**Alternative Flow A — [Name]:**
1. [Divergent step from the main flow]
2. [Specific behavior]

---

## 7. Non-Functional Requirements

| ID | Requirement | Target Value | Notes |
|----|-------------|-------------|-------|
| NFR-01 | Performance | [e.g., P95 < 300ms] | [context] |
| NFR-02 | Availability | [e.g., 99.9% uptime] | [context] |
| NFR-03 | Security | [e.g., mandatory authentication] | [context] |
| NFR-04 | Accessibility | [e.g., WCAG 2.1 AA] | [context] |

---

## 8. Design and Interface

> *Describe the UI/UX behavior, not the visual design. Wireframes can be referenced.*

**Affected components:** [List of screens, components, or endpoints touched]

**Expected behavior:**
[Describe what the user sees and how elements respond to actions.]

**UI States:**
- Empty state: [what to show when there is no data]
- Loading state: [what to show while processing]
- Error state: [what to show on failure]
- Success state: [what to show after completion]

---

## 9. Data Model

> *Only if the feature creates or modifies persisted data.*

**New or modified entities:**

```
[EntityName] {
  field_1: type        // description
  field_2: type        // description
}
```

**Required migrations:** [Yes / No — if yes, describe the impact]

---

## 10. Integrations and Dependencies

| Dependency | Type | Impact if Unavailable |
|------------|------|----------------------|
| [External API / Service / Library] | [Mandatory / Optional] | [Fallback behavior] |

---

## 11. Edge Cases and Error Handling

> *This is where specs usually fail. Think about the hard cases.*

| Scenario | Trigger | Expected Behavior |
|----------|---------|-------------------|
| EC-01: [Edge case name] | [What causes this scenario] | [What the system should do] |
| EC-02: [Invalid input] | [Condition] | [Error message / fallback] |
| EC-03: [Timeout / external failure] | [Condition] | [Retry / degradation / clear error] |
| EC-04: [Rate/quota limit reached] | [Condition] | [Behavior] |

---

## 12. Security and Privacy

- **Authentication:** [Who can access this feature?]
- **Authorization:** [What permissions are required?]
- **Sensitive data:** [Does the feature process PII, financial data, or confidential information? How is it protected?]
- **Auditing:** [Is an audit log required? What must be logged?]

---

## 13. Rollout Plan

- **Strategy:** [Big bang / Feature flag / Gradual rollout / Canary]
- **How to rollback:** [Steps to undo if something goes wrong]
- **Post-deploy monitoring:** [What to observe in the first 24–48 hours]

---

## 14. Open Questions

> *Unresolved questions that may impact the design. Each item must have an owner and a deadline.*

| # | Question | Impact | Owner | Deadline |
|---|----------|--------|-------|----------|
| OQ-01 | [Open question] | [High/Medium/Low] | [Name] | [date] |

---

## 15. Decisions Made (Decision Log)

> *Record important decisions and the rationale — useful for future reviews.*

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| [What was decided] | [What was discarded] | [Why this option] |

---

## Appendix

### References
- [Links to related docs, tickets, designs, research]

### Review History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [date] | [author] | Initial creation |
