import React from "react";

/**
 * Clinically-focused rendering of a result:
 * - No model/AI/timing fields
 * - Simple summary + per-polyp measurements
 * - Uses mask area when available; falls back to bbox area
 */

const fmt2 = (v) =>
  typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(2)) : "—";

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-0.5">{sub}</div> : null}
    </div>
  );
}

function percent(val, total) {
  if (!total || val == null) return null;
  return (val / total) * 100.0;
}

function PerPolypTable({ detections = [], imgW = 0, imgH = 0 }) {
  if (!detections.length) return <div className="text-sm">No polyps detected.</div>;
  const imgPx = imgW * imgH || 0;

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left border-b">
            <th className="p-2">#</th>
            <th className="p-2">Size (w×h, px)</th>
            <th className="p-2">Estimated area</th>
            <th className="p-2">Image coverage</th>
            <th className="p-2">Approx. location (cx, cy)</th>
          </tr>
        </thead>
        <tbody>
          {detections.map((d, i) => {
            const [cx, cy, bw, bh] = d.bbox_xywh || [];
            const areaMask = typeof d.mask_area_px === "number" ? d.mask_area_px : null;
            const areaBox =
              typeof d.bbox_area_px === "number"
                ? d.bbox_area_px
                : (typeof bw === "number" && typeof bh === "number" ? bw * bh : null);

            const areaPx = areaMask != null ? areaMask : areaBox;
            const areaPct = imgPx ? percent(areaPx, imgPx) : null;

            return (
              <tr key={i} className="border-t align-top hover:bg-gray-50">
                <td className="p-2">{d.detection_id ?? i + 1}</td>
                <td className="p-2">
                  {typeof bw === "number" && typeof bh === "number"
                    ? `${fmt2(bw)} × ${fmt2(bh)}`
                    : "—"}
                </td>
                <td className="p-2">
                  {areaPx != null ? (
                    <>
                      {fmt2(areaPx)} px
                      {areaMask == null && <span className="text-gray-500"> (estimated)</span>}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2">
                  {areaPct != null ? `${fmt2(areaPct)}%` : "—"}
                </td>
                <td className="p-2">
                  {typeof cx === "number" && typeof cy === "number"
                    ? `${fmt2(cx)}, ${fmt2(cy)}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultView({ result }) {
  if (!result) return null;

  const { summary = {}, detections = [] } = result;
  const imgW = summary?.image_size?.width || 0;
  const imgH = summary?.image_size?.height || 0;
  const imgPx = imgW * imgH || 0;

  const areas = detections.map((d) => {
    if (typeof d.mask_area_px === "number") return d.mask_area_px;
    if (typeof d.bbox_area_px === "number") return d.bbox_area_px;
    const [ , , bw, bh ] = d.bbox_xywh || [];
    return (typeof bw === "number" && typeof bh === "number") ? bw * bh : 0;
  });

  const totalAreaPx = areas.reduce((a, b) => a + (b || 0), 0);
  const largestAreaPx = areas.reduce((m, v) => (v > m ? v : m), 0);
  const totalPct = imgPx ? percent(totalAreaPx, imgPx) : null;
  const largestPct = imgPx ? percent(largestAreaPx, imgPx) : null;

  return (
    <div className="max-w-3xl w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Polyps detected" value={summary.num_detections ?? 0} />
        <Stat
          label="Largest estimated area"
          value={largestAreaPx ? `${fmt2(largestAreaPx)} px` : "—"}
          sub={largestPct != null ? `${fmt2(largestPct)}% of image` : ""}
        />
        <Stat
          label="Total estimated burden"
          value={totalAreaPx ? `${fmt2(totalAreaPx)} px` : "—"}
          sub={totalPct != null ? `${fmt2(totalPct)}% of image` : ""}
        />
      </div>

      <PerPolypTable detections={detections} imgW={imgW} imgH={imgH} />

      <p className="mt-3 text-xs text-gray-500">
        Measurements are automated estimates derived from image analysis and are intended as decision support, not a diagnosis.
      </p>
    </div>
  );
}
