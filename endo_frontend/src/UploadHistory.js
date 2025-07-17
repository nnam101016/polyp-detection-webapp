import React, { useEffect, useState } from "react";
import API from "./api";

const UploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch upload history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading history...</p>;
  }

  if (history.length === 0) {
    return <p className="text-center text-gray-600">No uploads yet.</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.map((item, idx) => (
          <div key={idx} className="bg-white rounded shadow p-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="font-semibold text-sm mb-1">Original Image</p>
                <img
                  src={item.s3_url}
                  alt="Original"
                  className="w-full h-auto rounded border"
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Processed Image</p>
                <img
                  src={item.processed_s3_url}
                  alt="Processed"
                  className="w-full h-auto rounded border"
                />
              </div>
            </div>

            <div className="text-sm text-gray-700">
              <p><strong>Patient Name:</strong> {item.patient_name}</p>
              <p><strong>Patient ID:</strong> {item.patient_id}</p>
              <p><strong>Result:</strong> {item.result}</p>
              {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
              <p className="text-gray-500 text-xs mt-1">
                <strong>Uploaded At:</strong>{" "}
                {new Date(item.datetime).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;
