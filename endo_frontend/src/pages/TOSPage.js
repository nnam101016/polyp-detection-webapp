// src/pages/TOSPage.js
export default function TOSandFAQPage() {
  return (
    <section className="w-full py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: May 2025</p>

          <div className="prose max-w-none mt-6 prose-headings:text-egypt-blue prose-a:text-egypt-blue">
            <h2>1. Service Description</h2>
            <p>
              EndoDetect provides software that highlights potential lesions in endoscopic images to assist clinical review.
              It does not replace professional medical judgment.
            </p>

            <h2>2. Acceptable Use</h2>
            <ul>
              <li>Do not upload images containing personally identifiable information (PII) when possible.</li>
              <li>Do not attempt to disrupt, reverse engineer, or overload the service.</li>
              <li>Only upload content you have a right to use.</li>
            </ul>

            <h2>3. Privacy & Data</h2>
            <p>
              Uploaded images are processed to produce results. Saved results appear in your account history until deleted.
              We may aggregate usage statistics to improve the service.
            </p>

            <h2>4. Clinical Disclaimer</h2>
            <p>
              Measurements and detections are automated estimates and are intended for decision support, not a diagnosis.
              Always confirm with standard clinical practice.
            </p>

            <h2>5. Availability & Changes</h2>
            <p>
              We may update features, suspend service for maintenance, or change these terms. We’ll post updates on this page.
            </p>

            <h2>6. Contact</h2>
            <p>
              Questions about these terms? Reach us at <a href="mailto:support@endodetect.com">support@endodetect.com</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
