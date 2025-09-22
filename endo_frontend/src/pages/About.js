// src/pages/About.js
import { Link } from "react-router-dom";

const team = [
  { name: "Nguyen Tan Tan", role: "Project Lead (PL)", email: "s3956465@endodetect.com" },
  { name: "Bui Quang Kien", role: "Data Scientist (DS)", email: "s3926751@endodetect.com" },
  { name: "Nguyen Phu Nhat Nam", role: "Software Developer (SD)", email: "s3928848@endodetect.com" },
  { name: "Pham Quang Huy", role: "Software Developer (SD)", email: "s3950664@endodetect.com" },
  { name: "Mai Chi Nghi", role: "Software Developer (SD)", email: "s3864219@endodetect.com" },
];

function Avatar({ name }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className="h-16 w-16 rounded-full bg-egypt-blue/10 text-egypt-blue grid place-items-center text-xl font-bold ring-1 ring-egypt-blue/20">
      {initials}
    </div>
  );
}

export default function About() {
  return (
    <section className="w-full py-14">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue">About EndoDetect</h1>
          <p className="mt-3 text-gray-700">
            EndoDetect is a collaborative project focused on assisting clinicians by highlighting potential lesions
            in endoscopic images with clear, readable overlays and simple measurements.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-egypt-blue">Team</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.email} className="rounded-2xl bg-white ring-1 ring-black/5 p-4 flex items-center gap-4">
                <Avatar name={m.name} />
                <div className="min-w-0">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-gray-600">{m.role}</div>
                  <a className="text-sm text-egypt-blue underline break-all" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-teal-50 ring-1 ring-teal-200 p-4 text-sm text-teal-900">
            We build with privacy, clarity, and speed in mind — the goal is assistive support that fits real clinical workflows.
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-block px-5 py-2.5 rounded-2xl font-semibold bg-egypt-blue text-white hover:opacity-95">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
