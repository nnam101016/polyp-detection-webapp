import React, { useState } from "react";

const fmt2 = (v) =>
  typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : v ?? "—";
const join = (arr) =>
  Array.isArray(arr) ? arr.map((n) => (typeof n === "number" ? fmt2(n) : n)).join(", ") : "—";

function KvRow({ label, children }) {
  return (
    <div className="flex gap-2 text-sm">
      <div className="font-semibold">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function RawJsonToggle({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button className="underline text-blue-600" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide JSON" : "Raw JSON"}
      </button>
      {open && (
        <pre className="whitespace-pre-wrap text-xs mt-1 border rounded p-2 bg-gray-50">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function DetectionsTable({ detections }) {
  const [openRows, setOpenRows] = useState({});
  if (!detections?.length) return <div className="mt-2">No detections</div>;
  const toggle = (i) => setOpenRows((s) => ({ ...s, [i]: !s[i] }));

  return (
    <div className="mt-3 border rounded">
      <div className="px-3 py-2 font-semibold bg-gray-50 border-b">Detections</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">#</th>
              <th className="p-2">Class</th>
              <th className="p-2">Conf</th>
              <th className="p-2">xyxy</th>
              <th className="p-2">w×h</th>
              <th className="p-2">Area(px²)</th>
              <th className="p-2">Aspect</th>
              <th className="p-2">More</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((d, i) => {
              const [x, y, w, h] = d.bbox_xywh || [];
              return (
                <React.Fragment key={i}>
                  <tr className="border-b align-top">
                    <td className="p-2">{d.detection_id ?? i}</td>
                    <td className="p-2">{d.class_name ?? d.class_id}</td>
                    <td className="p-2">{fmt2(d.confidence)}</td>
                    <td className="p-2">[{join(d.bbox_xyxy)}]</td>
                    <td className="p-2">{fmt2(w)} × {fmt2(h)}</td>
                    <td className="p-2">{fmt2(d.bbox_area_px)}</td>
                    <td className="p-2">{fmt2(d.aspect_ratio)}</td>
                    <td className="p-2">
                      <button className="underline text-blue-600" onClick={() => toggle(i)} type="button">
                        {openRows[i] ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  {openRows[i] && (
                    <tr className="border-b bg-gray-50">
                      <td className="p-2" colSpan={8}>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <KvRow label="xywh:">[{join(d.bbox_xywh)}]</KvRow>
                          <KvRow label="xyxy (norm):">[{join(d.bbox_xyxy_norm)}]</KvRow>
                          <KvRow label="xywh (norm):">[{join(d.bbox_xywh_norm)}]</KvRow>
                          {"mask_area_px" in d && <KvRow label="Mask area(px):">{fmt2(d.mask_area_px)}</KvRow>}
                          {"mask_polygons" in d && Array.isArray(d.mask_polygons) &&
                            <KvRow label="Mask polygons:">{d.mask_polygons.length ? `${d.mask_polygons.length} polygon(s)` : "—"}</KvRow>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ResultView({ result }) {
  if (!result) return <>—</>;
  const { summary = {}, detections = [] } = result;

  const classesText = summary.class_counts
    ? Object.entries(summary.class_counts).map(([k, v]) => `${k}(${v})`).join(", ")
    : "—";
  const times = summary.time_ms || {};

  return (
    <div className="text-sm max-w-3xl w-full">
      <div className="rounded border p-3 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1">
          <KvRow label="Detections:">{summary.num_detections ?? 0}</KvRow>
          <KvRow label="Classes:">{classesText}</KvRow>
          <KvRow label="Confidence:">mean {fmt2(summary.confidence_mean)}, max {fmt2(summary.confidence_max)}</KvRow>
          <KvRow label="Image size:">
            {summary.image_size ? `${summary.image_size.width}×${summary.image_size.height}` : "—"}
          </KvRow>
          <KvRow label="Timing (ms):">
            {Object.keys(times).length ? Object.entries(times).map(([k, v]) => `${k}:${fmt2(v)}`).join("  ") : "—"}
          </KvRow>
        </div>
      </div>

      <DetectionsTable detections={detections} />
      <RawJsonToggle data={result} />
    </div>
  );
}
