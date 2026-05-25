# Sizing formula (`sizing-formula.md`)

**Formula version:** 2.0  
**size.json schema version:** 1.1

Documents the deterministic calculation used by the `reversa-pricing-size` agent to transform forward-cycle artifacts into a complexity class (`S/M/L/XL/XXL`). Formula v2 abandons the linear sum of arbitrary weights and adopts task-based T-shirt sizing, with risk handled as a separate adjustment.

## Source and criterion

Reversa v1 needs a sizing measure that is understandable to non-expert users, works across engines, and is derived from files already produced in `_reversa_sdd/forward/<feature>/`.

Function Points (IFPUG, ISO/IEC 20926) and COSMIC (ISO/IEC 19761) are formal functional-sizing standards, but they require specialized classification. For Reversa's UX, the best basis is approximate agile estimation inspired by Story Points and T-shirt sizing. Mike Cohn, in *Agile Estimating and Planning* (Addison-Wesley, 2005), describes relative estimates and approximate sizing as agile planning practices.

This formula does not claim the ranges are a universal standard. It documents a simple Reversa heuristic, based on T-shirt sizing, and keeps risk factors separate to avoid false precision.

## Inputs

Inputs continue to come from `metrics`:

- `tasks.total`
- `doubts.high`, `doubts.medium`, `doubts.low`, `doubts.total`
- `plan_depth`
- `principles_touched`
- `requirements.total`, used only as a consistency warning, not as a primary driver

## Step 1: base class by number of tasks

`tasks.total` is the best size proxy because the forward cycle has already broken the feature into work units.

```python
if tasks.total <= 0:       base_complexity_class = "S"
elif tasks.total <= 3:     base_complexity_class = "S"
elif tasks.total <= 7:     base_complexity_class = "M"
elif tasks.total <= 15:    base_complexity_class = "L"
elif tasks.total <= 30:    base_complexity_class = "XL"
else:                      base_complexity_class = "XXL"
```

## Step 2: risk points

Risk is not size. It pushes the class upward when the feature has uncertainty, depth, or cross-cutting impact.

```python
unclassified_doubts =
  max(0, doubts.total - doubts.high - doubts.medium - doubts.low)

risk_points =
  doubts.high * 2 +
  doubts.medium * 1 +
  unclassified_doubts * 1 +
  max(0, plan_depth - 3) +
  floor(len(principles_touched) / 3)
```

`doubts.low` does not increase risk in v2. Low doubt is expected refinement noise.

## Step 3: risk adjustment

```python
if risk_points <= 2:       risk_adjustment_classes = 0
elif risk_points <= 5:     risk_adjustment_classes = 1
else:                      risk_adjustment_classes = 2
```

## Step 4: final class

Classes are ordered as follows:

```python
S=0, M=1, L=2, XL=3, XXL=4
```

```python
complexity_class =
  class_from_index(min(4, index(base_complexity_class) + risk_adjustment_classes))
```

## Step 5: auxiliary `size_score`

`size_score` exists only for compatibility and quick reading. It should no longer drive hours directly.

```yaml
size_score_by_class:
  S:   15
  M:   35
  L:   60
  XL:  80
  XXL: 95
```

## Recommended fields in `size.json`

The agent should write these fields in addition to the older ones:

```text
sizing_method = "task_tshirt_with_risk_adjustment"
base_complexity_class = <class before risk>
risk_points = <integer>
risk_adjustment_classes = <0, 1, or 2>
size_score = <auxiliary midpoint of the final class>
```

## Calculation examples

### Example 1: small feature (S)

```python
tasks.total = 3
doubts.high = 0
doubts.medium = 0
doubts.low = 0
doubts.total = 0
plan_depth = 2
principles_touched = []

base_complexity_class = S
risk_points = 0
risk_adjustment_classes = 0
complexity_class = S
size_score = 15
```

### Example 2: medium feature that rises to L because of risk

```python
tasks.total = 7
doubts.total = 3 (high=1, medium=2, low=0)
plan_depth = 3
principles_touched = ["non_destructive", "multi_engine", "handoff_pattern"]

base_complexity_class = M
risk_points = 1*2 + 2*1 + 0 + 0 + floor(3/3) = 5
risk_adjustment_classes = 1
complexity_class = L
size_score = 60
```

### Example 3: large feature (L)

```python
tasks.total = 12
doubts.total = 1 (high=0, medium=1, low=0)
plan_depth = 4
principles_touched = 2

base_complexity_class = L
risk_points = 0 + 1 + 0 + 1 + 0 = 2
risk_adjustment_classes = 0
complexity_class = L
size_score = 60
```

### Example 4: huge feature (XXL)

```python
tasks.total = 31
doubts.total = 6 (high=2, medium=3, low=1)
plan_depth = 6
principles_touched = 8

base_complexity_class = XXL
risk_points = 2*2 + 3*1 + 0 + 3 + floor(8/3) = 12
risk_adjustment_classes = 2
complexity_class = XXL
size_score = 95
```

## Consistency warnings

Requirements do not enter the primary calculation, but may generate a note:

```python
if requirements.total >= 12 and tasks.total <= 3:
  notes += "Too many requirements for too few tasks. Check whether tasks.md is granular enough."
```

## Limits and assumptions

1. The formula measures structural size before coding, so it does not use LOC
2. Tokens are not counted
3. `size_score` is auxiliary and should not be converted directly into hours
4. XXL should trigger a recommendation to split scope before pricing or coding
5. If class thresholds change, bump `formula_version`
