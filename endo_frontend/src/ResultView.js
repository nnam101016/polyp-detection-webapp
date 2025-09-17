// src/ResultView.js
import React from "react";

const fmt = (v, digits = 2) =>
  typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(digits)) : "—";

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-0.5">{sub}</div> : null}
    </div>
  );
}

export default function ResultView({ result }) {
  if (!result) return null;

  const clinical =
    result?.summary?.clinical && typeof result.summary.clinical === "object"
      ? result.summary.clinical
      : null;

  const count = clinical?.polyp_count ?? 0;
  const largestPct = clinical?.largest_lesion_area_pct;
  const lesions = Array.isArray(clinical?.lesions) ? clinical.lesions : [];

  return (
    <div className="max-w-3xl w-full">
      {/* Only 2 stat blocks now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Stat label="Polyps detected" value={fmt(count, 0)} />
        <Stat
          label="Largest lesion"
          value={largestPct != null ? `${fmt(largestPct)}%` : "—"}
          sub="image coverage"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left border-b">
              <th className="p-2">#</th>
              <th className="p-2">AI Confidence Score</th>
              <th className="p-2">Size class</th>
              <th className="p-2">Image coverage</th>
            </tr>
          </thead>
          <tbody>
            {lesions.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-600" colSpan={4}>
                  No polyps detected.
                </td>
              </tr>
            ) : (
              lesions.map((l, i) => (
                <tr key={l.id ?? i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{l.id ?? i}</td>
                  <td className="p-2">
                    {typeof l.confidence === "number"
                      ? `${fmt(l.confidence * 100, 1)}%`
                      : "—"}
                  </td>
                  <td className="p-2">{l.size_class || "—"}</td>
                  <td className="p-2">
                    {typeof l.area_pct === "number"
                      ? `${fmt(l.area_pct)}%`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
