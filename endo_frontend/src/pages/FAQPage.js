// src/pages/FAQPage.js
import { useState } from "react";

const faqs = [
  {
    q: "Is EndoDetect a diagnostic tool?",
    a: "No. It provides automated overlays and measurements to support review. Clinical decisions should always follow standard practice."
  },
  {
    q: "What image formats work best?",
    a: "JPG and PNG are supported. Clear frames ≥ 640×480 with minimal blur deliver the best results."
  },
  {
    q: "Are my images stored?",
    a: "Images are processed to produce results. Only results you choose to save appear in History; you can delete them anytime."
  },
  {
    q: "How accurate are the measurements?",
    a: "They are automated estimates. Use them as guidance — not as final measurements."
  },
  {
    q: "Who can I contact for help?",
    a: "Email support@endodetect.com or visit the Contact page for more options."
  },
];

function Item({ i, open, onToggle, q, a }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      <button
        className="w-full text-left px-4 sm:px-5 py-4 sm:py-5 flex items-start gap-3 hover:bg-teal-50"
        onClick={() => onToggle(i)}
        aria-expanded={open}
      >
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${open ? "bg-egypt-blue" : "bg-select-yellow"}`} />
        <div className="flex-1">
          <div className="font-semibold text-egypt-blue text-base sm:text-lg">{q}</div>
          <div className={`mt-2 text-sm sm:text-base text-gray-700 transition-[max-height,opacity] duration-300 ${open ? "opacity-100" : "opacity-0 max-h-0"} overflow-hidden`}>
            {a}
          </div>
        </div>
        <div className="text-xl">{open ? "–" : "+"}</div>
      </button>
    </div>
  );
}

export default function FAQPage() {
  const [open, setOpen] = useState(0);
  const onToggle = (i) => setOpen((o) => (o === i ? -1 : i));

  return (
    <section className="w-full py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue">FAQ</h1>
          <p className="mt-3 text-gray-700">
            Quick answers to common questions. Click a question to expand.
          </p>

          <div className="mt-6 grid gap-3">
            {faqs.map((f, i) => (
              <Item key={i} i={i} open={open === i} onToggle={onToggle} q={f.q} a={f.a} />
            ))}
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Can’t find what you need? Reach out via the Contact page — we’re happy to help.
          </p>
        </div>
      </div>
    </section>
  );
}
