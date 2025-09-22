// src/pages/DiagnosisPage.js
import { useState } from "react";
import API from "../api";
import ImageCompare from "../components/ImageCompare";
import ResultView from "../ResultView";

export default function DiagnosisPage() {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [uploadResults, setUploadResults] = useState([]);
  const [model, setModel] = useState("yolo_9t");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10);
    setFiles(selectedFiles);
    setUploadResults([]);
    setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const upload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("patient_name", patientName);
    formData.append("patient_id", patientId);
    formData.append("notes", notes);
    formData.append("model_name", model);

    setMessage("Uploading & scanning…");
    setUploadResults([]);
    setLoading(true);

    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResults(res.data.results || []);
      setMessage(res.data.message || "Done.");
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="min-h-[70vh] max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center">Diagnostic</h1>

        {/* Upload card */}
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-3xl border border-gray-100">
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border p-2 w-full rounded-lg"
            >
              <option value="yolo_9t">YOLO 9t (detection)</option>
              <option value="yolo_11n">YOLO 11n (detection)</option>
              <option value="unet">U-Net (segmentation)</option>
              <option value="unetpp">U-Net++ (segmentation)</option>
              <option value="maskrcnn">Mask R-CNN (segmentation)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Images (max 10)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="border p-2 w-full rounded-lg"
              multiple
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              value={patientName}
              placeholder="Patient Name"
              onChange={(e) => setPatientName(e.target.value)}
              className="border p-2 w-full rounded-lg"
            />
            <input
              type="text"
              value={patientId}
              placeholder="Patient ID"
              onChange={(e) => setPatientId(e.target.value)}
              className="border p-2 w-full rounded-lg"
            />
            <input
              type="text"
              value={notes}
              placeholder="Notes"
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 w-full rounded-lg"
            />
          </div>

          <button
            onClick={upload}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full disabled:opacity-60"
          >
            {loading ? "In Progress" : "Start Diagnosis"}
          </button>
        </div>

        {/* Status/message */}
        {message && (
          <div className="mt-6 bg-white px-6 py-3 rounded-xl shadow text-sm text-center text-gray-800 font-medium border border-gray-100">
            {message}
          </div>
        )}

        {/* Results */}
        {uploadResults.length > 0 && (
          <div className="w-full flex flex-col items-center mt-10">
            <h2 className="text-xl font-semibold mb-4">Processed Results</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {uploadResults.map((res, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-[720px] max-w-full">
                    <ImageCompare
                      originalUrl={previewUrls[i]}
                      processedUrl={res.processed_s3_url}
                    />
                  </div>
                  <ResultView result={res.result} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
