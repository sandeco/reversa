#!/usr/bin/env python3
"""Focused tests for the deterministic Reviewer integrity gate."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.dont_write_bytecode = True

REPO_ROOT = Path(__file__).resolve().parents[1]
VALIDATOR_PATH = (
    REPO_ROOT
    / "agents"
    / "reversa-reviewer"
    / "scripts"
    / "verify-discovery-review.py"
)


def load_validator():
    spec = importlib.util.spec_from_file_location("verify_discovery_review", VALIDATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"não foi possível carregar {VALIDATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


class ReviewerIntegrityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tempdir.cleanup)
        self.root = Path(self.tempdir.name) / "_reversa_sdd"
        write(self.root / "questions.md", "# Perguntas\n\n### Q-SEC-01 🔴\n\nPergunta.\n")
        write(self.root / "confidence-report.md", "# Confiança\n")
        write(self.root / "gaps.md", "# Gaps\n")
        self.validator = load_validator()

    def validate(self, **kwargs):
        return self.validator.validate_review(self.root, doc_level="completo", **kwargs)

    def test_accepts_consistent_review(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-SEC-01.\n")
        result = self.validate()
        self.assertTrue(result["ok"])
        self.assertEqual([], result["findings"])

    def test_accepts_canonical_template_heading(self) -> None:
        write(
            self.root / "questions.md",
            "# Perguntas\n\n## Q-AUTH-01 🔴 — Pergunta 1\n\nPergunta.\n",
        )
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-AUTH-01.\n")
        result = self.validate()
        self.assertTrue(result["ok"])
        self.assertEqual([], result["findings"])

    def test_accepts_question_definition_headings_h2_through_h6(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-AUTH-01.\n")
        for level in range(2, 7):
            with self.subTest(level=level):
                write(
                    self.root / "questions.md",
                    f"# Perguntas\n\n{'#' * level} Q-AUTH-01 🔴 — Pergunta 1\n",
                )
                orphans = [
                    finding
                    for finding in self.validate()["findings"]
                    if finding["code"] == "orphan-question-reference"
                ]
                self.assertEqual([], orphans)

    def test_rejects_orphan_question_reference(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-AE-01.\n")
        result = self.validate()
        finding = result["findings"][0]
        self.assertEqual("orphan-question-reference", finding["code"])
        self.assertEqual("error", finding["severity"])
        self.assertEqual(
            {"question_id": "Q-AE-01", "references": ["architecture.md"]},
            finding["details"],
        )
        self.assertRegex(
            finding["id"],
            r"^orphan-question-reference:[0-9a-f]{16}$",
        )

    def test_rejects_missing_required_reviewer_artifacts(self) -> None:
        (self.root / "confidence-report.md").unlink()
        (self.root / "gaps.md").unlink()
        result = self.validate()
        self.assertEqual(
            ["confidence-report.md", "gaps.md"],
            [
                finding["details"]["path"]
                for finding in result["findings"]
                if finding["code"] == "missing-required-artifact"
            ],
        )

    def test_rejects_conflicting_question_severity(self) -> None:
        write(
            self.root / "review-report.md",
            "# Revisão\n\n## Bloqueantes\n\n- Q-SEC-01 🟡 — classificação divergente.\n",
        )
        conflicts = [
            finding
            for finding in self.validate()["findings"]
            if finding["code"] == "question-severity-conflict"
        ]
        self.assertEqual(1, len(conflicts))
        self.assertEqual("red", conflicts[0]["details"]["canonical"])
        self.assertEqual("yellow", conflicts[0]["details"]["observed"])

    def test_detects_severity_when_marker_precedes_question_id(self) -> None:
        write(
            self.root / "review-report.md",
            "# Revisão\n\n- 🟡 Q-SEC-01 — classificação divergente.\n",
        )
        conflicts = [
            finding
            for finding in self.validate()["findings"]
            if finding["code"] == "question-severity-conflict"
        ]
        self.assertEqual(1, len(conflicts))
        self.assertEqual("yellow", conflicts[0]["details"]["observed"])

    def test_uses_nearest_marker_when_line_has_multiple_question_ids(self) -> None:
        write(
            self.root / "questions.md",
            "# Perguntas\n\n### Q-AUTH-01 🟡\n\n### Q-SEC-01 🔴\n",
        )
        write(
            self.root / "review-report.md",
            "# Revisão\n\n- 🟡 Q-AUTH-01; Q-SEC-01 🔴\n",
        )
        conflicts = [
            finding
            for finding in self.validate()["findings"]
            if finding["code"] == "question-severity-conflict"
        ]
        self.assertEqual([], conflicts)

    def test_rejects_blocker_set_mismatch(self) -> None:
        write(
            self.root / "questions.md",
            "# Perguntas\n\n### Q-SEC-01 🔴\n\n### Q-SEC-02 🟡\n",
        )
        write(
            self.root / "review-report.md",
            "# Revisão\n\n### 🔴 Bloqueantes para reimplementação fiel (1)\n\n"
            "| Pergunta | Impacto |\n|---|---|\n| Q-SEC-02 | impacto |\n",
        )
        mismatches = [
            finding
            for finding in self.validate()["findings"]
            if finding["code"] == "blocker-set-mismatch"
        ]
        self.assertEqual(1, len(mismatches))
        self.assertEqual(["Q-SEC-01"], mismatches[0]["details"]["missing_from_report"])
        self.assertEqual(["Q-SEC-02"], mismatches[0]["details"]["extra_in_report"])

    def test_rejects_blocker_set_mismatch_with_h2_through_h6(self) -> None:
        write(
            self.root / "questions.md",
            "# Perguntas\n\n### Q-SEC-01 🔴\n\n### Q-SEC-02 🟡\n",
        )
        for level in range(2, 7):
            with self.subTest(level=level):
                write(
                    self.root / "review-report.md",
                    f"# Revisão\n\n{'#' * level} 🔴 Bloqueantes\n\n- Q-SEC-02\n",
                )
                mismatches = [
                    finding
                    for finding in self.validate()["findings"]
                    if finding["code"] == "blocker-set-mismatch"
                ]
                self.assertEqual(1, len(mismatches))
                self.assertEqual(
                    ["Q-SEC-01"],
                    mismatches[0]["details"]["missing_from_report"],
                )

    def test_rejects_report_denominator_drift(self) -> None:
        write(
            self.root / "review-report.md",
            "# Revisão\n\n| Métrica | Valor |\n|---|---:|\n"
            "| Arquivos Markdown gerados | 3 |\n| Linhas de spec | 1 |\n",
        )
        by_code = {finding["code"]: finding for finding in self.validate()["findings"]}
        self.assertEqual(4, by_code["markdown-file-count-mismatch"]["details"]["observed"])
        self.assertGreater(by_code["markdown-line-count-mismatch"]["details"]["observed"], 1)
        self.assertEqual(
            "sum(len(text.splitlines()))",
            by_code["markdown-line-count-mismatch"]["details"]["metric"],
        )

    def test_questions_registry_is_always_required(self) -> None:
        (self.root / "questions.md").unlink()
        result = self.validate()
        missing = [
            finding["details"]["path"]
            for finding in result["findings"]
            if finding["code"] == "missing-required-artifact"
        ]
        self.assertIn("questions.md", missing)

    def test_cross_review_artifact_is_conditional(self) -> None:
        without_cross_review = self.validator.validate_review(
            self.root, doc_level="detalhado", cross_review_performed=False
        )
        self.assertNotIn(
            "cross-review-result.md",
            [finding["details"].get("path") for finding in without_cross_review["findings"]],
        )
        with_cross_review = self.validator.validate_review(
            self.root, doc_level="detalhado", cross_review_performed=True
        )
        self.assertIn(
            "cross-review-result.md",
            [finding["details"].get("path") for finding in with_cross_review["findings"]],
        )

    def test_result_is_stably_json_serializable(self) -> None:
        first = self.validate()
        second = self.validate()
        self.assertEqual(first, second)
        json.dumps(first, ensure_ascii=False, sort_keys=True)

    def test_explicit_waiver_can_cover_known_findings(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-AE-01.\n")
        baseline = self.validate()
        orphan_id = next(
            finding["id"]
            for finding in baseline["findings"]
            if finding["code"] == "orphan-question-reference"
        )
        waiver = Path(self.tempdir.name) / "review-waiver.json"
        write(
            waiver,
            json.dumps(
                {
                    "schema_version": 1,
                    "approved_by": "maintainer@example",
                    "reason": "Aceite consciente para concluir esta execução específica.",
                    "finding_ids": [orphan_id],
                }
            ),
        )
        result = self.validator.validate_review(
            self.root,
            doc_level="completo",
            waiver_path=waiver,
        )
        self.assertTrue(result["ok"])
        self.assertTrue(result["waived"])
        self.assertEqual([], result["unwaived_findings"])
        self.assertEqual("maintainer@example", result["waiver"]["approved_by"])

    def test_waiver_is_scoped_to_one_finding_instance(self) -> None:
        write(
            self.root / "architecture.md",
            "# Arquitetura\n\nVer Q-AE-01 e Q-AE-02.\n",
        )
        baseline = self.validate()
        orphan_findings = [
            finding
            for finding in baseline["findings"]
            if finding["code"] == "orphan-question-reference"
        ]
        self.assertEqual(2, len(orphan_findings))
        waiver = Path(self.tempdir.name) / "review-waiver.json"
        write(
            waiver,
            json.dumps(
                {
                    "schema_version": 1,
                    "approved_by": "maintainer@example",
                    "reason": "Aceite explícito de somente uma ocorrência conhecida.",
                    "finding_ids": [orphan_findings[0]["id"]],
                }
            ),
        )
        result = self.validator.validate_review(
            self.root,
            doc_level="completo",
            waiver_path=waiver,
        )
        remaining_orphans = [
            finding
            for finding in result["unwaived_findings"]
            if finding["code"] == "orphan-question-reference"
        ]
        self.assertFalse(result["ok"])
        self.assertEqual(1, len(remaining_orphans))

    def test_invalid_waiver_does_not_cover_findings(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-AE-01.\n")
        waiver = Path(self.tempdir.name) / "review-waiver.json"
        write(
            waiver,
            json.dumps(
                {
                    "schema_version": 1,
                    "approved_by": "",
                    "reason": "curta",
                    "finding_ids": ["orphan-question-reference:invalid"],
                }
            ),
        )
        result = self.validator.validate_review(
            self.root,
            doc_level="completo",
            waiver_path=waiver,
        )
        self.assertFalse(result["ok"])
        self.assertFalse(result["waived"])
        self.assertEqual("invalid", result["waiver"]["status"])

    def test_cli_exit_code_and_read_only_behavior(self) -> None:
        write(self.root / "architecture.md", "# Arquitetura\n\nVer Q-ORPHAN-01.\n")
        before = {
            path.relative_to(self.root).as_posix(): path.read_bytes()
            for path in self.root.rglob("*")
            if path.is_file()
        }
        completed = subprocess.run(
            [
                sys.executable,
                str(VALIDATOR_PATH),
                str(self.root),
                "--doc-level",
                "completo",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        after = {
            path.relative_to(self.root).as_posix(): path.read_bytes()
            for path in self.root.rglob("*")
            if path.is_file()
        }
        self.assertEqual(1, completed.returncode)
        self.assertFalse(json.loads(completed.stdout)["ok"])
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main(verbosity=2)
