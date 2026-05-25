# Checklist for `handoff.md`

Before closing the pipeline, the orchestrator validates that `handoff.md` satisfies all items.

## Mandatory checklist

- [ ] `paradigm_decision.md` appears as the **first item** in the "Required Reading" section and in the "Recommended Reading Order".
- [ ] `topology_decision.md` appears as the **second item** in the "Required Reading" section.
- [ ] `screen_modernization_decision.md` appears as the **third item** when there is a UI; for legacy systems without a UI (Screen Translator skipped), the entry is omitted with an explicit note "Screen Translator skipped, legacy system without UI".
- [ ] List of produced artifacts is complete and reflects the actual contents of `_reversa_sdd/migration/` and `_reversa_sdd/screens/`.
- [ ] Pending deviations in `screen_deviation_log.md` appear as blockers; approved deviations are reflected in `parity_specs.md § Exceptions`.
- [ ] Items REFERRED TO CODING from `ambiguity_log.md` appear in a dedicated section of `handoff.md`.
- [ ] Blockers listed, or the line "no blockers, proceed".
- [ ] Next steps for the coding agent are specific and actionable (not generic).
- [ ] In `--auto` mode: auto-decided items are listed explicitly.
- [ ] Style is consistent with the installed engine (adapted format, e.g., compatible front-matter).

## Minimum structure

1. Required reading banner for `paradigm_decision.md`, `topology_decision.md`, and (if UI exists) `screen_modernization_decision.md`.
2. Recommended reading order.
3. List of artifacts.
4. Blockers.
5. Next steps for the coding agent.
6. Auto-decided items (only if `--auto`).
7. Final notes.

## Strong signal to the coding agent

The first sentence of `handoff.md` must convey immediate clarity. Suggested pattern:

> "New system to be built in paradigm <X>, topology <Y>, screens in mode <Z>. Before writing any code, read `paradigm_decision.md`, `topology_decision.md`, and `screen_modernization_decision.md`."

For legacy systems without a UI (Screen Translator skipped), replace the screen portion with: "screens: none (system without UI)".
