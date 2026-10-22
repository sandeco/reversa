#!/usr/bin/env python3
"""Deterministic integrity checks for Reversa Reviewer artifacts.

The validator is intentionally read-only with respect to the review root. It
prints a stable JSON result and returns a non-zero exit code when an integrity
error is found.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

QUESTION_ID = re.compile(r"\bQ-[A-Z]+-\d+\b")
QUESTION_DEFINITION = re.compile(
    r"^#{2,6}\s+(Q-[A-Z]+-\d+)\s+([🔴🟡])(?:\s|$)", re.MULTILINE
)
QUESTION_SEVERITY_MARKER = re.compile(r"[🔴🟡]")
SEVERITY = {"🔴": "red", "🟡": "yellow"}
DOC_LEVELS = ("essencial", "completo", "detalhado")


def _markdown_files(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*.md") if path.is_file())


def _read_markdown(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig", errors="replace").replace("\x00", "")


def _question_severities(text: str) -> list[tuple[str, str]]:
    observed: list[tuple[str, str]] = []
    for line in text.splitlines():
        ids = list(QUESTION_ID.finditer(line))
        markers = list(QUESTION_SEVERITY_MARKER.finditer(line))
        if not ids or not markers:
            continue
        for question in ids:
            nearest = min(markers, key=lambda marker: abs(marker.start() - question.start()))
            observed.append((question.group(0), nearest.group(0)))
    return observed


def _finding_id(finding: dict[str, Any]) -> str:
    identity = json.dumps(
        {"code": finding["code"], "details": finding["details"]},
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    digest = hashlib.sha256(identity).hexdigest()[:16]
    return f"{finding['code']}:{digest}"


def _evaluate_waiver(
    waiver_path: Path | None,
    findings: list[dict[str, Any]],
) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
    if waiver_path is None:
        return None, list(findings)

    resolved = waiver_path.resolve()
    metadata: dict[str, Any] = {"path": str(resolved), "status": "invalid"}
    try:
        payload = json.loads(resolved.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        metadata["error"] = f"waiver ilegível: {exc.__class__.__name__}"
        return metadata, list(findings)

    if not isinstance(payload, dict):
        metadata["error"] = "waiver deve ser um objeto JSON"
        return metadata, list(findings)

    approved_by = str(payload.get("approved_by", "")).strip()
    reason = str(payload.get("reason", "")).strip()
    raw_finding_ids = payload.get("finding_ids")
    finding_ids = (
        [finding_id.strip() for finding_id in raw_finding_ids]
        if isinstance(raw_finding_ids, list)
        and all(
            isinstance(finding_id, str) and finding_id.strip()
            for finding_id in raw_finding_ids
        )
        else []
    )
    observed_ids = {finding["id"] for finding in findings}
    valid_ids = bool(finding_ids) and set(finding_ids).issubset(observed_ids)
    if (
        payload.get("schema_version") != 1
        or not approved_by
        or len(reason) < 20
        or not valid_ids
    ):
        metadata["error"] = (
            "waiver exige schema_version=1, approved_by, reason com pelo menos "
            "20 caracteres e finding_ids presentes no resultado"
        )
        return metadata, list(findings)

    covered_ids = sorted(set(finding_ids))
    metadata.update(
        {
            "status": "valid",
            "approved_by": approved_by,
            "reason": reason,
            "finding_ids": covered_ids,
        }
    )
    unwaived = [finding for finding in findings if finding["id"] not in covered_ids]
    return metadata, unwaived


def validate_review(
    root: Path,
    *,
    doc_level: str,
    cross_review_performed: bool = False,
    waiver_path: Path | None = None,
) -> dict[str, Any]:
    """Validate one completed Reviewer output tree without mutating it."""
    if doc_level not in DOC_LEVELS:
        raise ValueError(f"doc_level inválido: {doc_level}")

    root = root.resolve()
    findings: list[dict[str, Any]] = []
    markdown_files = _markdown_files(root) if root.is_dir() else []

    questions_path = root / "questions.md"
    questions_text = _read_markdown(questions_path) if questions_path.is_file() else ""
    definitions = {
        question_id: SEVERITY[marker]
        for question_id, marker in QUESTION_DEFINITION.findall(questions_text)
    }

    references: dict[str, set[str]] = {}
    for path in markdown_files:
        if path == questions_path:
            continue
        relative = path.relative_to(root).as_posix()
        for question_id in QUESTION_ID.findall(_read_markdown(path)):
            references.setdefault(question_id, set()).add(relative)

    for question_id in sorted(set(references) - set(definitions)):
        findings.append(
            {
                "code": "orphan-question-reference",
                "severity": "error",
                "details": {
                    "question_id": question_id,
                    "references": sorted(references[question_id]),
                },
            }
        )

    required = ["confidence-report.md", "questions.md"]
    if doc_level in {"completo", "detalhado"}:
        required.append("gaps.md")
    if cross_review_performed:
        required.append("cross-review-result.md")
    for relative in required:
        if not (root / relative).is_file():
            findings.append(
                {
                    "code": "missing-required-artifact",
                    "severity": "error",
                    "details": {"path": relative, "doc_level": doc_level},
                }
            )

    for path in markdown_files:
        if path == questions_path:
            continue
        relative = path.relative_to(root).as_posix()
        seen: set[tuple[str, str]] = set()
        for question_id, marker in _question_severities(_read_markdown(path)):
            observed = SEVERITY[marker]
            canonical = definitions.get(question_id)
            key = (question_id, observed)
            if canonical is not None and observed != canonical and key not in seen:
                findings.append(
                    {
                        "code": "question-severity-conflict",
                        "severity": "error",
                        "details": {
                            "question_id": question_id,
                            "canonical": canonical,
                            "observed": observed,
                            "path": relative,
                        },
                    }
                )
                seen.add(key)

    report_path = root / "review-report.md"
    if report_path.is_file():
        report_text = _read_markdown(report_path)
        blocker_section = re.search(
            r"^#{2,6}\s+🔴[^\n]*\n(?P<body>.*?)(?=^#{2,6}\s|\Z)",
            report_text,
            re.MULTILINE | re.DOTALL,
        )
        if blocker_section:
            reported_blockers = sorted(set(QUESTION_ID.findall(blocker_section.group("body"))))
            canonical_red = sorted(
                question_id
                for question_id, severity in definitions.items()
                if severity == "red"
            )
            if reported_blockers != canonical_red:
                findings.append(
                    {
                        "code": "blocker-set-mismatch",
                        "severity": "error",
                        "details": {
                            "canonical_red": canonical_red,
                            "reported_blockers": reported_blockers,
                            "missing_from_report": sorted(
                                set(canonical_red) - set(reported_blockers)
                            ),
                            "extra_in_report": sorted(
                                set(reported_blockers) - set(canonical_red)
                            ),
                        },
                    }
                )

        file_metric = re.search(
            r"\|\s*Arquivos Markdown gerados\s*\|\s*([\d.]+)\s*\|",
            report_text,
        )
        if file_metric:
            reported = int(file_metric.group(1).replace(".", ""))
            observed = len(markdown_files)
            if reported != observed:
                findings.append(
                    {
                        "code": "markdown-file-count-mismatch",
                        "severity": "error",
                        "details": {
                            "reported": reported,
                            "observed": observed,
                            "metric": "logical markdown files under review root",
                        },
                    }
                )

        line_metric = re.search(
            r"\|\s*Linhas de spec\s*\|\s*([\d.]+)\s*\|",
            report_text,
        )
        if line_metric:
            reported = int(line_metric.group(1).replace(".", ""))
            observed = sum(len(_read_markdown(path).splitlines()) for path in markdown_files)
            if reported != observed:
                findings.append(
                    {
                        "code": "markdown-line-count-mismatch",
                        "severity": "error",
                        "details": {
                            "reported": reported,
                            "observed": observed,
                            "metric": "sum(len(text.splitlines()))",
                        },
                    }
                )

    findings.sort(
        key=lambda item: (
            item["code"],
            item["details"].get("question_id", ""),
            item["details"].get("path", ""),
        )
    )
    for finding in findings:
        finding["id"] = _finding_id(finding)
    waiver, unwaived_findings = _evaluate_waiver(waiver_path, findings)
    waived = (
        bool(findings)
        and waiver is not None
        and waiver.get("status") == "valid"
        and not unwaived_findings
    )
    return {
        "schema_version": 1,
        "root": str(root),
        "doc_level": doc_level,
        "cross_review_performed": cross_review_performed,
        "ok": not unwaived_findings,
        "waived": waived,
        "waiver": waiver,
        "summary": {
            "markdown_files": len(markdown_files),
            "defined_questions": len(definitions),
            "referenced_questions": len(references),
            "findings": len(findings),
            "unwaived_findings": len(unwaived_findings),
        },
        "findings": findings,
        "unwaived_findings": unwaived_findings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Valida deterministicamente os artefatos do Reversa Reviewer."
    )
    parser.add_argument("root", type=Path, help="Pasta de saída, por exemplo _reversa_sdd")
    parser.add_argument("--doc-level", choices=DOC_LEVELS, required=True)
    parser.add_argument(
        "--cross-review-performed",
        action="store_true",
        help="Exige cross-review-result.md porque a revisão cruzada foi realizada.",
    )
    parser.add_argument(
        "--waiver",
        type=Path,
        help=(
            "JSON de waiver explícito com schema_version, approved_by, reason e "
            "finding_ids exatos do resultado. Findings não cobertos continuam bloqueando."
        ),
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Opcional: grava uma cópia do JSON fora da árvore validada.",
    )
    args = parser.parse_args()

    result = validate_review(
        args.root,
        doc_level=args.doc_level,
        cross_review_performed=args.cross_review_performed,
        waiver_path=args.waiver,
    )
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
