"use client";

import { useState } from "react";
import { getChild, deleteChild } from "../lib/storage";
import type { ChildData } from "../lib/storage";
import { getAgeInMonths, formatAge, parseDate } from "../lib/ageCalculation";

interface ChildSelectorProps {
  selectedChild: string;
  childNames: string[];
  onSelect: (child: ChildData | null) => void;
  onNewChild: () => void;
  onChildDeleted: () => void;
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getChildAge(child: ChildData): string {
  const dob = parseDate(child.dateOfBirth);
  if (!dob) return "";
  const ageMonths = getAgeInMonths(dob, new Date());
  return formatAge(ageMonths);
}

export default function ChildSelector({
  selectedChild,
  childNames,
  onSelect,
  onNewChild,
  onChildDeleted,
}: ChildSelectorProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    if (name === selectedChild) return;
    const child = getChild(name);
    if (child) onSelect(child);
  };

  const handleDelete = (name: string) => {
    deleteChild(name);
    if (name === selectedChild) onSelect(null);
    setDeleteTarget(null);
    onChildDeleted();
  };

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        {childNames.map((name) => {
          const isSelected = name === selectedChild;
          const child = getChild(name);
          const age = child ? getChildAge(child) : "";

          return (
            <div key={name} className="relative group">
              <button
                onClick={() => handleSelect(name)}
                className={`
                  flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full
                  transition-all duration-150
                  ${isSelected
                    ? "bg-sand-800 text-sand-50 shadow-sm"
                    : "bg-sand-100 text-sand-700 hover:bg-sand-200"
                  }
                `}
              >
                <span
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center
                    text-xs font-semibold shrink-0
                    ${isSelected
                      ? "bg-sand-600 text-sand-100"
                      : "bg-sand-300 text-sand-700"
                    }
                  `}
                >
                  {getInitial(name)}
                </span>
                <span className="text-sm font-medium leading-none">
                  {name}
                  {age && (
                    <span className={`block text-[11px] font-normal mt-0.5 ${isSelected ? "text-sand-300" : "text-sand-400"}`}>
                      {age}
                    </span>
                  )}
                </span>
              </button>

              {/* Delete button - appears on hover */}
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(name);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sand-400 hover:bg-perc-red text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove child"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        {/* Add child button */}
        <button
          onClick={onNewChild}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-sand-300 text-sand-500 hover:border-teal-500 hover:text-teal-600 transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Add child
        </button>
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="text-sand-600">Remove {deleteTarget} and all measurements?</span>
          <button
            onClick={() => handleDelete(deleteTarget)}
            className="px-3 py-1 rounded-md bg-perc-red text-white text-xs font-medium hover:opacity-90"
          >
            Remove
          </button>
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-3 py-1 rounded-md bg-sand-200 text-sand-600 text-xs font-medium hover:bg-sand-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
