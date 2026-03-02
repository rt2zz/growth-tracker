import { describe, it, expect } from "vitest";
import {
  calculateZScore,
  zScoreToPercentile,
  getPercentile,
  getPercentileColor,
  formatPercentile,
  getOrdinalSuffix,
} from "../percentile";

describe("calculateZScore", () => {
  it("returns 0 when value equals M", () => {
    // When value == M, (value/M)^L = 1, so (1-1)/(L*S) = 0
    expect(calculateZScore(10, 1, 10, 0.1)).toBeCloseTo(0);
  });

  it("returns positive z-score for value above median", () => {
    expect(calculateZScore(12, 1, 10, 0.1)).toBeGreaterThan(0);
  });

  it("returns negative z-score for value below median", () => {
    expect(calculateZScore(8, 1, 10, 0.1)).toBeLessThan(0);
  });

  it("handles L=0 case using log formula", () => {
    const z = calculateZScore(10, 0, 10, 0.1);
    expect(z).toBeCloseTo(0);

    const z2 = calculateZScore(Math.E, 0, 1, 1);
    expect(z2).toBeCloseTo(1);
  });
});

describe("zScoreToPercentile", () => {
  it("returns 50 for z-score of 0", () => {
    expect(zScoreToPercentile(0)).toBeCloseTo(50, 0);
  });

  it("returns >50 for z-score of 1", () => {
    const p = zScoreToPercentile(1);
    expect(p).toBeGreaterThan(80);
    expect(p).toBeLessThan(90);
  });

  it("returns <50 for z-score of -1", () => {
    const p = zScoreToPercentile(-1);
    expect(p).toBeGreaterThan(10);
    expect(p).toBeLessThan(20);
  });

  it("is symmetric around 50", () => {
    const p1 = zScoreToPercentile(1);
    const p2 = zScoreToPercentile(-1);
    expect(p1 + p2).toBeCloseTo(100, 5);
  });

  it("returns >97 for z-score of 2", () => {
    const p = zScoreToPercentile(2);
    expect(p).toBeGreaterThan(97);
    expect(p).toBeLessThan(100);
  });

  it("returns <3 for z-score of -2", () => {
    const p = zScoreToPercentile(-2);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(3);
  });
});

describe("getPercentile", () => {
  it("returns a percentile for a valid measurement", () => {
    // Newborn male weight ~3.5kg should be near 50th percentile (CDC)
    const p = getPercentile("weight", 3.53, 0, "male", "cdc");
    expect(p).not.toBeNull();
    expect(p!).toBeGreaterThan(40);
    expect(p!).toBeLessThan(60);
  });

  it("returns null for negative value", () => {
    expect(getPercentile("weight", -1, 6, "male", "cdc")).toBeNull();
  });

  it("returns null for age outside data range", () => {
    // 300 months is beyond data range
    expect(getPercentile("weight", 50, 300, "male", "cdc")).toBeNull();
  });

  it("works with WHO dataset", () => {
    const p = getPercentile("weight", 3.3, 0, "female", "who");
    expect(p).not.toBeNull();
    expect(p!).toBeGreaterThan(30);
    expect(p!).toBeLessThan(70);
  });

  it("handles the last age entry exactly", () => {
    // WHO head data goes up to 24 months in official CDC-hosted files
    // This tests the binary search edge case fix
    const p = getPercentile("head", 48, 24, "male", "who");
    expect(p).not.toBeNull();
  });

  it("interpolates between data points", () => {
    // Age 6.5 months should interpolate between 6 and 7
    const p = getPercentile("height", 67, 6.5, "male", "cdc");
    expect(p).not.toBeNull();
  });
});

describe("getPercentileColor", () => {
  it("returns red for extreme percentiles", () => {
    expect(getPercentileColor(1)).toBe("text-perc-red");
    expect(getPercentileColor(99)).toBe("text-perc-red");
  });

  it("returns amber for slightly unusual percentiles", () => {
    expect(getPercentileColor(5)).toBe("text-perc-amber");
    expect(getPercentileColor(95)).toBe("text-perc-amber");
  });

  it("returns green for normal percentiles", () => {
    expect(getPercentileColor(50)).toBe("text-perc-green");
    expect(getPercentileColor(10)).toBe("text-perc-green");
    expect(getPercentileColor(90)).toBe("text-perc-green");
  });
});

describe("formatPercentile", () => {
  it("formats a number to one decimal place", () => {
    expect(formatPercentile(50.123)).toBe("50.1%");
  });

  it("returns N/A for null", () => {
    expect(formatPercentile(null)).toBe("N/A");
  });
});

describe("getOrdinalSuffix", () => {
  it("handles 1st, 2nd, 3rd", () => {
    expect(getOrdinalSuffix(1)).toBe("1st");
    expect(getOrdinalSuffix(2)).toBe("2nd");
    expect(getOrdinalSuffix(3)).toBe("3rd");
  });

  it("handles 11th, 12th, 13th (special teen cases)", () => {
    expect(getOrdinalSuffix(11)).toBe("11th");
    expect(getOrdinalSuffix(12)).toBe("12th");
    expect(getOrdinalSuffix(13)).toBe("13th");
  });

  it("handles 21st, 22nd, 23rd", () => {
    expect(getOrdinalSuffix(21)).toBe("21st");
    expect(getOrdinalSuffix(22)).toBe("22nd");
    expect(getOrdinalSuffix(23)).toBe("23rd");
  });

  it("handles general th cases", () => {
    expect(getOrdinalSuffix(4)).toBe("4th");
    expect(getOrdinalSuffix(50)).toBe("50th");
    expect(getOrdinalSuffix(100)).toBe("100th");
  });
});
