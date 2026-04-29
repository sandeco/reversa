#!/usr/bin/env bash
# Regenerate this skill from upstream library-docs.
exec claude /create-skill-docs /home/diogo/dev/library-docs/pi-coding "$@"
