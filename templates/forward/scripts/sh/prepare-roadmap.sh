#!/usr/bin/env bash
#
# prepare-roadmap.sh
# Helper specific to the /reversa-plan skill.
# Ensures the active feature folder is ready to receive roadmap, investigation, data-delta, onboarding, and interfaces/.
# Emits JSON with absolute paths ready for the agent to use.
#
# Usage:
#   prepare-roadmap.sh [--json]
#
# Exit codes:
#   0 = success, JSON emitted
#   1 = active-requirements.json missing or invalid
#   2 = feature-dir does not exist and could not be created
#   3 = invalid usage

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REVERSA_DIR="$PROJECT_ROOT/.reversa"
SDD_DIR="$PROJECT_ROOT/_reversa_sdd"
ACTIVE="$REVERSA_DIR/active-requirements.json"

JSON_MODE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON_MODE=1; shift ;;
    *) echo "invalid usage: $1" >&2; exit 3 ;;
  esac
done

if [ ! -f "$ACTIVE" ]; then
  echo "error: $ACTIVE does not exist. run reversa-requirements first." >&2
  exit 1
fi

feature_dir_rel="$(grep -o '"feature-dir"[[:space:]]*:[[:space:]]*"[^"]*"' "$ACTIVE" | sed 's/.*"\([^"]*\)"$/\1/' | head -n 1)"
if [ -z "$feature_dir_rel" ]; then
  echo "error: feature-dir field not found in $ACTIVE" >&2
  exit 1
fi

feature_dir="$PROJECT_ROOT/$feature_dir_rel"
mkdir -p "$feature_dir/interfaces" || { echo "error: could not create $feature_dir/interfaces" >&2; exit 2; }

requirements_path="$feature_dir/requirements.md"
roadmap_path="$feature_dir/roadmap.md"
investigation_path="$feature_dir/investigation.md"
data_delta_path="$feature_dir/data-delta.md"
onboarding_path="$feature_dir/onboarding.md"
interfaces_dir="$feature_dir/interfaces"

requirements_present=0
[ -f "$requirements_path" ] && requirements_present=1

roadmap_already=0
[ -f "$roadmap_path" ] && roadmap_already=1

if [ $JSON_MODE -eq 1 ]; then
  printf '{'
  printf '"project-root":"%s",' "$PROJECT_ROOT"
  printf '"sdd-dir":"%s",' "$SDD_DIR"
  printf '"feature-dir":"%s",' "$feature_dir"
  printf '"requirements":{"path":"%s","present":%s},' "$requirements_path" "$requirements_present"
  printf '"roadmap":{"path":"%s","already-exists":%s},' "$roadmap_path" "$roadmap_already"
  printf '"investigation":"%s",' "$investigation_path"
  printf '"data-delta":"%s",' "$data_delta_path"
  printf '"onboarding":"%s",' "$onboarding_path"
  printf '"interfaces-dir":"%s",' "$interfaces_dir"
  printf '"template":"%s"' "$REVERSA_DIR/templates/roadmap-template.md"
  printf '}\n'
else
  echo "feature-dir: $feature_dir"
  echo "requirements present: $requirements_present"
  echo "roadmap already exists: $roadmap_already"
fi

exit 0
