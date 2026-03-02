/**
 * localStorage helpers for persisting child data
 */

import type { Sex, Dataset } from "./percentile";

export interface Measurement {
  id: string;
  date: string; // ISO date
  height?: number; // stored in cm
  weight?: number; // stored in kg
  headCircumference?: number; // stored in cm
}

export interface ChildData {
  name: string;
  sex: Sex;
  dateOfBirth: string; // ISO date
  dataset?: Dataset;
  measurements: Measurement[];
}

const STORAGE_KEY = "percentiles_children";
const SCHEMA_VERSION = 1;

interface StorageEnvelope {
  version: number;
  children: ChildData[];
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a value looks like a ChildData object
 */
export function isValidChild(c: unknown): c is ChildData {
  if (typeof c !== "object" || c === null) return false;
  const obj = c as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    obj.name.trim().length > 0 &&
    (obj.sex === "male" || obj.sex === "female") &&
    typeof obj.dateOfBirth === "string" &&
    Array.isArray(obj.measurements)
  );
}

/**
 * Get all children from localStorage
 */
export function getChildren(): ChildData[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Handle versioned envelope
    let children: unknown[];
    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      Array.isArray(parsed.children)
    ) {
      children = parsed.children;
    } else if (Array.isArray(parsed)) {
      // Legacy format (pre-versioning): migrate on next save
      children = parsed;
    } else {
      return [];
    }

    return children.filter(isValidChild);
  } catch {
    return [];
  }
}

/**
 * Save all children to localStorage
 */
export function saveChildren(children: ChildData[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const envelope: StorageEnvelope = {
      version: SCHEMA_VERSION,
      children,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

/**
 * Get a child by name
 */
export function getChild(name: string): ChildData | undefined {
  const children = getChildren();
  return children.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Add or update a child
 */
export function saveChild(child: ChildData): void {
  const children = getChildren();
  const existingIndex = children.findIndex(
    (c) => c.name.toLowerCase() === child.name.toLowerCase()
  );

  if (existingIndex >= 0) {
    children[existingIndex] = child;
  } else {
    children.push(child);
  }

  saveChildren(children);
}

/**
 * Delete a child by name
 */
export function deleteChild(name: string): void {
  const children = getChildren();
  const filtered = children.filter(
    (c) => c.name.toLowerCase() !== name.toLowerCase()
  );
  saveChildren(filtered);
}

/**
 * Add a measurement to a child
 */
export function addMeasurement(
  childName: string,
  measurement: Omit<Measurement, "id">
): Measurement | null {
  const child = getChild(childName);
  if (!child) return null;

  const newMeasurement: Measurement = {
    ...measurement,
    id: generateId(),
  };

  child.measurements.push(newMeasurement);
  saveChild(child);

  return newMeasurement;
}

/**
 * Delete a measurement
 */
export function deleteMeasurement(
  childName: string,
  measurementId: string
): boolean {
  const child = getChild(childName);
  if (!child) return false;

  const originalLength = child.measurements.length;
  child.measurements = child.measurements.filter(
    (m) => m.id !== measurementId
  );

  if (child.measurements.length < originalLength) {
    saveChild(child);
    return true;
  }

  return false;
}

/**
 * Generate a unique ID for measurements
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get all child names
 */
export function getChildNames(): string[] {
  return getChildren().map((c) => c.name);
}
