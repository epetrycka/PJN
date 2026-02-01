import argparse
import math
from typing import List, Tuple

from common import load_or_build_frequency, write_json, zipf_path


def linear_regression(points: List[Tuple[float, float]]) -> Tuple[float, float, float]:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    n = len(points)
    sum_x = sum(xs)
    sum_y = sum(ys)
    sum_xy = sum(x * y for x, y in points)
    sum_xx = sum(x * x for x in xs)
    denominator = n * sum_xx - sum_x * sum_x
    slope = (n * sum_xy - sum_x * sum_y) / denominator if denominator else 0.0
    intercept = (sum_y - slope * sum_x) / n if n else 0.0
    mean_y = sum_y / n if n else 0.0
    ss_tot = sum((y - mean_y) ** 2 for y in ys)
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in points)
    r_squared = 1 - ss_res / ss_tot if ss_tot else 0.0
    return slope, intercept, r_squared


def main() -> None:
    parser = argparse.ArgumentParser(description="Analiza prawa Zipfa dla korpusu.")
    parser.add_argument(
        "--max-points",
        type=int,
        default=2000,
        help="Maksymalna liczba punktów (rang) wykorzystanych w regresji.",
    )
    args = parser.parse_args()

    frequency_payload = load_or_build_frequency()
    table = frequency_payload["data"]
    limit = min(len(table), args.max_points)
    points = []
    chart_points = []
    for entry in table[:limit]:
        rank = entry["rank"]
        freq = entry["count"]
        log_rank = math.log(rank)
        log_freq = math.log(freq)
        points.append((log_rank, log_freq))
        chart_points.append(
            {
                "rank": rank,
                "word": entry["word"],
                "frequency": freq,
                "log_rank": log_rank,
                "log_frequency": log_freq,
            }
        )

    slope, intercept, r_squared = linear_regression(points)

    payload = {
        "metadata": {
            "points_count": limit,
            "slope": slope,
            "intercept": intercept,
            "r_squared": r_squared,
            "expected_frequency_factor": math.exp(intercept),
        },
        "points": chart_points,
    }

    output_path = zipf_path()
    write_json(output_path, payload)
    print(
        f"Zipf: nachylenie={slope:.3f}, R^2={r_squared:.3f}, punkty={limit} -> {output_path}"
    )


if __name__ == "__main__":
    main()
