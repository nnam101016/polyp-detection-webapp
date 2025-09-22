import step1 from "../image/step1.png";
import step2 from "../image/step2.png";
import step3 from "../image/step3.png";
import step4 from "../image/step4.png";
import step5 from "../image/step5.png";
import { useEffect, useMemo, useRef } from "react";

export const navItems = [
  { label: "step1", value: "1. Navigate to diagnosis page", img: step1, tip: "Go to Diagnostic to start a new case." },
  { label: "step2", value: "2. Upload applicable images",   img: step2, tip: "Add clear endoscopic frames (max 10)." },
  { label: "step3", value: "3. Run the diagnosis",           img: step3, tip: "Pick a method and start the scan." },
  { label: "step4", value: "4. Check the results and options", img: step4, tip: "Compare views and review each polyp." },
  { label: "step5", value: "5. Browse through saved results",  img: step5, tip: "Open History to revisit past cases." },
];

export default function LeftPanelBox({ onSelect, selected }) {
  const listRef = useRef(null);
  const activeIdx = useMemo(
    () => Math.max(0, navItems.findIndex((i) => i.label === selected)),
    [selected]
  );
  const go = (idx) => onSelect(navItems[Math.min(navItems.length - 1, Math.max(0, idx))].label);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp") { e.preventDefault(); go(activeIdx - 1); }
      if (e.key === "ArrowDown") { e.preventDefault(); go(activeIdx + 1); }
    };
    const el = listRef.current;
    el?.addEventListener("keydown", onKey);
    return () => el?.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  return (
    <section
      className="w-full rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-select-yellow to-yellow-300 shadow-xl border border-white/20"
      aria-label="How to use EndoDetect"
    >
      {/* header + progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-egypt-blue">Step-by-Step</h3>
        <span className="text-xs font-semibold text-egypt-blue/80">
          {activeIdx + 1} / {navItems.length}
        </span>
      </div>
      <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-egypt-blue transition-all duration-500"
          style={{ width: `${((activeIdx + 1) / navItems.length) * 100}%` }}
        />
      </div>

      {/* steps */}
      <ul
        ref={listRef}
        tabIndex={0}
        className="flex flex-col gap-2 outline-none"
        aria-activedescendant={navItems[activeIdx]?.label}
      >
        {navItems.map((item, idx) => {
          const active = selected === item.label;
          return (
            <li key={item.label} id={item.label}>
              <button
                type="button"
                onClick={() => onSelect(item.label)}
                aria-current={active ? "step" : undefined}
                className={[
                  "group w-full text-left px-4 py-3 rounded-xl transition-all border",
                  active
                    ? "bg-egypt-blue text-white border-egypt-blue shadow-lg"
                    : "bg-white text-egypt-blue hover:bg-teal-50 border-white"
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0",
                      active ? "bg-white/20 text-white" : "bg-teal-100 text-teal-700"
                    ].join(" ")}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.value}</div>
                    <div className={["text-xs transition", active ? "text-white/90" : "text-egypt-blue/70"].join(" ")}>
                      {item.tip}
                    </div>
                  </div>
                  <div className={["text-lg transition-transform", active ? "translate-x-0" : "group-hover:translate-x-0.5 text-teal-600"].join(" ")}>
                    →
                  </div>
                </div>

                {/* inline preview */}
                <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ${active ? "max-h-44 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="mt-3 grid grid-cols-[96px,1fr] gap-3 items-center">
                    <img
                      src={item.img}
                      alt={item.value}
                      className="h-24 w-24 rounded-lg bg-white object-contain border"
                      loading={idx === activeIdx ? "eager" : "lazy"}
                      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                    />
                    <p className="text-sm text-white/90">
                      {item.value.replace(/^[0-9. ]+/, "")}. Follow on-screen prompts and use the bottom actions to proceed.
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* controls */}
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(activeIdx - 1)}
          className="px-3 py-2 rounded-lg bg-white text-egypt-blue font-semibold hover:bg-teal-50"
          disabled={activeIdx === 0}
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => go(activeIdx + 1)}
          className="px-3 py-2 rounded-lg bg-egypt-blue text-white font-semibold hover:opacity-95"
          disabled={activeIdx === navItems.length - 1}
        >
          Next →
        </button>
      </div>
    </section>
  );
}
