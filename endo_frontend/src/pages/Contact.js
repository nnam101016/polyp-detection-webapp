export default function Contact() {
  // team emails (the ones you provided)
  const teamEmails = [
    "s3956465@rmit.edu.vn",
    "s3926751@rmit.edu.vn",
    "s3928848@rmit.edu.vn",
    "s3950664@rmit.edu.vn",
    "s3864219@rmit.edu.vn",
  ];

  return (
    <div className="bg-clear-sky min-h-screen px-4 py-12 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Contact Us</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full sm:w-4/5 md:w-2/3 lg:w-1/2 space-y-6">
        <p className="text-base sm:text-lg">
          We’re here to help! Feel free to reach out through any of the channels below:
        </p>

        <ul className="flex flex-col space-y-4 text-base sm:text-lg word-break break-words">
          <li><strong>Support Email:</strong> <a href="mailto:support@endodetect.com" className="text-blue-600 hover:underline">support@endodetect.com</a></li>
          <li><strong>Discord:</strong> <a href="https://discord.com/channels/1342737140257132566/1342737140257132569" className="text-blue-600 hover:underline">https://discord.com/channels/1342737140257132566/1342737140257132569</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/nnam101016/polyp-detection-webapp" className="text-blue-600 hover:underline">https://github.com/nnam101016/polyp-detection-webapp</a></li>
        </ul>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Team Contact Emails</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {teamEmails.map((e) => (
              <a key={e} href={`mailto:${e}`} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
                {e}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}