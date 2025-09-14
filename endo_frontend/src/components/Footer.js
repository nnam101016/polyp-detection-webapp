// src/components/Footer.js
import { Link } from "react-router-dom";

const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="w-full text-white bg-gradient-to-br from-egypt-blue to-teal-700">
      {/* content */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-3">
        {/* brand */}
        <div>
          <div className="flex items-center gap-3">
            <img src="/favicon2.png" alt="EndoDetect logo" className="h-9 w-9" />
            <span className="text-2xl font-extrabold tracking-tight">EndoDetect</span>
          </div>
          <p className="mt-3 text-base text-white/85 max-w-sm">
            Assistive lesion detection for endoscopic images — fast overlays and
            readable measurements to support clinical decisions.
          </p>
        </div>

        {/* nav 1 */}
        <div>
          <h3 className="text-xl font-bold mb-3">Developer Team</h3>
          <ul className="space-y-2 text-lg">
            <li>
              <Link className="hover:text-select-yellow transition" to="/about">
                About Us
              </Link>
            </li>
            <li>
              <Link className="hover:text-select-yellow transition" to="/contact">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* nav 2 */}
        <div>
          <h3 className="text-xl font-bold mb-3">Quality Control</h3>
          <ul className="space-y-2 text-lg">
            <li>
              <Link className="hover:text-select-yellow transition" to="/faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link className="hover:text-select-yellow transition" to="/feedback">
                Feedback
              </Link>
            </li>
            <li>
              <Link className="hover:text-select-yellow transition" to="/terms">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* divider */}
      <div className="border-t border-white/15" />

      {/* bottom bar */}
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm md:text-base text-white/85">
          © {year} RMIT University of Vietnam • All rights reserved
        </p>

        <div className="flex items-center gap-4">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTop();
            }}
            className="px-4 py-2 rounded-full bg-white text-egypt-blue font-semibold text-sm md:text-base hover:opacity-95 transition"
            aria-label="Back to top"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
