import React, { useEffect, useMemo, useState } from "react";
import API from "./api";

// Lightweight preview of the result.summary (fast to render)
function ResultPreview({ result }) {
  if (!result) return <>—</>;
  const { summary = {} } = result;
  const classesText = summary.class_counts
    ? Object.entries(summary.class_counts).map(([k, v]) => `${k}(${v})`).join(", ")
    : "—";
  return (
    <div className="text-sm">
      <div><strong>Detections:</strong> {summary.num_detections ?? 0}</div>
      <div><strong>Classes:</strong> {classesText}</div>
      <div>
        <strong>Conf:</strong> mean {summary.confidence_mean?.toFixed?.(2) ?? "0.00"},
        {" "}max {summary.confidence_max?.toFixed?.(2) ?? "0.00"}
      </div>
    </div>
  );
}

export default function UploadHistory() {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(() => new Set());

  const fetchHistory = async (cursor) => {
    try {
      setLoading(true);
      const res = await API.get("/history_paged", { params: { limit: 20, cursor } });
      const { items: newItems, next_cursor } = res.data || {};
      setItems(prev => cursor ? [...prev, ...(newItems || [])] : (newItems || []));
      setNextCursor(next_cursor || null);
    } catch (e) {
      setErr(e.response?.data?.detail || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Client-side quick filter on loaded rows
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(u =>
      (u.patient_name || "").toLowerCase().includes(q) ||
      (u.patient_id || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  // Selection
  const pageIds = useMemo(() => filtered.map(u => u.id), [filtered]);
  const allSelectedOnPage = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const toggleSelectAllOnPage = () => {
    setSelected(prev => {
      const n = new Set(prev);
      if (allSelectedOnPage) pageIds.forEach(id => n.delete(id));
      else pageIds.forEach(id => n.add(id));
      return n;
    });
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} scan(s)? This will remove data from MongoDB and S3.`)) return;
    try {
      await API.post("/history/bulk_delete", { ids });
      setItems(prev => prev.filter(u => !selected.has(u.id)));
      setSelected(new Set());
    } catch (e) {
      alert(e?.response?.data?.detail || "Bulk delete failed.");
    }
  };

  if (loading && items.length === 0) return <div className="text-gray-600">Loading history…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!items.length) return <div className="text-gray-600">No uploads yet.</div>;

  return (
    <div className="w-full max-w-7xl bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Upload History</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by patient name / ID…"
            className="p-2 border rounded-lg w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={deleteSelected}
            disabled={selected.size === 0}
            className={`px-3 py-2 rounded-lg border ${selected.size ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-400"}`}
            title="Delete selected uploads (Mongo + S3)"
          >
            Delete selected ({selected.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-left border-b">
              <th className="p-2 w-10">
                <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAllOnPage} />
              </th>
              <th className="p-2">When</th>
              <th className="p-2">Patient</th>
              <th className="p-2">Model</th>
              <th className="p-2">Original</th>
              <th className="p-2">Processed</th>
              <th className="p-2">Result (summary)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b align-top hover:bg-gray-50">
                <td className="p-2">
                  <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} />
                </td>
                <td className="p-2">{u.datetime ? new Date(u.datetime).toLocaleString() : "—"}</td>
                <td className="p-2">
                  <div className="font-medium">{u.patient_name || "—"}</div>
                  <div className="text-xs text-gray-600">ID: {u.patient_id || "—"}</div>
                </td>
                <td className="p-2">{u.model_used || "default"}</td>
                <td className="p-2">
                  {u.s3_url ? (
                    <a className="text-blue-600 underline" href={u.s3_url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  ) : "—"}
                </td>
                <td className="p-2">
                  {u.processed_s3_url ? (
                    <a className="text-blue-600 underline" href={u.processed_s3_url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  ) : "—"}
                </td>
                <td className="p-2">
                  <ResultPreview result={u.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="mt-4 flex justify-center">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            onClick={() => fetchHistory(nextCursor)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
