import CarouselWithText from "../components/CarouselWithText";
import { Link, useNavigate } from "react-router-dom";
import banner from "../image/home_banner.jpg";
import LeftPanelBox, { navItems } from "../components/LeftPanelBox";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";

import image from "../image/why detect.png";
import sam1 from "../image/original.jpg";
import sam2 from "../image/overlay.jpg";
import sam3 from "../image/boundingbox.png";

const cards = [
  { id: 1, src: sam1, text: "Original Input Image" },
  { id: 2, src: sam2, text: "Segmentation With Overlay (Mask RCNN)" },
  { id: 3, src: sam3, text: "Detection With Bounding Box (YOLO 9t)" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("step1");
  const selectedItem = useMemo(
    () => navItems.find((i) => i.label === selected) || null,
    [selected]
  );

  const handleStartDiagnosis = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/diagnosis" : "/login");
  };

  // tiny count-up stats
  const [stats, setStats] = useState({ clinicians: 0, images: 0, sensitivity: 0 });
  useEffect(() => {
    const targets = { clinicians: 120, images: 5400, sensitivity: 97.2 };
    const steps = 36;
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setStats({
        clinicians: Math.round((targets.clinicians * t) / steps),
        images: Math.round((targets.images * t) / steps),
        sensitivity: +(targets.sensitivity * (t / steps)).toFixed(1),
      });
      if (t >= steps) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, []);

  return (
    // REMOVE huge vertical gaps between sections (gap-24 -> gap-0)
    <div className="min-h-screen w-full flex flex-col items-center gap-0 bg-white">
      {/* HERO */}
      <section id="quick-start" className="w-full text-white">
        <div className="bg-gradient-to-r from-egypt-blue via-teal-600 to-egypt-blue">
          <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
            <img
              src={banner}
              alt="Endoscopic Homepage Banner"
              className="w-full rounded-2xl shadow-lg ring-1 ring-white/20"
              loading="eager"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                EndoDetect: Lesion Detection in Endoscopic Images using Deep Learning
              </h1>
              <p className="text-lg mt-3 mb-8 text-white/90">
                Upload images and get assistive highlights to support clinical decisions.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStartDiagnosis}
                  className="bg-select-yellow text-egypt-blue px-5 py-2.5 rounded-2xl font-semibold hover:bg-yellow-400 transition"
                >
                  Start Diagnosis
                </button>
                <Link to="faq">
                  <button className="px-5 py-2.5 rounded-2xl font-semibold border border-teal-300 text-teal-100 hover:bg-white/10 transition">
                    Learn More
                  </button>
                </Link>
              </div>

              {/* quick stats */}
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3">
                  <div className="text-2xl font-bold">{stats.clinicians}+</div>
                  <div className="text-xs text-white/80">Clinicians</div>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3">
                  <div className="text-2xl font-bold">{stats.images.toLocaleString()}</div>
                  <div className="text-xs text-white/80">Images Analyzed</div>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3">
                  <div className="text-2xl font-bold">{stats.sensitivity}%</div>
                  <div className="text-xs text-white/80">Est. Sensitivity*</div>
                </div>
              </div>
              <div className="text-[11px] text-white/70 mt-1">
                *Illustrative metric for demo. Clinical validation required.
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* WHY */}
        <section id="why" className="w-full bg-gray-50 py-14 -mt-px">
        <div className="mx-auto max-w-7xl px-4">
            {/* Fancy container */}
            <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-gradient-to-br from-white to-teal-50">
            {/* Left: content */}
            <div className="p-8 sm:p-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue mb-6">
                Why EndoDetect?
                </h2>

                {/* Key points */}
                <ul className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-select-yellow" />
                    <div>
                    <span className="font-semibold">Assistive detection</span> to help reduce missed polyps during endoscopy.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-select-yellow" />
                    <div>
                    <span className="font-semibold">Clear overlays & per-polyp measures</span> (area, size, location) at a glance.
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-select-yellow" />
                    <div>
                    <span className="font-semibold">Easy comparison</span> with before/after views to support review.
                    </div>
                </li>
                </ul>

                {/* Small highlight badges */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 p-4">
                    <div className="text-2xl">⚡</div>
                    <div className="font-semibold text-egypt-blue">Fast</div>
                    <div className="text-sm text-gray-600">Quick results per image.</div>
                </div>
                <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 p-4">
                    <div className="text-2xl">🔍</div>
                    <div className="font-semibold text-egypt-blue">Clear</div>
                    <div className="text-sm text-gray-600">Readable overlays & stats.</div>
                </div>
                <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 p-4">
                    <div className="text-2xl">🔒</div>
                    <div className="font-semibold text-egypt-blue">Private</div>
                    <div className="text-sm text-gray-600">Keep only what you save.</div>
                </div>
                </div>

                {/* tiny note */}
                <p className="mt-4 text-xs text-gray-500">
                Measurements are automated estimates for decision support — not a diagnosis.
                </p>
            </div>

            {/* Right: image showcase with subtle frame */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-egypt-blue/5 to-transparent pointer-events-none" />
                <img
                src={image}
                alt="EndoDetect example"
                className="w-full h-full object-cover"
                loading="lazy"
                />
                {/* inner border & rounded corners to match the card style */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/10 m-4" />
            </div>
            </div>
        </div>
        </section>


      {/* PRODUCTS (consistent paddings + seam fix) */}
      <section id="model" className="w-full bg-gradient-to-b from-gray-50 to-teal-50 py-14 -mt-px">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl text-egypt-blue font-bold text-center mb-6">Our Products</h2>
          <CarouselWithText cards={cards} />
        </div>
      </section>

        {/* HOW-TO */}
        <section id="steps" className="w-full bg-gradient-to-b from-teal-50 to-gray-50 py-14 -mt-px">
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-egypt-blue">
            How to Use
            </h2>

            {/* -- helpers to render detailed content for each step -- */}
            {/*
            We keep the images from navItems but expand the textual guidance here.
            You can tweak any copy below without touching LeftPanelBox.
            */}
            {(() => {
            const content = {
                step1: {
                title: "1. Navigate to diagnosis page",
                lead:
                    "Go to Diagnostic to start a new case. You can begin with a single endoscopic frame or a small batch.",
                bullets: [
                    "Ensure you are signed in. Guests may be redirected to Login.",
                    "Have your images ready (local disk or device photo library).",
                    "If you’re new, skim the FAQ for supported formats and privacy details."
                ],
                note:
                    "Tip: Bookmark the Diagnostic page for faster access during procedures.",
                ctaText: "Open Diagnostic",
                ctaTo: "/diagnosis",
                },
                step2: {
                title: "2. Upload applicable images",
                lead:
                    "Add clear endoscopic frames (max 10 per run) for the best results.",
                bullets: [
                    "Supported formats: JPG, PNG. Recommended ≥ 640×480.",
                    "Use frames in-focus with minimal motion blur when possible.",
                    "Avoid frames with overlays that obscure anatomy or identifiers.",
                    "You can drag & drop files into the upload area."
                ],
                note:
                    "Privacy: Images are processed for detection only. Remove identifiers before upload.",
                ctaText: "Choose Images",
                ctaTo: "/diagnosis",
                },
                step3: {
                title: "3. Run the diagnosis",
                lead:
                    "Pick a method (Detection or Segmentation) and start the scan.",
                bullets: [
                    "Click Scan to begin. A progress bar will indicate status.",
                    "Stay on the page while processing completes.",
                    "You can cancel and re-run with different frames at any time."
                ],
                note:
                    "Performance: Typical runs complete in seconds per image depending on size and network.",
                ctaText: "Run a Test Scan",
                ctaTo: "/diagnosis",
                },
                step4: {
                title: "4. Check the results and options",
                lead:
                    "Review the summary (polyps detected, estimated burden) and per-polyp details.",
                bullets: [
                    "Use the table to see approximate size, area (% of image), and location (cx, cy).",
                    "Toggle overlays to compare original vs. highlighted findings.",
                    "Save results to History or download visuals for review."
                ],
                note:
                    "Clinical note: Measurements are automated estimates for decision support only.",
                ctaText: "Review Example Result",
                ctaTo: "/diagnosis",
                },
                step5: {
                title: "5. Browse through saved results",
                lead:
                    "Open History to revisit past cases, compare runs, or export artifacts.",
                bullets: [
                    "Filter by date or case label to quickly find a prior run.",
                    "Open any entry to re-review detections or re-export assets.",
                    "You can delete entries you no longer need."
                ],
                note:
                    "Retention: Stored results remain on your account until you remove them.",
                ctaText: "Go to History",
                ctaTo: "/history",
                },
            };

            const s = content[selected] ?? content.step1;

            return (
                <div className="grid md:grid-cols-[340px,1fr] gap-8">
                {/* Left stepper (unchanged, the one you liked) */}
                <LeftPanelBox onSelect={setSelected} selected={selected} />

                {/* Rich, filled content */}
                <div className="relative rounded-2xl shadow-md ring-1 ring-black/5 p-6 bg-gradient-to-br from-white to-teal-50">
                    {selectedItem && (
                    <img
                        src={selectedItem.img}
                        alt={selectedItem.value}
                        className="w-72 h-72 max-w-full object-contain mb-4 rounded-xl border bg-white shadow-inner"
                        key={selectedItem.label}
                    />
                    )}

                    <h3 className="text-lg md:text-xl font-semibold text-egypt-blue mb-2">
                    {s.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 mb-4">{s.lead}</p>

                    <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700 mb-4">
                    {s.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                    ))}
                    </ul>

                    <div className="text-xs md:text-sm text-teal-700 bg-teal-100/60 border border-teal-200 rounded-lg px-3 py-2">
                    {s.note}
                    </div>

                    <div className="mt-5">
                    <Link to={s.ctaTo}>
                        <button className="px-4 py-2 rounded-xl font-semibold bg-egypt-blue text-white hover:opacity-95">
                        {s.ctaText}
                        </button>
                    </Link>
                    </div>
                </div>
                </div>
            );
            })()}
        </div>
        </section>


      <Footer />
    </div>
  );
}
