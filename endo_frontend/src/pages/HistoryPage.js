// src/pages/HistoryPage.js
import React from "react";
import UploadHistory from "../UploadHistory"; // note the ../ because this page is inside /pages

export default function HistoryPage() {
  return (
    <div className="w-full bg-gray-100">
      {/* Centered content area, keeps footer at bottom via your layout */}
      <div className="min-h-[70vh] max-w-6xl mx-auto px-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold my-8 text-center">Upload History</h1>

        {/* History list/table/grid from your existing component */}
        <div className="w-full">
          <UploadHistory />
        </div>
      </div>
    </div>
  );
}
