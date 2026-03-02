"use client";

import { getTodayISO } from "../lib/ageCalculation";
import type { Sex, Dataset } from "../lib/percentile";

export interface FormData {
  name: string;
  sex: Sex;
  dateOfBirth: string;
  measurementDate: string;
  height: string;
  weight: string;
  headCircumference: string;
  dataset: Dataset;
}

interface MeasurementFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSave: (data: FormData) => void;
  isNewChild: boolean;
}

export function createInitialFormData(overrides?: Partial<FormData>): FormData {
  return {
    name: "",
    sex: "male",
    dateOfBirth: "",
    measurementDate: getTodayISO(),
    height: "",
    weight: "",
    headCircumference: "",
    dataset: "cdc",
    ...overrides,
  };
}

export default function MeasurementForm({
  formData,
  onFormChange,
  onSave,
  isNewChild,
}: MeasurementFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFormChange({ ...formData, [name]: value });
  };

  const setField = (name: string, value: string) => {
    onFormChange({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const hasAnyMeasurement =
    formData.height.trim() ||
    formData.weight.trim() ||
    formData.headCircumference.trim();

  const today = getTodayISO();
  const isFutureDate = formData.measurementDate > today;
  const isFutureDob = formData.dateOfBirth > today;
  const isMeasurementBeforeBirth =
    formData.dateOfBirth &&
    formData.measurementDate &&
    formData.measurementDate < formData.dateOfBirth;

  const dateError = isFutureDob
    ? "Date of birth cannot be in the future"
    : isFutureDate
      ? "Measurement date cannot be in the future"
      : isMeasurementBeforeBirth
        ? "Measurement date cannot be before date of birth"
        : null;

  const canSave =
    formData.name.trim() &&
    formData.dateOfBirth &&
    formData.measurementDate &&
    hasAnyMeasurement &&
    !dateError;

  const inputClass =
    "w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-sand-900 placeholder:text-sand-300 disabled:bg-sand-50 disabled:text-sand-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-sm";
  const labelClass = "block text-xs font-medium text-sand-500 mb-1.5 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Child Info — only shown for new child */}
      {isNewChild && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Child's name"
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Sex</label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setField("sex", "male")}
                  className={`text-sm pb-0.5 transition-all ${
                    formData.sex === "male"
                      ? "text-sand-900 border-b border-sand-900"
                      : "text-sand-400 border-b border-transparent hover:text-sand-600"
                  }`}
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setField("sex", "female")}
                  className={`text-sm pb-0.5 transition-all ${
                    formData.sex === "female"
                      ? "text-sand-900 border-b border-sand-900"
                      : "text-sand-400 border-b border-transparent hover:text-sand-600"
                  }`}
                >
                  F
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className={labelClass}>Date of birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                max={today}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Measurement Inputs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label htmlFor="measurementDate" className={`${labelClass} !mb-0`}>Date</label>
          <input
            type="date"
            id="measurementDate"
            name="measurementDate"
            value={formData.measurementDate}
            min={formData.dateOfBirth || undefined}
            max={today}
            onChange={handleChange}
            className="px-2 py-1 bg-white border border-sand-200 rounded-md text-sand-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="height" className={labelClass}>Height</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className={inputClass}
              placeholder=''
            />
          </div>
          <div>
            <label htmlFor="weight" className={labelClass}>Weight</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={inputClass}
              placeholder=''
            />
          </div>
          <div>
            <label htmlFor="headCircumference" className={labelClass}>Head circ.</label>
            <input
              type="text"
              id="headCircumference"
              name="headCircumference"
              value={formData.headCircumference}
              onChange={handleChange}
              className={inputClass}
              placeholder=''
            />
          </div>
        </div>
      </div>

      {dateError && (
        <p className="text-sm text-perc-red">{dateError}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-sand-400">
          Default: inches &amp; pounds. Append cm or kg for metric.
        </p>
        <button
          type="submit"
          disabled={!canSave}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:bg-sand-200 disabled:text-sand-400 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
}
