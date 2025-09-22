// src/pages/Contact.js
const teamEmails = [
  "s3956465@rmit.edu.vn",
  "s3926751@rmit.edu.vn",
  "s3928848@rmit.edu.vn",
  "s3950664@rmit.edu.vn",
  "s3864219@rmit.edu.vn",
];

export default function Contact() {
  return (
    <section className="w-full py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-egypt-blue">Contact Us</h1>
          <p className="mt-3 text-gray-700">
            We’re here to help. Use the channels below or email a team member directly.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <a href="mailto:support@endodetect.com" className="rounded-2xl bg-white ring-1 ring-black/5 p-4 hover:bg-teal-50">
              <div className="text-xl">✉️</div>
              <div className="font-semibold text-egypt-blue">Support Email</div>
              <div className="text-sm text-gray-600">support@endodetect.com</div>
            </a>

            <a href="https://github.com/nnam101016/polyp-detection-webapp" className="rounded-2xl bg-white ring-1 ring-black/5 p-4 hover:bg-teal-50">
              <div className="text-xl">🐙</div>
              <div className="font-semibold text-egypt-blue">GitHub</div>
              <div className="text-sm text-gray-600 break-all">github.com/nnam101016/polyp-detection-webapp</div>
            </a>

            <a href="https://discord.com/channels/1342737140257132566/1342737140257132569" className="rounded-2xl bg-white ring-1 ring-black/5 p-4 hover:bg-teal-50">
              <div className="text-xl">💬</div>
              <div className="font-semibold text-egypt-blue">Discord</div>
              <div className="text-sm text-gray-600 break-all">
                discord.com/channels/1342737140257132566/1342737140257132569
              </div>
            </a>

            <div className="rounded-2xl bg-white ring-1 ring-black/5 p-4">
              <div className="text-xl">📧</div>
              <div className="font-semibold text-egypt-blue mb-2">Team Contact Emails</div>
              <div className="grid grid-cols-1 gap-2">
                {teamEmails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 break-all">
                    {e}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Response times may vary by channel. For urgent issues, please email support directly.
          </div>
        </div>
      </div>
    </section>
  );
}
