// UploadHistory.jsx
import React, { useEffect, useState } from "react";
import ResultView from "./ResultView";
import API from "./api";

function ResultPreview({ result }) {
  if (!result) return <>—</>;

  const { summary = {}, detections = [] } = result;
  const classesText = summary.class_counts
    ? Object.entries(summary.class_counts)
        .map(([k, v]) => `${k}(${v})`)
        .join(", ")
    : "—";

  return (
    <div className="text-sm">
      <div><strong>Detections:</strong> {summary.num_detections ?? 0}</div>
      <div><strong>Classes:</strong> {classesText}</div>
      <div>
        <strong>Conf:</strong> mean {summary.confidence_mean?.toFixed?.(2) ?? "0.00"},
        {" "}max {summary.confidence_max?.toFixed?.(2) ?? "0.00"}
      </div>

      <details className="mt-1">
        <summary className="cursor-pointer">Show detections</summary>
        <ul className="list-disc ml-5">
          {detections.map((d, i) => (
            <li key={i}>
              {d.class_name} ({d.confidence?.toFixed?.(2) ?? "—"}) — xyxy: [
              {d.bbox_xyxy?.map(n => (typeof n === "number" ? n.toFixed(1) : n)).join(", ")}]
              {d.mask_area_px ? ` — mask px: ${d.mask_area_px}` : ""}
            </li>
          ))}
        </ul>
      </details>

      <details className="mt-1">
        <summary className="cursor-pointer">Raw JSON</summary>
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function UploadHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/history");
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.detail || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="text-gray-600">Loading history…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!items.length) return <div className="text-gray-600">No uploads yet.</div>;

  return (
    <div className="w-full max-w-6xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">When</th>
              <th className="p-2">Patient</th>
              <th className="p-2">Model</th>
              <th className="p-2">Original</th>
              <th className="p-2">Processed</th>
              <th className="p-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u, i) => (
              <tr key={i} className="border-b align-top">
                <td className="p-2">
                  {u.datetime ? new Date(u.datetime).toLocaleString() : "—"}
                </td>
                <td className="p-2">
                  <div><strong>{u.patient_name || "—"}</strong></div>
                  <div className="text-xs text-gray-600">ID: {u.patient_id || "—"}</div>
                  {u.notes && <div className="text-xs mt-1">📝 {u.notes}</div>}
                </td>
                <td className="p-2">{u.model_used || "default"}</td>
                <td className="p-2">
                  {u.s3_url ? (
                    <a
                      className="text-blue-600 underline"
                      href={u.s3_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  ) : "—"}
                </td>
                <td className="p-2">
                  {u.processed_s3_url ? (
                    <a
                      className="text-blue-600 underline"
                      href={u.processed_s3_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  ) : "—"}
                </td>
                <td className="p-2">
                  {/* THIS is the key: render the dict, don't print it directly */}
                  <ResultView result={u.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
