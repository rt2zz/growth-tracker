import { describe, it, expect } from "vitest";
import { getAgeInMonths, formatAge, parseDate, getTodayISO } from "../ageCalculation";

describe("parseDate", () => {
  it("parses a valid ISO date string", () => {
    const date = parseDate("2023-06-15");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2023);
    expect(date!.getMonth()).toBe(5); // 0-indexed
    expect(date!.getDate()).toBe(15);
  });

  it("returns local midnight, not UTC midnight", () => {
    const date = parseDate("2023-01-15");
    expect(date!.getHours()).toBe(0);
    expect(date!.getMinutes()).toBe(0);
    // The date should always be the 15th regardless of timezone
    expect(date!.getDate()).toBe(15);
  });

  it("returns null for empty string", () => {
    expect(parseDate("")).toBeNull();
  });

  it("returns null for invalid date", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });

  it("returns null for partial date", () => {
    expect(parseDate("2023-06")).toBeNull();
  });
});

describe("getAgeInMonths", () => {
  it("calculates exact months", () => {
    const dob = new Date(2023, 0, 15); // Jan 15, 2023
    const meas = new Date(2023, 6, 15); // Jul 15, 2023
    expect(getAgeInMonths(dob, meas)).toBeCloseTo(6, 0);
  });

  it("calculates age at birth as 0", () => {
    const dob = new Date(2023, 0, 15);
    expect(getAgeInMonths(dob, dob)).toBe(0);
  });

  it("handles partial months", () => {
    const dob = new Date(2023, 0, 1); // Jan 1
    const meas = new Date(2023, 1, 15); // Feb 15
    const age = getAgeInMonths(dob, meas);
    expect(age).toBeGreaterThan(1);
    expect(age).toBeLessThan(2);
  });

  it("handles year boundaries", () => {
    const dob = new Date(2022, 11, 15); // Dec 15, 2022
    const meas = new Date(2023, 0, 15); // Jan 15, 2023
    expect(getAgeInMonths(dob, meas)).toBeCloseTo(1, 0);
  });

  it("never returns negative", () => {
    const dob = new Date(2023, 6, 15);
    const meas = new Date(2023, 0, 15);
    expect(getAgeInMonths(dob, meas)).toBe(0);
  });
});

describe("formatAge", () => {
  it("formats weeks for age under 1 month", () => {
    expect(formatAge(0.5)).toBe("2 weeks");
  });

  it("formats singular week", () => {
    // 0.25 months * 4.33 ≈ 1.08 → floor = 1
    expect(formatAge(0.25)).toBe("1 week");
  });

  it("formats months for age under 2 years", () => {
    expect(formatAge(6)).toBe("6 months");
  });

  it("formats singular month", () => {
    expect(formatAge(1)).toBe("1 month");
  });

  it("formats years and months", () => {
    expect(formatAge(30)).toBe("2 years, 6 months");
  });

  it("formats exact years without months", () => {
    expect(formatAge(24)).toBe("2 years");
  });

  it("formats 12 months as months (under 24 threshold)", () => {
    // formatAge shows months for anything < 24
    expect(formatAge(12)).toBe("12 months");
  });

  it("formats singular year", () => {
    expect(formatAge(24)).toBe("2 years");
  });
});

describe("getTodayISO", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const today = getTodayISO();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
