// src/pages/DiagnosisPage.js
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import API from "../api";
import addericon from "../image/file-add.svg";
import CarouselWithText from "../components/CarouselWithText";
import ImageCompare from "../components/ImageCompare";
import ResultView from "../ResultView";

export default function DiagnosisPage() {
  // ===== your states brought over from App.js =====
  const [files, setFiles] = useState([]);                 // raw File[]
  const [previewUrls, setPreviewUrls] = useState([]);     // string[]
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [uploadResults, setUploadResults] = useState([]); // backend response
  const [model, setModel] = useState("default");

  // ===== dropzone (keep friend's UX) =====
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    noClick: true,
    multiple: true,
    onDrop: accepted => {
      const selected = accepted.slice(0, 10); // cap at 10 like your App.js
      setFiles(selected);
      setUploadResults([]); // reset any old results
      const urls = selected.map(f => URL.createObjectURL(f));
      setPreviewUrls(urls);
    },
  });

  useEffect(() => {
    return () => {
      // cleanup object URLs
      previewUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const handleRemoveImage = () => {
    setFiles([]);
    setPreviewUrls([]);
    setUploadResults([]);
    setMessage("");
  };

  // ===== your original upload() logic, unchanged =====
  const upload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("patient_name", patientName);
    formData.append("patient_id", patientId);
    formData.append("notes", notes);
    formData.append("model_name", model);

    setMessage("Uploading...");
    setUploadResults([]);

    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResults(res.data.results);
      setMessage(res.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.detail || "Upload failed.");
    }
  };

  return (
    <div className="w-full bg-gray-100">
      <div className="min-h-[70vh] max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Uploader / Preview area (friend's UI kept) */}
        {files.length > 0 ? (
          <div className="w-full md:w-4/5 p-6 md:p-10 border-4 border-egypt-blue panel-sky flex flex-col items-center">
            <CarouselWithText
              cards={previewUrls.map((src, i) => ({ id: i, src }))}
            />

            {/* Controls bar: keep UI minimal, add Scan + Delete + Model */}
            <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <label className="font-semibold whitespace-nowrap">Model</label>
                <select
                  className="border rounded p-2 w-full"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                >
                  <option value="default">Default (YOLO)</option>
                  <option value="fast">Fast (YOLO)</option>
                  <option value="accurate">Accurate (YOLO)</option>
                  <option value="experimental">Experimental (YOLO)</option>
                  <option value="maskrcnn">Mask R-CNN (seg)</option>
                  <option value="unet">U‑Net (seg)</option>
                </select>
              </div>

              <button className="button-border" onClick={handleRemoveImage}>
                Delete
              </button>

              <button className="button-enlarge" onClick={upload}>
                Scan
              </button>
            </div>

            {/* Optional: patient meta (kept compact under an advanced section) */}
            <details className="w-full mt-4">
              <summary className="cursor-pointer font-semibold">
                Patient info (optional)
              </summary>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="border rounded p-2"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                />
                <input
                  className="border rounded p-2"
                  placeholder="Patient ID"
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                />
                <input
                  className="border rounded p-2 md:col-span-1 col-span-1"
                  placeholder="Notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </details>
          </div>
        ) : (
          <div className="h-2/3 w-full md:w-4/5">
            <div
              {...getRootProps()}
              className={
                isDragActive
                  ? "dropzone bg-opacity-100 w-full h-[60vh] gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
                  : "dropzone bg-opacity-50 w-full h-[60vh] gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
              }
            >
              <input {...getInputProps()} />
              {!isDragActive ? (
                <>
                  <button
                    type="button"
                    onClick={open}
                    className="button-enlarge w-3/4 h-16 md:h-20 shadow-xl text-xl md:text-3xl flex flex-row items-center justify-between"
                  >
                    <img src={addericon} alt="add_icon" className="h-full" />
                    Select File From Folder
                    <img src={addericon} alt="add_icon" className="h-full" />
                  </button>
                  <p className="text-egypt-blue text-opacity-50">
                    Accepted Image Types: JPG, JPEG, PNG, etc…
                  </p>
                </>
              ) : (
                <p className="font-bold text-5xl md:text-8xl text-white p-10">
                  Drop Files Here
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status/message */}
        {message && (
          <div className="mt-6 bg-white px-6 py-3 rounded shadow text-sm text-center text-gray-800 font-medium">
            {message}
          </div>
        )}

        {/* Processed results (your components) */}
        {uploadResults.length > 0 && (
          <div className="w-full flex flex-col items-center mt-10">
            <h2 className="text-xl font-semibold mb-4">Processed Results</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {uploadResults.map((res, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <ImageCompare
                    originalUrl={previewUrls[i]}
                    processedUrl={res.processed_s3_url}
                  />
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
