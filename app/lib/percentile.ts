/**
 * LMS-based percentile calculation using CDC and WHO growth data
 */

import cdcWeightData from "../data/cdc/weight-for-age.json";
import cdcHeightData from "../data/cdc/height-for-age.json";
import cdcHeadData from "../data/cdc/head-for-age.json";
import whoWeightData from "../data/who/weight-for-age.json";
import whoHeightData from "../data/who/height-for-age.json";
import whoHeadData from "../data/who/head-for-age.json";

export type Sex = "male" | "female";
export type Dataset = "cdc" | "who";
export type MeasurementType = "weight" | "height" | "head";

interface LMSEntry {
  ageMonths: number;
  L: number;
  M: number;
  S: number;
}

interface LMSData {
  male: LMSEntry[];
  female: LMSEntry[];
}

const datasets: Record<Dataset, Record<MeasurementType, LMSData>> = {
  cdc: {
    weight: cdcWeightData as LMSData,
    height: cdcHeightData as LMSData,
    head: cdcHeadData as LMSData,
  },
  who: {
    weight: whoWeightData as LMSData,
    height: whoHeightData as LMSData,
    head: whoHeadData as LMSData,
  },
};

/**
 * Calculate Z-score using LMS method
 * Formula: Z = [(value/M)^L - 1] / (L * S) when L ≠ 0
 *          Z = ln(value/M) / S when L = 0
 */
export function calculateZScore(
  value: number,
  L: number,
  M: number,
  S: number
): number {
  if (L === 0) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Convert Z-score to percentile using standard normal CDF
 * Uses approximation for the cumulative distribution function
 */
export function zScoreToPercentile(z: number): number {
  // Approximation of the standard normal CDF using Zelen & Severo approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z);

  const t = 1.0 / (1.0 + p * z);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z / 2);

  const cdf = 0.5 * (1.0 + sign * y);
  return cdf * 100;
}

/**
 * Interpolate LMS values for a given age.
 * Data arrays are assumed to be pre-sorted by ageMonths (as in the JSON files).
 * Returns null if age is outside the data range.
 */
function interpolateLMS(
  data: LMSEntry[],
  ageMonths: number
): { L: number; M: number; S: number } | null {
  if (data.length === 0) return null;

  const minAge = data[0].ageMonths;
  const maxAge = data[data.length - 1].ageMonths;

  if (ageMonths < minAge || ageMonths > maxAge) {
    return null;
  }

  // Binary search for the interval containing ageMonths
  let lo = 0;
  let hi = data.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (data[mid].ageMonths <= ageMonths) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const lower = data[lo];
  const upper = data[hi];

  // Exact match
  if (lower.ageMonths === ageMonths) {
    return { L: lower.L, M: lower.M, S: lower.S };
  }
  if (upper.ageMonths === ageMonths) {
    return { L: upper.L, M: upper.M, S: upper.S };
  }

  // Linear interpolation
  const fraction =
    (ageMonths - lower.ageMonths) / (upper.ageMonths - lower.ageMonths);

  return {
    L: lower.L + (upper.L - lower.L) * fraction,
    M: lower.M + (upper.M - lower.M) * fraction,
    S: lower.S + (upper.S - lower.S) * fraction,
  };
}

/**
 * Get percentile for a measurement
 * @param measurement Type of measurement (weight, height, head)
 * @param value Value in metric units (kg for weight, cm for height/head)
 * @param ageMonths Age in months
 * @param sex Male or female
 * @param dataset CDC or WHO
 * @returns Percentile (0-100) or null if outside data range
 */
export function getPercentile(
  measurement: MeasurementType,
  value: number,
  ageMonths: number,
  sex: Sex,
  dataset: Dataset
): number | null {
  if (value <= 0 || ageMonths < 0) return null;

  const data = datasets[dataset][measurement][sex];
  const lms = interpolateLMS(data, ageMonths);

  if (!lms) return null;

  const zScore = calculateZScore(value, lms.L, lms.M, lms.S);
  return zScoreToPercentile(zScore);
}

/**
 * Get percentile color class based on value
 */
export function getPercentileColor(percentile: number): string {
  if (percentile < 3 || percentile > 97) {
    return "text-perc-red";
  }
  if (percentile < 10 || percentile > 90) {
    return "text-perc-amber";
  }
  return "text-perc-green";
}

/**
 * Format percentile for display
 */
export function formatPercentile(percentile: number | null): string {
  if (percentile === null) return "N/A";
  return `${percentile.toFixed(1)}%`;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n.toFixed(0) + (s[(v - 20) % 10] || s[v] || s[0]);
}
