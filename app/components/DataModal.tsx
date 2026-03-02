"use client";

import { useState, useEffect, useRef } from "react";
import { getChildren, saveChildren, isValidChild } from "../lib/storage";
import type { ChildData } from "../lib/storage";

interface DataModalProps {
  onClose: () => void;
  onImport: () => void;
}

type Tab = "export" | "import";

export default function DataModal({ onClose, onImport }: DataModalProps) {
  const [tab, setTab] = useState<Tab>("export");
  const [exportJson, setExportJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExportJson(JSON.stringify(getChildren(), null, 2));
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // fallback: select the textarea content
    }
  };

  const handleImport = () => {
    setImportMessage(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setImportMessage({ type: "error", text: "Invalid JSON" });
      return;
    }

    if (!Array.isArray(parsed)) {
      setImportMessage({ type: "error", text: "Expected a JSON array of children" });
      return;
    }

    const valid: ChildData[] = [];
    const invalid: number[] = [];
    parsed.forEach((item, i) => {
      if (isValidChild(item)) {
        valid.push(item);
      } else {
        invalid.push(i + 1);
      }
    });

    if (valid.length === 0) {
      setImportMessage({ type: "error", text: "No valid children found in the data" });
      return;
    }

    // Merge: imported children replace existing by name
    const existing = getChildren();
    const merged = [...existing];
    for (const child of valid) {
      const idx = merged.findIndex(
        (c) => c.name.toLowerCase() === child.name.toLowerCase()
      );
      if (idx >= 0) {
        merged[idx] = child;
      } else {
        merged.push(child);
      }
    }

    saveChildren(merged);
    onImport();

    const parts: string[] = [`Imported ${valid.length} child${valid.length !== 1 ? "ren" : ""}`];
    if (invalid.length > 0) {
      parts.push(`${invalid.length} skipped (invalid)`);
    }
    setImportMessage({ type: "success", text: parts.join(". ") });

    // Refresh the export tab data
    setExportJson(JSON.stringify(getChildren(), null, 2));
  };

  const tabClass = (t: Tab) =>
    `text-sm pb-0.5 transition-all ${
      tab === t
        ? "text-sand-900 font-medium border-b border-sand-900"
        : "text-sand-400 border-b border-transparent hover:text-sand-600"
    }`;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-sand-100 shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex gap-4">
            <button type="button" onClick={() => setTab("export")} className={tabClass("export")}>
              Export
            </button>
            <button type="button" onClick={() => setTab("import")} className={tabClass("import")}>
              Import
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sand-400 hover:text-sand-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 flex flex-col flex-1 min-h-0">
          {tab === "export" ? (
            <>
              <textarea
                readOnly
                value={exportJson}
                className="w-full flex-1 min-h-[200px] px-3 py-2 bg-sand-50 border border-sand-200 rounded-lg text-sand-700 text-xs font-mono resize-none focus:outline-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  {copyFeedback ? "Copied!" : "Copy to clipboard"}
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportMessage(null);
                }}
                placeholder="Paste JSON data here..."
                className="w-full flex-1 min-h-[200px] px-3 py-2 bg-white border border-sand-200 rounded-lg text-sand-900 text-xs font-mono resize-none placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
              {importMessage && (
                <p
                  className={`mt-2 text-sm ${
                    importMessage.type === "success" ? "text-perc-green" : "text-perc-red"
                  }`}
                >
                  {importMessage.text}
                </p>
              )}
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importJson.trim()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:bg-sand-200 disabled:text-sand-400 disabled:cursor-not-allowed transition-colors"
                >
                  Import
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
