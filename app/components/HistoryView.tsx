"use client";

import { useState } from "react";
import type { ChildData } from "../lib/storage";
import { deleteMeasurement } from "../lib/storage";
import {
  getPercentile,
  getPercentileColor,
  getOrdinalSuffix,
} from "../lib/percentile";
import type { Dataset } from "../lib/percentile";
import { getAgeInMonths, formatAge, parseDate } from "../lib/ageCalculation";
import { formatHeight, formatWeight, formatHeadCircumference } from "../lib/parseUnits";

interface HistoryViewProps {
  child: ChildData;
  dataset: Dataset;
  onMeasurementDeleted: () => void;
}

export default function HistoryView({
  child,
  dataset,
  onMeasurementDeleted,
}: HistoryViewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (child.measurements.length === 0) {
    return (
      <div className="py-6 text-center text-sand-400 text-sm">
        No measurements recorded yet
      </div>
    );
  }

  const dob = parseDate(child.dateOfBirth);
  if (!dob) {
    return (
      <div className="py-6 text-center text-perc-red text-sm rounded-lg bg-perc-red/5">
        Invalid date of birth
      </div>
    );
  }

  const sortedMeasurements = [...child.measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (measurementId: string) => {
    deleteMeasurement(child.name, measurementId);
    setDeleteConfirm(null);
    onMeasurementDeleted();
  };

  const formatMeasurementDate = (dateStr: string) => {
    const date = parseDate(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPercentile = (
    value: number | undefined,
    type: "height" | "weight" | "head",
    ageMonths: number
  ) => {
    if (value === undefined) return <span className="text-sand-300">—</span>;

    const percentile = getPercentile(type, value, ageMonths, child.sex, dataset);
    if (percentile === null) {
      return <span className="text-sand-400">N/A</span>;
    }

    return (
      <span className={`font-semibold ${getPercentileColor(percentile)}`}>
        {getOrdinalSuffix(Math.round(percentile))}
      </span>
    );
  };

  return (
    <div>
      <p className="text-xs text-sand-400 uppercase tracking-wide font-medium mb-3">
        History
      </p>

      <div className="overflow-x-auto rounded-xl border border-sand-100">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-sand-100 bg-sand-50">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-sand-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-sand-400 uppercase tracking-wider">
                Age
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-sand-400 uppercase tracking-wider">
                Height
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-sand-400 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-sand-400 uppercase tracking-wider">
                Head
              </th>
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {sortedMeasurements.map((m, i) => {
              const measDate = parseDate(m.date);
              const ageMonths = measDate ? getAgeInMonths(dob, measDate) : 0;
              const isLast = i === sortedMeasurements.length - 1;

              return (
                <tr
                  key={m.id}
                  className={`hover:bg-sand-50 transition-colors ${!isLast ? "border-b border-sand-100" : ""}`}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-sand-700">
                    {formatMeasurementDate(m.date)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-sand-500">
                    {formatAge(ageMonths)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                    {m.height !== undefined ? (
                      <span>
                        <span className="text-sand-700 tabular-nums">
                          {formatHeight(m.height)}
                        </span>
                        <span className="ml-1.5">
                          {renderPercentile(m.height, "height", ageMonths)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sand-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                    {m.weight !== undefined ? (
                      <span>
                        <span className="text-sand-700 tabular-nums">
                          {formatWeight(m.weight)}
                        </span>
                        <span className="ml-1.5">
                          {renderPercentile(m.weight, "weight", ageMonths)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sand-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                    {m.headCircumference !== undefined ? (
                      <span>
                        <span className="text-sand-700 tabular-nums">
                          {formatHeadCircumference(m.headCircumference)}
                        </span>
                        <span className="ml-1.5">
                          {renderPercentile(m.headCircumference, "head", ageMonths)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sand-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right">
                    {deleteConfirm === m.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-xs font-medium text-perc-red hover:opacity-80"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs font-medium text-sand-500 hover:text-sand-700"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(m.id)}
                        className="text-sand-300 hover:text-perc-red transition-colors"
                        title="Delete measurement"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 3.5l8 0M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M5.5 6v4M8.5 6v4M4 3.5l.5 8a1 1 0 001 1h3a1 1 0 001-1l.5-8" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
