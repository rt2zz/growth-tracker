"use client";

import { useEffect, useRef } from "react";

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

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
          <h2 className="text-sm font-medium text-sand-900">About this app</h2>
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
        <div className="px-5 pb-5 overflow-y-auto space-y-4 text-sm text-sand-600 leading-relaxed">
          <section>
            <h3 className="font-medium text-sand-900 mb-1">How it works</h3>
            <p>
              Enter your child&apos;s date of birth and measurements (height, weight,
              head circumference). The app calculates percentiles using the LMS
              method, which tells you how your child compares to the reference
              population at the same age and sex.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-sand-900 mb-1">Data sources</h3>
            <p>
              <strong className="text-sand-700">CDC</strong> &mdash; Growth charts
              from the U.S. Centers for Disease Control and Prevention, covering
              ages 0&ndash;20. Standard reference in the United States.
            </p>
            <p className="mt-1.5">
              <strong className="text-sand-700">WHO</strong> &mdash; Growth
              standards from the World Health Organization, covering ages 0&ndash;5.
              Based on an international sample of breastfed children raised in
              optimal conditions.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-sand-900 mb-1">What&apos;s measured</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Height / length</li>
              <li>Weight</li>
              <li>Head circumference</li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium text-sand-900 mb-1">Units</h3>
            <p>
              You can enter measurements in imperial (inches, feet, pounds) or
              metric (cm, kg). Values are automatically converted for percentile
              calculation.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-sand-900 mb-1">Disclaimer</h3>
            <p>
              This app was coded for fun and is not a medical tool. Always verify
              results with your pediatrician or healthcare provider.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-sand-900 mb-1">Privacy</h3>
            <p>
              All data is stored locally in your browser using localStorage.
              Nothing is sent to a server. Use the export/import button to back up
              or transfer your data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
