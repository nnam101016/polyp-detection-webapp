// ImageCompare.js
import ReactCompareImage from "react-compare-image";

const ImageCompare = ({ originalUrl, processedUrl }) => {
  return (
    <div className="w-60 border rounded shadow bg-white p-2">
      <ReactCompareImage
        leftImage={originalUrl}
        rightImage={processedUrl}
        sliderLineColor="#00AEEF"
      />
    </div>
  );
};

export default ImageCompare;
