/**
 * Flexible unit parsing for height and weight inputs
 * Default: imperial (inches for height, lbs for weight)
 */

/**
 * Parse height input and return value in centimeters
 * Supports: 25", 25 inches, 25 in, 2' 1", 2ft 1in, 63.5cm, 63.5 cm
 */
export function parseHeight(input: string): number | null {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim().toLowerCase();

  // Check for centimeters first
  const cmMatch = trimmed.match(/^([\d.]+)\s*cm$/);
  if (cmMatch) {
    const cm = parseFloat(cmMatch[1]);
    return isNaN(cm) ? null : cm;
  }

  // Check for feet and inches: 2' 1", 2ft 1in, 2'1"
  const feetInchesMatch = trimmed.match(
    /^(\d+)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inches?)?$/
  );
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10);
    const inches = parseFloat(feetInchesMatch[2]);
    if (!isNaN(feet) && !isNaN(inches)) {
      const totalInches = feet * 12 + inches;
      return totalInches * 2.54;
    }
  }

  // Check for feet only: 2', 2ft, 2 feet
  const feetOnlyMatch = trimmed.match(/^(\d+)\s*(?:'|ft|feet)$/);
  if (feetOnlyMatch) {
    const feet = parseInt(feetOnlyMatch[1], 10);
    if (!isNaN(feet)) {
      return feet * 12 * 2.54;
    }
  }

  // Check for inches: 25", 25 inches, 25 in, 25in
  const inchesMatch = trimmed.match(/^([\d.]+)\s*(?:"|in|inches?)?$/);
  if (inchesMatch) {
    const inches = parseFloat(inchesMatch[1]);
    if (!isNaN(inches)) {
      return inches * 2.54;
    }
  }

  return null;
}

/**
 * Parse weight input and return value in kilograms
 * Supports: 15 lbs, 15 lb, 15 pounds, 6.8kg, 6.8 kg
 */
export function parseWeight(input: string): number | null {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim().toLowerCase();

  // Check for kilograms first
  const kgMatch = trimmed.match(/^([\d.]+)\s*kg$/);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    return isNaN(kg) ? null : kg;
  }

  // Check for pounds: 15 lbs, 15 lb, 15 pounds, 15lbs
  const lbsMatch = trimmed.match(/^([\d.]+)\s*(?:lbs?|pounds?)$/);
  if (lbsMatch) {
    const lbs = parseFloat(lbsMatch[1]);
    if (!isNaN(lbs)) {
      return lbs * 0.453592;
    }
  }

  // Check for ounces (for infants): 15 oz, 15 ounces
  const ozMatch = trimmed.match(/^([\d.]+)\s*(?:oz|ounces?)$/);
  if (ozMatch) {
    const oz = parseFloat(ozMatch[1]);
    if (!isNaN(oz)) {
      return oz * 0.0283495;
    }
  }

  // Check for pounds and ounces: 7lb 4oz, 7 lbs 4 oz
  const lbsOzMatch = trimmed.match(
    /^(\d+)\s*(?:lbs?|pounds?)\s+(\d+(?:\.\d+)?)\s*(?:oz|ounces?)?$/
  );
  if (lbsOzMatch) {
    const lbs = parseInt(lbsOzMatch[1], 10);
    const oz = parseFloat(lbsOzMatch[2]);
    if (!isNaN(lbs) && !isNaN(oz)) {
      return (lbs + oz / 16) * 0.453592;
    }
  }

  // Default: assume pounds (imperial default)
  const numericMatch = trimmed.match(/^([\d.]+)$/);
  if (numericMatch) {
    const lbs = parseFloat(numericMatch[1]);
    if (!isNaN(lbs)) {
      return lbs * 0.453592;
    }
  }

  return null;
}

/**
 * Parse head circumference input and return value in centimeters
 * Supports: 14", 14 inches, 14 in, 35.5cm, 35.5 cm
 */
export function parseHeadCircumference(input: string): number | null {
  if (!input || !input.trim()) return null;

  const trimmed = input.trim().toLowerCase();

  // Check for centimeters first
  const cmMatch = trimmed.match(/^([\d.]+)\s*cm$/);
  if (cmMatch) {
    const cm = parseFloat(cmMatch[1]);
    return isNaN(cm) ? null : cm;
  }

  // Check for inches: 14", 14 inches, 14 in, 14in
  const inchesMatch = trimmed.match(/^([\d.]+)\s*(?:"|in|inches?)?$/);
  if (inchesMatch) {
    const inches = parseFloat(inchesMatch[1]);
    if (!isNaN(inches)) {
      return inches * 2.54;
    }
  }

  return null;
}

/**
 * Format cm value for display (shows both metric and imperial)
 */
export function formatHeight(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${cm.toFixed(1)} cm (${feet}'${inches.toFixed(1)}")`;
}

/**
 * Format kg value for display (shows both metric and imperial)
 */
export function formatWeight(kg: number): string {
  const lbs = kg / 0.453592;
  return `${kg.toFixed(2)} kg (${lbs.toFixed(1)} lbs)`;
}

/**
 * Format cm value for head circumference display
 */
export function formatHeadCircumference(cm: number): string {
  const inches = cm / 2.54;
  return `${cm.toFixed(1)} cm (${inches.toFixed(1)}")`;
}
