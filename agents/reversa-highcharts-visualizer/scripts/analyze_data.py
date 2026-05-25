#!/usr/bin/env python3
"""
Analyzes data and suggests the best Highcharts chart type.

Calculates descriptive statistics and infers the nature of the data
in order to recommend appropriate chart types.

Usage:
    python analyze_data.py <file> [--format json|text]
    python analyze_data.py data.csv --suggest-chart

Output:
    Statistics + chart type suggestions.
"""

import argparse
import json
import re
import sys
from pathlib import Path


def is_temporal(values: list) -> bool:
    """Detect whether a list of values appears to be temporal."""
    date_patterns = [
        r"\d{4}[-/]\d{1,2}[-/]\d{1,2}",
        r"\d{1,2}[-/]\d{1,2}[-/]\d{4}",
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)",
        r"Q[1-4]\s*\d{4}",
        r"\d{4}",
    ]
    if not values:
        return False
    matches = 0
    sample = values[:20]
    for value in sample:
        for pattern in date_patterns:
            if re.search(pattern, str(value), re.IGNORECASE):
                matches += 1
                break
    return matches / len(sample) > 0.6


def analyze_series(values: list) -> dict:
    """Analyze a series of numeric values."""
    numbers = [value for value in values if isinstance(value, (int, float)) and value is not None]
    if not numbers:
        return {"type": "non_numeric", "count": len(values)}

    numbers.sort()
    count = len(numbers)
    total = sum(numbers)
    mean = total / count
    variance = sum((number - mean) ** 2 for number in numbers) / count

    return {
        "type": "numeric",
        "count": count,
        "min": min(numbers),
        "max": max(numbers),
        "mean": round(mean, 2),
        "median": numbers[count // 2],
        "std": round(variance ** 0.5, 2),
        "sum": round(total, 2),
        "has_negatives": any(number < 0 for number in numbers),
        "all_integers": all(number == int(number) for number in numbers),
        "all_positive": all(number >= 0 for number in numbers),
        "range": max(numbers) - min(numbers),
        "unique_values": len(set(numbers)),
    }


def suggest_charts(categories: list, series_analysis: list, n_series: int) -> list:
    """Suggest chart types based on the analysis."""
    suggestions = []
    temporal = is_temporal(categories)
    n_categories = len(categories)
    all_positive = all(series.get("all_positive", True) for series in series_analysis)

    # Temporal data → line/area.
    if temporal:
        suggestions.append({
            "type": "line",
            "score": 95,
            "reason": "Temporal data — ideal for showing trends over time",
        })
        suggestions.append({
            "type": "area",
            "score": 85,
            "reason": "Temporal data — area emphasizes volume/magnitude",
        })
        if n_series > 1 and all_positive:
            suggestions.append({
                "type": "stacked_area",
                "score": 80,
                "reason": "Multiple temporal series — shows composition over time",
            })

    # Few categorical points → column/bar.
    if n_categories <= 20:
        suggestions.append({
            "type": "column",
            "score": 90 if not temporal else 70,
            "reason": f"{n_categories} categories — good for direct comparison",
        })
        if n_categories > 8:
            suggestions.append({
                "type": "bar",
                "score": 85,
                "reason": "Many categories — horizontal bars improve label readability",
            })

    # One series with few items → pie.
    if n_series == 1 and n_categories <= 8 and all_positive:
        suggestions.append({
            "type": "pie",
            "score": 80,
            "reason": "One series with a few categories — shows proportion/composition",
        })

    # Two or more numeric series → scatter.
    if n_series >= 2 and all(series.get("type") == "numeric" for series in series_analysis):
        suggestions.append({
            "type": "scatter",
            "score": 70,
            "reason": "Multiple numeric series — shows correlation between variables",
        })

    # Large matrices → heatmap.
    if n_categories > 20 and n_series > 5:
        suggestions.append({
            "type": "heatmap",
            "score": 75,
            "reason": "Many categories x series — heatmap reveals matrix patterns",
        })

    # Single KPI → gauge.
    if n_series == 1 and n_categories == 1:
        suggestions.append({
            "type": "solidgauge",
            "score": 85,
            "reason": "Single value — ideal for KPI/progress indicators",
        })

    # Stacked composition.
    if n_series > 1 and n_categories <= 15 and all_positive:
        suggestions.append({
            "type": "stacked_column",
            "score": 75,
            "reason": "Multiple positive series — shows composition by category",
        })

    suggestions.sort(key=lambda item: item["score"], reverse=True)
    return suggestions[:5]


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze data and suggest charts")
    parser.add_argument("filepath", help="Path to the file")
    parser.add_argument("--format", choices=["json", "text"], default="json")
    parser.add_argument("--suggest-chart", action="store_true", default=True)
    parser.add_argument("--encoding", default=None)
    parser.add_argument("--sheet", default=None)
    args = parser.parse_args()

    # Import parse_data from the same directory.
    script_dir = Path(__file__).parent
    sys.path.insert(0, str(script_dir))
    from parse_data import detect_encoding, parse_csv, parse_excel, parse_json_data

    path = Path(args.filepath)
    extension = path.suffix.lower()

    if extension in (".csv", ".tsv", ".txt"):
        encoding = args.encoding or detect_encoding(str(path))
        parsed = parse_csv(str(path), encoding=encoding)
    elif extension == ".json":
        parsed = parse_json_data(str(path))
    elif extension in (".xlsx", ".xls"):
        parsed = parse_excel(str(path), sheet=args.sheet)
    else:
        print(f"[ERROR] Unsupported format: {extension}", file=sys.stderr)
        sys.exit(1)

    if "error" in parsed:
        print(f"[ERROR] {parsed['error']}", file=sys.stderr)
        sys.exit(1)

    series_analysis = []
    for series in parsed.get("series", []):
        analysis = analyze_series(series["data"])
        analysis["name"] = series["name"]
        series_analysis.append(analysis)

    categories = parsed.get("categories", [])
    suggestions = suggest_charts(categories, series_analysis, len(series_analysis))

    result = {
        "data_summary": {
            "categories_count": len(categories),
            "series_count": len(series_analysis),
            "is_temporal": is_temporal(categories),
            "sample_categories": categories[:5],
        },
        "series_analysis": series_analysis,
        "chart_suggestions": suggestions,
    }

    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("=== Data Summary ===")
        print(f"Categories: {len(categories)} ({'temporal' if is_temporal(categories) else 'categorical'})")
        print(f"Series: {len(series_analysis)}")
        for series in series_analysis:
            print(
                f"  • {series['name']}: min={series.get('min')}, max={series.get('max')}, "
                f"mean={series.get('mean')}, {series.get('count')} points"
            )
        print("\n=== Suggested Charts ===")
        for index, suggestion in enumerate(suggestions, 1):
            print(f"  {index}. {suggestion['type']} (score: {suggestion['score']})")
            print(f"     {suggestion['reason']}")


if __name__ == "__main__":
    main()
