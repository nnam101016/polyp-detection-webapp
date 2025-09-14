// src/pages/FeedbackForm.js
import { useState } from "react";

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", topic: "General", message: "" });
  const [status, setStatus] = useState({ done: false, error: "" });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // simple client-side validation
    if (!form.name || !form.email || !form.message) {
      setStatus({ done: false, error: "Please fill your name, email and message." });
      return;
    }
    // no backend? simulate success
    console.log("Feedback submitted:", form);
    setStatus({ done: true, error: "" });
  };

  if (status.done) {
    return (
      <section className="w-full bg-gradient-to-b from-gray-50 to-teal-50 py-14">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-10 text-center">
            <h1 className="text-3xl font-extrabold text-egypt-blue">Thank you!</h1>
            <p className="mt-3 text-gray-700">
              Your feedback helps us improve EndoDetect. We’ll review it shortly.
            </p>
            <button
              onClick={() => { setForm({ name: "", email: "", topic: "General", message: "" }); setStatus({ done: false, error: "" }); }}
              className="mt-6 px-5 py-2.5 rounded-2xl font-semibold bg-egypt-blue text-white hover:opacity-95"
            >
              Send another response
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-14">
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue mb-6">Feedback</h1>
          <p className="text-gray-700 mb-6">
            Tell us what’s working well and what we can improve. We read every message.
          </p>

          {status.error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {status.error}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-xl border ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-xl border ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Topic</label>
                <select
                  name="topic"
                  value={form.topic}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-xl border ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option>General</option>
                  <option>Bug report</option>
                  <option>Feature request</option>
                  <option>Design / UI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-xl border ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Share your thoughts…"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-gray-500">By submitting, you agree to our data handling for support purposes.</p>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl font-semibold bg-egypt-blue text-white hover:opacity-95"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
