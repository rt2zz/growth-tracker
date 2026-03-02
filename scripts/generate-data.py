#!/usr/bin/env python3
"""
Regenerate LMS growth data JSON files from official CDC and WHO sources.

CDC sources (https://www.cdc.gov/growthcharts/cdc-data-files.htm):
  - wtageinf.csv: Weight-for-age, birth to 36 months
  - wtage.csv: Weight-for-age, 2 to 20 years
  - lenageinf.csv: Length-for-age, birth to 36 months
  - statage.csv: Stature-for-age, 2 to 20 years
  - hcageinf.csv: Head circumference-for-age, birth to 36 months

WHO sources (https://www.cdc.gov/growthcharts/who-data-files.htm):
  - WHO-Boys-Weight-for-age-Percentiles.csv
  - WHO-Girls-Weight-for-age Percentiles.csv
  - WHO-Boys-Length-for-age-Percentiles.csv
  - WHO-Girls-Length-for-age-Percentiles.csv
  - WHO-Boys-Head-Circumference-for-age-Percentiles.csv
  - WHO-Girls-Head-Circumference-for-age-Percentiles.csv

Note: CDC data uses half-month age points (0, 0.5, 1.5, 2.5, ...).
WHO CDC-hosted data uses whole-month points and covers birth to 24 months.
"""

import csv
import io
import json
import os
import urllib.request

CDC_BASE = "https://www.cdc.gov/growthcharts/data/zscore"
WHO_BASE = "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts"

CDC_FILES = {
    "weight_infant": f"{CDC_BASE}/wtageinf.csv",
    "weight_child": f"{CDC_BASE}/wtage.csv",
    "height_infant": f"{CDC_BASE}/lenageinf.csv",
    "height_child": f"{CDC_BASE}/statage.csv",
    "head_infant": f"{CDC_BASE}/hcageinf.csv",
}

WHO_FILES = {
    "weight_male": f"{WHO_BASE}/WHO-Boys-Weight-for-age-Percentiles.csv",
    "weight_female": f"{WHO_BASE}/WHO-Girls-Weight-for-age%20Percentiles.csv",
    "height_male": f"{WHO_BASE}/WHO-Boys-Length-for-age-Percentiles.csv",
    "height_female": f"{WHO_BASE}/WHO-Girls-Length-for-age-Percentiles.csv",
    "head_male": f"{WHO_BASE}/WHO-Boys-Head-Circumference-for-age-Percentiles.csv",
    "head_female": f"{WHO_BASE}/WHO-Girls-Head-Circumference-for-age-Percentiles.csv",
}


def download(url: str) -> str:
    """Download a URL and return decoded text with normalized line endings."""
    print(f"  Downloading {url.split('/')[-1]}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
    return raw.decode("utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")


def parse_cdc_csv(text: str, sex_code: int) -> list[dict]:
    """Parse a CDC CSV (Sex,Agemos,L,M,S,...) and return LMS entries for given sex.
    sex_code: 1=male, 2=female.
    Skips duplicate header rows that appear between male/female sections.
    """
    rows = []
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        sv = row.get("Sex", "").strip()
        if sv == "Sex" or not sv:
            continue
        if int(sv) == sex_code:
            rows.append({
                "ageMonths": round(float(row["Agemos"]), 2),
                "L": round(float(row["L"]), 8),
                "M": round(float(row["M"]), 8),
                "S": round(float(row["S"]), 8),
            })
    return rows


def parse_who_csv(text: str) -> list[dict]:
    """Parse a WHO CSV (Month,L,M,S,...) and return LMS entries."""
    rows = []
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        rows.append({
            "ageMonths": round(float(row["Month"]), 2),
            "L": round(float(row["L"]), 8),
            "M": round(float(row["M"]), 8),
            "S": round(float(row["S"]), 8),
        })
    return rows


def merge_cdc_ranges(infant_entries: list[dict], child_entries: list[dict]) -> list[dict]:
    """Merge infant (0-36mo) and child (24-240mo) CDC data.
    For overlapping ages (24-36mo), prefer infant data as it's measured recumbent
    and the transition is at 24 months. Include child data from 36.5+ months.
    """
    max_infant_age = max(e["ageMonths"] for e in infant_entries)
    merged = list(infant_entries)
    for entry in child_entries:
        if entry["ageMonths"] > max_infant_age:
            merged.append(entry)
    merged.sort(key=lambda e: e["ageMonths"])
    return merged


def write_json(data: dict, path: str):
    """Write LMS data to a JSON file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    count_m = len(data["male"])
    count_f = len(data["female"])
    print(f"  Wrote {path} ({count_m} male, {count_f} female entries)")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "..", "app", "data")

    # Download all CDC files
    print("Downloading CDC data...")
    cdc_texts = {}
    for key, url in CDC_FILES.items():
        cdc_texts[key] = download(url)

    # Download all WHO files
    print("\nDownloading WHO data...")
    who_texts = {}
    for key, url in WHO_FILES.items():
        who_texts[key] = download(url)

    # Generate CDC JSON files
    print("\nGenerating CDC JSON files...")

    # CDC Weight-for-age
    write_json({
        "male": merge_cdc_ranges(
            parse_cdc_csv(cdc_texts["weight_infant"], 1),
            parse_cdc_csv(cdc_texts["weight_child"], 1),
        ),
        "female": merge_cdc_ranges(
            parse_cdc_csv(cdc_texts["weight_infant"], 2),
            parse_cdc_csv(cdc_texts["weight_child"], 2),
        ),
    }, os.path.join(data_dir, "cdc", "weight-for-age.json"))

    # CDC Height-for-age (length for infants, stature for children)
    write_json({
        "male": merge_cdc_ranges(
            parse_cdc_csv(cdc_texts["height_infant"], 1),
            parse_cdc_csv(cdc_texts["height_child"], 1),
        ),
        "female": merge_cdc_ranges(
            parse_cdc_csv(cdc_texts["height_infant"], 2),
            parse_cdc_csv(cdc_texts["height_child"], 2),
        ),
    }, os.path.join(data_dir, "cdc", "height-for-age.json"))

    # CDC Head circumference (infants only, 0-36 months)
    write_json({
        "male": parse_cdc_csv(cdc_texts["head_infant"], 1),
        "female": parse_cdc_csv(cdc_texts["head_infant"], 2),
    }, os.path.join(data_dir, "cdc", "head-for-age.json"))

    # Generate WHO JSON files
    print("\nGenerating WHO JSON files...")

    # WHO Weight-for-age
    write_json({
        "male": parse_who_csv(who_texts["weight_male"]),
        "female": parse_who_csv(who_texts["weight_female"]),
    }, os.path.join(data_dir, "who", "weight-for-age.json"))

    # WHO Length-for-age
    write_json({
        "male": parse_who_csv(who_texts["height_male"]),
        "female": parse_who_csv(who_texts["height_female"]),
    }, os.path.join(data_dir, "who", "height-for-age.json"))

    # WHO Head circumference
    write_json({
        "male": parse_who_csv(who_texts["head_male"]),
        "female": parse_who_csv(who_texts["head_female"]),
    }, os.path.join(data_dir, "who", "head-for-age.json"))

    print("\nDone! All data files regenerated from official sources.")
    print("\nNotes:")
    print("  - CDC data uses half-month age intervals (0, 0.5, 1.5, 2.5, ...)")
    print("  - WHO data covers birth to 24 months only (CDC-hosted version)")
    print("  - CDC weight/height data covers birth to 240 months (20 years)")
    print("  - CDC head circumference covers birth to 36 months")


if __name__ == "__main__":
    main()
