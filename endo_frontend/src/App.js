import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [s3Url, setS3Url] = useState("");

  const backendUrl = "http://127.0.0.1:8000"; // Adjust if needed

  const upload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_name", patientName);
    formData.append("patient_id", patientId);
    formData.append("notes", notes);

    setMessage("Uploading...");

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setS3Url(data.s3_url);
        setMessage(data.message);
      } else {
        setMessage(data.detail || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Polyp Detection Upload</h1>
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Image</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Patient Name</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 w-full"
            rows={3}
          ></textarea>
        </div>
        <button
          onClick={upload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Upload Scan
        </button>
      </div>

      {message && (
        <div className="mt-4 text-center">
          <p className="text-gray-800">{message}</p>
          {s3Url && (
            <a
              href={s3Url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block mt-2"
            >
              View Uploaded File
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
