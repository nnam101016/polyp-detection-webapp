// src/components/ImageCompare.js
import React from "react";
import ReactCompareImage from "react-compare-image";

export default function ImageCompare({ originalUrl, processedUrl }) {
  return (
    <div className="w-full rounded overflow-hidden shadow">
      <ReactCompareImage
        leftImage={originalUrl}
        rightImage={processedUrl}
        sliderLineColor="#3b82f6"   // Tailwind blue-500
        handleSize={42}             // slightly bigger handle
        sliderLineWidth={3}
      />
    </div>
  );
}
