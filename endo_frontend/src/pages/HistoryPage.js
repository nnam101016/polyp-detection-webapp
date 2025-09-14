import React from "react";
import UploadHistory from "../UploadHistory";

export default function HistoryPage() {
  return (
    <div className="w-full">
      <div className="min-h-[70vh] max-w-7xl mx-auto px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold my-8 text-center">Upload History</h1>
        <div className="w-full">
          <UploadHistory />
        </div>
      </div>
    </div>
  );
}
