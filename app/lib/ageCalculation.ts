/**
 * Calculate age in months from date of birth to measurement date
 */
export function getAgeInMonths(dob: Date, measurementDate: Date): number {
  const years = measurementDate.getFullYear() - dob.getFullYear();
  const months = measurementDate.getMonth() - dob.getMonth();
  const days = measurementDate.getDate() - dob.getDate();

  let totalMonths = years * 12 + months;

  // Adjust for partial months
  if (days < 0) {
    totalMonths -= 1;
  }

  // Add fractional month based on days
  const daysInMonth = new Date(
    measurementDate.getFullYear(),
    measurementDate.getMonth() + 1,
    0
  ).getDate();

  let adjustedDays = days;
  if (days < 0) {
    const prevMonthDays = new Date(
      measurementDate.getFullYear(),
      measurementDate.getMonth(),
      0
    ).getDate();
    adjustedDays = prevMonthDays + days;
  }

  const fractionalMonth = adjustedDays / daysInMonth;

  return Math.max(0, totalMonths + fractionalMonth);
}

/**
 * Format age in months for display
 */
export function formatAge(ageMonths: number): string {
  if (ageMonths < 1) {
    const weeks = Math.floor(ageMonths * 4.33);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  }

  if (ageMonths < 24) {
    const months = Math.floor(ageMonths);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  const years = Math.floor(ageMonths / 12);
  const months = Math.floor(ageMonths % 12);

  if (months === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }

  return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
}

/**
 * Parse ISO date string (YYYY-MM-DD) to Date object at local midnight.
 * Using `new Date("YYYY-MM-DD")` parses as UTC, which shifts to the
 * previous day in western timezones. Parsing components avoids this.
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const parts = dateString.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}
