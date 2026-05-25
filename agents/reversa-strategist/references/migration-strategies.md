> Local copy of the consulting catalog. Canonical source at `templates/migration/catalogs/migration_strategies.md`.

# Migration Strategies (local copy)

## Strategies

### Strangler Fig
- **When to apply**: system in production, cannot stop; need for incrementality; routing possibility (proxy / API gateway).
- **Cost**: medium. **Risk**: low. **Time**: long.
- **Preferred appetite**: conservative, balanced.

### Big Bang
- **When to apply**: small system; tolerable downtime window; transformational appetite; few live integrations.
- **Cost**: low. **Risk**: high. **Time**: short.
- **Preferred appetite**: transformational (on small systems).

### Parallel Run
- **When to apply**: critical logic (financial / tax / regulatory); needs proof of equivalence over a long period.
- **Cost**: high. **Risk**: medium. **Time**: medium.
- **Preferred appetite**: balanced.

### Branch by Abstraction
- **When to apply**: internal migration (language or framework changes, domain stays); conservative appetite.
- **Cost**: low. **Risk**: low. **Time**: medium.
- **Preferred appetite**: conservative.

## Recommendation Rules

- `conservative` appetite → Branch by Abstraction + Strangler Fig.
- `balanced` appetite → Strangler Fig + Parallel Run.
- `transformational` appetite → Big Bang on small systems; Strangler Fig with deep edges on larger ones.
- major paradigm shift + transformational appetite → recommend Parallel Run to validate parity.
- system with regulatory integrations → never recommend Big Bang.

## Pseudo-Procedure

1. Filter applicable strategies based on brief.
2. Score remaining strategies by appetite alignment and paradigm gap.
3. Select 2 to 3 candidates.
4. Mark one as recommended with justification.
5. For each other, list cons as reasons for non-recommendation.
