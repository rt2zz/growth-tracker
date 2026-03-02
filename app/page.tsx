"use client";

import { useState, useCallback, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import MeasurementForm, { FormData, createInitialFormData } from "./components/MeasurementForm";
import PercentileDisplay from "./components/PercentileDisplay";
import HistoryView from "./components/HistoryView";
import DataModal from "./components/DataModal";
import InfoModal from "./components/InfoModal";
import { getChild, saveChild, addMeasurement, generateId, getChildNames } from "./lib/storage";
import type { ChildData } from "./lib/storage";
import { parseHeight, parseWeight, parseHeadCircumference } from "./lib/parseUnits";
import { getTodayISO } from "./lib/ageCalculation";

export default function Home() {
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [isNewChild, setIsNewChild] = useState(false);
  const [formData, setFormData] = useState<FormData>(createInitialFormData());
  const [childNames, setChildNames] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    setChildNames(getChildNames());
  }, []);

  const refreshChildNames = useCallback(() => {
    setChildNames(getChildNames());
  }, []);

  const showSaveMessage = useCallback((message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const handleSelectChild = useCallback((child: ChildData | null) => {
    setSelectedChild(child);
    setIsNewChild(false);
    if (child) {
      setFormData((prev) => ({
        ...prev,
        name: child.name,
        sex: child.sex,
        dateOfBirth: child.dateOfBirth,
        dataset: child.dataset ?? prev.dataset,
        measurementDate: getTodayISO(),
        height: "",
        weight: "",
        headCircumference: "",
      }));
    }
  }, []);

  const handleNewChild = useCallback(() => {
    setSelectedChild(null);
    setIsNewChild(true);
    setFormData((prev) =>
      createInitialFormData({ dataset: prev.dataset })
    );
  }, []);

  const handleFormChange = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const handleSave = useCallback((data: FormData) => {
    const heightCm = parseHeight(data.height);
    const weightKg = parseWeight(data.weight);
    const headCm = parseHeadCircumference(data.headCircumference);

    if (isNewChild) {
      const newChild: ChildData = {
        name: data.name.trim(),
        sex: data.sex,
        dateOfBirth: data.dateOfBirth,
        dataset: data.dataset,
        measurements: [
          {
            id: generateId(),
            date: data.measurementDate,
            ...(heightCm !== null && { height: heightCm }),
            ...(weightKg !== null && { weight: weightKg }),
            ...(headCm !== null && { headCircumference: headCm }),
          },
        ],
      };
      saveChild(newChild);
      setSelectedChild(newChild);
      setIsNewChild(false);
      refreshChildNames();
      setFormData((prev) => ({
        ...prev,
        name: newChild.name,
        sex: newChild.sex,
        dateOfBirth: newChild.dateOfBirth,
        dataset: newChild.dataset ?? prev.dataset,
        measurementDate: getTodayISO(),
        height: "",
        weight: "",
        headCircumference: "",
      }));
      showSaveMessage("Child created with first measurement");
    } else if (selectedChild) {
      addMeasurement(selectedChild.name, {
        date: data.measurementDate,
        ...(heightCm !== null && { height: heightCm }),
        ...(weightKg !== null && { weight: weightKg }),
        ...(headCm !== null && { headCircumference: headCm }),
      });
      if (data.dataset !== selectedChild.dataset) {
        const updated = getChild(selectedChild.name);
        if (updated) {
          updated.dataset = data.dataset;
          saveChild(updated);
        }
      }
      const updated = getChild(selectedChild.name);
      if (updated) {
        setSelectedChild(updated);
      }
      setFormData((prev) => ({
        ...prev,
        measurementDate: getTodayISO(),
        height: "",
        weight: "",
        headCircumference: "",
      }));
      showSaveMessage("Measurement saved");
    }
  }, [isNewChild, selectedChild, refreshChildNames, showSaveMessage]);

  const handleMeasurementDeleted = useCallback(() => {
    if (selectedChild) {
      const updated = getChild(selectedChild.name);
      if (updated) {
        setSelectedChild(updated);
      }
    }
  }, [selectedChild]);

  const handleChildDeleted = useCallback(() => {
    refreshChildNames();
  }, [refreshChildNames]);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-sand-900 tracking-tight">
              Growth Tracker
            </h1>
            <p className="text-sm text-sand-400 mt-0.5">
              Height, weight &amp; head circumference percentiles
            </p>
          </div>
          <div className="flex gap-1 mt-1">
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 text-sand-400 hover:text-sand-600 transition-colors rounded-lg hover:bg-sand-100"
              aria-label="About this app"
              title="About"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowDataModal(true)}
              className="p-1.5 text-sand-400 hover:text-sand-600 transition-colors rounded-lg hover:bg-sand-100"
              aria-label="Export or import data"
              title="Export / Import"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Toast */}
        {saveMessage && (
          <div className="mb-4 px-4 py-2.5 bg-perc-green/10 text-perc-green rounded-lg text-sm font-medium animate-toast">
            {saveMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Child Selector */}
          <section>
            <ChildSelector
              selectedChild={selectedChild?.name || ""}
              childNames={childNames}
              onSelect={handleSelectChild}
              onNewChild={handleNewChild}
              onChildDeleted={handleChildDeleted}
            />
          </section>

          {/* Form & Display */}
          {(selectedChild || isNewChild) && (
            <>
              <section className="bg-white rounded-2xl border border-sand-100 p-5">
                <MeasurementForm
                  formData={formData}
                  onFormChange={handleFormChange}
                  onSave={handleSave}
                  isNewChild={isNewChild}
                />
              </section>

              <section className="bg-white rounded-2xl border border-sand-100 p-5">
                <PercentileDisplay
                  height={formData.height}
                  weight={formData.weight}
                  headCircumference={formData.headCircumference}
                  dateOfBirth={formData.dateOfBirth}
                  measurementDate={formData.measurementDate}
                  sex={formData.sex}
                  dataset={formData.dataset}
                  onDatasetChange={(ds) => setFormData((prev) => ({ ...prev, dataset: ds }))}
                />
              </section>

              {selectedChild && selectedChild.measurements.length > 0 && (
                <section className="bg-white rounded-2xl border border-sand-100 p-5">
                  <HistoryView
                    child={selectedChild}
                    dataset={formData.dataset}
                    onMeasurementDeleted={handleMeasurementDeleted}
                  />
                </section>
              )}
            </>
          )}

          {/* Empty state */}
          {!selectedChild && !isNewChild && (
            <section className="py-16 text-center">
              <p className="text-sand-400 text-sm mb-4">
                Select a child above or add a new one to get started
              </p>
              <button
                onClick={handleNewChild}
                className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Add your first child
              </button>
            </section>
          )}
        </div>

        <footer className="mt-10 text-center text-[11px] text-sand-300">
          Data stored locally in your browser. CDC &amp; WHO growth standards.
        </footer>
      </div>

      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {showDataModal && (
        <DataModal
          onClose={() => setShowDataModal(false)}
          onImport={() => {
            refreshChildNames();
            // If the currently selected child was updated, refresh it
            if (selectedChild) {
              const updated = getChild(selectedChild.name);
              if (updated) {
                setSelectedChild(updated);
              } else {
                setSelectedChild(null);
              }
            }
          }}
        />
      )}
    </main>
  );
}
