import { describe, it, expect } from "vitest";
import {
  parseHeight,
  parseWeight,
  parseHeadCircumference,
  formatHeight,
  formatWeight,
  formatHeadCircumference,
} from "../parseUnits";

describe("parseHeight", () => {
  it("returns null for empty input", () => {
    expect(parseHeight("")).toBeNull();
    expect(parseHeight("  ")).toBeNull();
  });

  it("parses centimeters", () => {
    expect(parseHeight("63.5cm")).toBeCloseTo(63.5);
    expect(parseHeight("63.5 cm")).toBeCloseTo(63.5);
  });

  it("parses inches (bare number defaults to inches)", () => {
    expect(parseHeight("25")).toBeCloseTo(25 * 2.54);
    expect(parseHeight("25in")).toBeCloseTo(25 * 2.54);
    expect(parseHeight('25"')).toBeCloseTo(25 * 2.54);
    expect(parseHeight("25 inches")).toBeCloseTo(25 * 2.54);
  });

  it("parses feet and inches", () => {
    // 2'1" = 25 inches = 63.5 cm
    expect(parseHeight("2' 1\"")).toBeCloseTo(25 * 2.54);
    expect(parseHeight("2ft 1in")).toBeCloseTo(25 * 2.54);
    expect(parseHeight("2'1\"")).toBeCloseTo(25 * 2.54);
  });

  it("parses feet only", () => {
    expect(parseHeight("2'")).toBeCloseTo(24 * 2.54);
    expect(parseHeight("2ft")).toBeCloseTo(24 * 2.54);
  });

  it("returns null for unparseable input", () => {
    expect(parseHeight("abc")).toBeNull();
  });
});

describe("parseWeight", () => {
  it("returns null for empty input", () => {
    expect(parseWeight("")).toBeNull();
    expect(parseWeight("  ")).toBeNull();
  });

  it("parses kilograms", () => {
    expect(parseWeight("6.8kg")).toBeCloseTo(6.8);
    expect(parseWeight("6.8 kg")).toBeCloseTo(6.8);
  });

  it("parses pounds", () => {
    expect(parseWeight("15 lbs")).toBeCloseTo(15 * 0.453592, 3);
    expect(parseWeight("15lbs")).toBeCloseTo(15 * 0.453592, 3);
    expect(parseWeight("15 lb")).toBeCloseTo(15 * 0.453592, 3);
  });

  it("parses bare number as pounds", () => {
    expect(parseWeight("15")).toBeCloseTo(15 * 0.453592, 3);
  });

  it("parses ounces", () => {
    expect(parseWeight("15 oz")).toBeCloseTo(15 * 0.0283495, 3);
  });

  it("parses pounds and ounces", () => {
    // 7lb 4oz = 7.25 lbs
    expect(parseWeight("7lb 4oz")).toBeCloseTo(7.25 * 0.453592, 3);
    expect(parseWeight("7 lbs 4 oz")).toBeCloseTo(7.25 * 0.453592, 3);
  });

  it("returns null for unparseable input", () => {
    expect(parseWeight("abc")).toBeNull();
  });
});

describe("parseHeadCircumference", () => {
  it("returns null for empty input", () => {
    expect(parseHeadCircumference("")).toBeNull();
  });

  it("parses centimeters", () => {
    expect(parseHeadCircumference("35.5cm")).toBeCloseTo(35.5);
  });

  it("parses inches (bare number defaults to inches)", () => {
    expect(parseHeadCircumference("14")).toBeCloseTo(14 * 2.54);
    expect(parseHeadCircumference('14"')).toBeCloseTo(14 * 2.54);
    expect(parseHeadCircumference("14 in")).toBeCloseTo(14 * 2.54);
  });
});

describe("formatHeight", () => {
  it("formats cm with imperial equivalent", () => {
    const result = formatHeight(63.5);
    expect(result).toContain("63.5 cm");
    expect(result).toContain("2'");
  });
});

describe("formatWeight", () => {
  it("formats kg with imperial equivalent", () => {
    const result = formatWeight(6.8);
    expect(result).toContain("6.80 kg");
    expect(result).toContain("lbs");
  });
});

describe("formatHeadCircumference", () => {
  it("formats cm with imperial equivalent", () => {
    const result = formatHeadCircumference(35.5);
    expect(result).toContain("35.5 cm");
    expect(result).toContain('"');
  });
});
