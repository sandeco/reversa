#!/usr/bin/env bash
#
# verify-prerequisites.sh
# Generic precondition helper, called by Reversa forward skills.
#
# Standard output is one-line JSON. The agent reads it and acts according to the fields.
# No external dependencies besides bash, jq optional.
#
# Usage:
#   verify-prerequisites.sh [--json] [--require <field>] [--require <field>] ...
#
# Fields supported in --require:
#   active-requirements   Requires .reversa/active-requirements.json to exist.
#   feature-dir           Requires the folder pointed to by active-requirements to exist.
#   requirements          Requires feature-dir/requirements.md.
#   roadmap               Requires feature-dir/roadmap.md.
#   actions               Requires feature-dir/actions.md.
#   sdd                   Requires _reversa_sdd/ to be present.
#   principles            Requires .reversa/principles.md.
#
# Exit codes:
#   0 = all requirements matched
#   1 = at least one requirement missing (details in JSON)
#   2 = invalid usage

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REVERSA_DIR="$PROJECT_ROOT/.reversa"
SDD_DIR="$PROJECT_ROOT/_reversa_sdd"
FORWARD_DIR="$PROJECT_ROOT/_reversa_forward"
ACTIVE="$REVERSA_DIR/active-requirements.json"

JSON_MODE=0
REQUIRES=()

while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON_MODE=1; shift ;;
    --require) shift; REQUIRES+=("${1:-}"); shift ;;
    *) echo "invalid usage: $1" >&2; exit 2 ;;
  esac
done

missing=()
feature_dir=""

if [ -f "$ACTIVE" ]; then
  feature_dir_rel="$(grep -o '"feature-dir"[[:space:]]*:[[:space:]]*"[^"]*"' "$ACTIVE" | sed 's/.*"\([^"]*\)"$/\1/' | head -n 1)"
  if [ -n "$feature_dir_rel" ]; then
    feature_dir="$PROJECT_ROOT/$feature_dir_rel"
  fi
fi

check_one() {
  local name="$1"
  case "$name" in
    active-requirements)
      [ -f "$ACTIVE" ] || missing+=("active-requirements")
      ;;
    feature-dir)
      if [ -z "$feature_dir" ] || [ ! -d "$feature_dir" ]; then
        missing+=("feature-dir")
      fi
      ;;
    requirements)
      [ -n "$feature_dir" ] && [ -f "$feature_dir/requirements.md" ] || missing+=("requirements")
      ;;
    roadmap)
      [ -n "$feature_dir" ] && [ -f "$feature_dir/roadmap.md" ] || missing+=("roadmap")
      ;;
    actions)
      [ -n "$feature_dir" ] && [ -f "$feature_dir/actions.md" ] || missing+=("actions")
      ;;
    sdd)
      [ -d "$SDD_DIR" ] || missing+=("sdd")
      ;;
    principles)
      [ -f "$REVERSA_DIR/principles.md" ] || missing+=("principles")
      ;;
    *)
      missing+=("unknown:$name")
      ;;
  esac
}

for r in "${REQUIRES[@]}"; do
  [ -n "$r" ] && check_one "$r"
done

emit_json() {
  printf '{'
  printf '"project-root":"%s",' "$PROJECT_ROOT"
  printf '"reversa-dir":"%s",' "$REVERSA_DIR"
  printf '"sdd-dir":"%s",' "$SDD_DIR"
  printf '"forward-dir":"%s",' "$FORWARD_DIR"
  printf '"active-requirements":"%s",' "$ACTIVE"
  printf '"feature-dir":"%s",' "$feature_dir"
  printf '"missing":['
  local first=1
  for m in "${missing[@]:-}"; do
    if [ -z "$m" ]; then continue; fi
    if [ $first -eq 1 ]; then first=0; else printf ','; fi
    printf '"%s"' "$m"
  done
  printf ']}'
  printf '\n'
}

if [ $JSON_MODE -eq 1 ]; then
  emit_json
else
  if [ ${#missing[@]} -eq 0 ]; then
    echo "ok"
  else
    echo "missing: ${missing[*]}"
  fi
fi

if [ ${#missing[@]} -eq 0 ]; then
  exit 0
else
  exit 1
fi
