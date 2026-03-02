"use client";

import {
  getPercentile,
  formatPercentile,
  getOrdinalSuffix,
} from "../lib/percentile";
import type { Sex, Dataset } from "../lib/percentile";
import { parseHeight, parseWeight, parseHeadCircumference } from "../lib/parseUnits";
import { getAgeInMonths, formatAge, parseDate } from "../lib/ageCalculation";

interface PercentileDisplayProps {
  height: string;
  weight: string;
  headCircumference: string;
  dateOfBirth: string;
  measurementDate: string;
  sex: Sex;
  dataset: Dataset;
  onDatasetChange: (dataset: Dataset) => void;
}

interface PercentileResult {
  value: number | null;
  percentile: number | null;
  unit: string;
}

function getColor(p: number): { text: string; bg: string; ring: string } {
  if (p < 3 || p > 97) return { text: "text-perc-red", bg: "bg-perc-red/10", ring: "ring-perc-red/20" };
  if (p < 10 || p > 90) return { text: "text-perc-amber", bg: "bg-perc-amber/10", ring: "ring-perc-amber/20" };
  return { text: "text-perc-green", bg: "bg-perc-green/10", ring: "ring-perc-green/20" };
}

export default function PercentileDisplay({
  height,
  weight,
  headCircumference,
  dateOfBirth,
  measurementDate,
  sex,
  dataset,
  onDatasetChange,
}: PercentileDisplayProps) {
  const dob = parseDate(dateOfBirth);
  const measDate = parseDate(measurementDate);

  if (!dob || !measDate) {
    return (
      <div className="py-8 text-center text-sand-400 text-sm">
        Enter dates to calculate percentiles
      </div>
    );
  }

  const ageMonths = getAgeInMonths(dob, measDate);

  if (ageMonths < 0) {
    return (
      <div className="py-6 text-center text-perc-red text-sm rounded-lg bg-perc-red/5">
        Measurement date cannot be before date of birth
      </div>
    );
  }

  const heightCm = parseHeight(height);
  const weightKg = parseWeight(weight);
  const headCm = parseHeadCircumference(headCircumference);

  const results: { label: string; icon: string; data: PercentileResult }[] = [
    {
      label: "Height",
      icon: "↕",
      data: {
        value: heightCm,
        percentile: heightCm ? getPercentile("height", heightCm, ageMonths, sex, dataset) : null,
        unit: "cm",
      },
    },
    {
      label: "Weight",
      icon: "◎",
      data: {
        value: weightKg,
        percentile: weightKg ? getPercentile("weight", weightKg, ageMonths, sex, dataset) : null,
        unit: "kg",
      },
    },
    {
      label: "Head",
      icon: "○",
      data: {
        value: headCm,
        percentile: headCm ? getPercentile("head", headCm, ageMonths, sex, dataset) : null,
        unit: "cm",
      },
    },
  ];

  const hasAnyData = results.some((r) => r.data.value !== null);

  if (!hasAnyData) {
    return (
      <div className="py-8 text-center text-sand-400 text-sm">
        Enter measurements to see percentiles
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-xs text-sand-400 uppercase tracking-wide font-medium">
          Percentiles <span className="normal-case tracking-normal font-normal">&middot; {formatAge(ageMonths)}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDatasetChange("cdc")}
            className={`text-xs uppercase tracking-wide pb-0.5 transition-all ${
              dataset === "cdc"
                ? "text-sand-700 font-medium border-b border-sand-700"
                : "text-sand-400 border-b border-transparent hover:text-sand-500"
            }`}
          >
            CDC
          </button>
          <button
            type="button"
            onClick={() => onDatasetChange("who")}
            className={`text-xs uppercase tracking-wide pb-0.5 transition-all ${
              dataset === "who"
                ? "text-sand-700 font-medium border-b border-sand-700"
                : "text-sand-400 border-b border-transparent hover:text-sand-500"
            }`}
          >
            WHO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {results.map(({ label, data }) => {
          if (data.value === null) {
            return (
              <div key={label} className="rounded-xl bg-sand-50 border border-sand-100 p-4 text-center">
                <div className="text-xs text-sand-300 mb-1">{label}</div>
                <div className="text-sand-300 text-lg">—</div>
              </div>
            );
          }

          const pct = data.percentile;
          const colors = pct !== null ? getColor(pct) : null;

          return (
            <div
              key={label}
              className={`rounded-xl p-4 text-center ring-1 ${colors ? `${colors.bg} ${colors.ring}` : "bg-sand-50 ring-sand-100"}`}
            >
              <div className="text-xs text-sand-500 mb-2">{label}</div>
              {pct !== null ? (
                <>
                  <div className={`text-2xl font-bold tabular-nums ${colors!.text}`}>
                    {getOrdinalSuffix(Math.round(pct))}
                  </div>
                  <div className="text-[11px] text-sand-400 mt-1">
                    {formatPercentile(pct)}
                  </div>
                </>
              ) : (
                <div className="text-sm text-sand-400">N/A</div>
              )}
              <div className="text-xs text-sand-400 mt-2 font-medium tabular-nums">
                {data.value.toFixed(1)} {data.unit}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-sand-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-perc-green" />
          10–90%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-perc-amber" />
          3–10 / 90–97%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-perc-red" />
          &lt;3 / &gt;97%
        </span>
      </div>
    </div>
  );
}
