import React, { useState } from "react";

function AnalyticsPage() {
  const [selected, setSelected] = useState("train");

  const renderContent = () => {
    if (selected === "train") {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Train Score</h2>

          {/* Train bảng 1 */}
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm text-center mb-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Metric</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">mAP@0.5</th>
                <th className="border px-2 py-1">mAP@0.5:0.95</th>
                <th className="border px-2 py-1">Inference Speed</th>
                <th className="border px-2 py-1">Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border font-bold">YOLOv9t</td>
                <td className="border">0.9884</td>
                <td className="border">0.9323</td>
                <td className="border">0.9482</td>
                <td className="border">0.9722</td>
                <td className="border">0.7888</td>
                <td className="border">20.44 ms/img</td>
                <td className="border">2.13M params / 0.68G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">YOLO11n</td>
                <td className="border">0.9943</td>
                <td className="border">0.9521</td>
                <td className="border">0.9465</td>
                <td className="border">0.9803</td>
                <td className="border">0.8144</td>
                <td className="border">224.12 ms/img</td>
                <td className="border">2.62M params / 0.53G MACs</td>
              </tr>
            </tbody>
          </table>

          {/* Train bảng 2 */}
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Metric</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">IoU</th>
                <th className="border px-2 py-1">Dice</th>
                <th className="border px-2 py-1">Specificity</th>
                <th className="border px-2 py-1">Inference Speed</th>
                <th className="border px-2 py-1">Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border font-bold">Mask R-CNN</td>
                <td className="border">0.8822</td>
                <td className="border">0.8518</td>
                <td className="border">0.8526</td>
                <td className="border">0.7856</td>
                <td className="border">0.8526</td>
                <td className="border">0.9838</td>
                <td className="border">38.00 ms/img (26.31 img/s)</td>
                <td className="border">43.92M params / 134.59G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">U-Net</td>
                <td className="border">0.9272</td>
                <td className="border">0.8506</td>
                <td className="border">0.8717</td>
                <td className="border">0.8026</td>
                <td className="border">0.8717</td>
                <td className="border">0.9921</td>
                <td className="border">46.29 ms/img (21.60 img/s)</td>
                <td className="border">67.10M params / 3.22G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">U-Net++</td>
                <td className="border">0.9261</td>
                <td className="border">0.8915</td>
                <td className="border">0.8972</td>
                <td className="border">0.8368</td>
                <td className="border">0.8972</td>
                <td className="border">0.9903</td>
                <td className="border">52.11 ms/img (19.19 img/s)</td>
                <td className="border">68.16M params / 12.26G MACs</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (selected === "test") {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Test Score</h2>

          {/* Test bảng 1 */}
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm text-center mb-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Metric</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">mAP@0.5</th>
                <th className="border px-2 py-1">mAP@0.5:0.95</th>
                <th className="border px-2 py-1">Inference Speed</th>
                <th className="border px-2 py-1">Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border font-bold">YOLOv9t</td>
                <td className="border">0.9741</td>
                <td className="border">0.9115</td>
                <td className="border">0.9320</td>
                <td className="border">0.9610</td>
                <td className="border">0.7542</td>
                <td className="border">20.44 ms/img</td>
                <td className="border">2.13M params / 0.68G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">YOLO11n</td>
                <td className="border">0.9865</td>
                <td className="border">0.9402</td>
                <td className="border">0.9428</td>
                <td className="border">0.9734</td>
                <td className="border">0.7920</td>
                <td className="border">224.12 ms/img</td>
                <td className="border">2.62M params / 0.53G MACs</td>
              </tr>
            </tbody>
          </table>

          {/* Test bảng 2 */}
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Metric</th>
                <th className="border px-2 py-1">Precision</th>
                <th className="border px-2 py-1">Recall</th>
                <th className="border px-2 py-1">F1</th>
                <th className="border px-2 py-1">IoU</th>
                <th className="border px-2 py-1">Dice</th>
                <th className="border px-2 py-1">Specificity</th>
                <th className="border px-2 py-1">Inference Speed</th>
                <th className="border px-2 py-1">Complexity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border font-bold">Mask R-CNN</td>
                <td className="border">0.8620</td>
                <td className="border">0.8283</td>
                <td className="border">0.8355</td>
                <td className="border">0.7580</td>
                <td className="border">0.8355</td>
                <td className="border">0.9812</td>
                <td className="border">38.00 ms/img (26.31 img/s)</td>
                <td className="border">43.92M params / 134.59G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">U-Net</td>
                <td className="border">0.9165</td>
                <td className="border">0.8408</td>
                <td className="border">0.8600</td>
                <td className="border">0.7912</td>
                <td className="border">0.8600</td>
                <td className="border">0.9911</td>
                <td className="border">46.29 ms/img (21.60 img/s)</td>
                <td className="border">67.10M params / 3.22G MACs</td>
              </tr>
              <tr>
                <td className="border font-bold">U-Net++</td>
                <td className="border">0.9150</td>
                <td className="border">0.8781</td>
                <td className="border">0.8832</td>
                <td className="border">0.8210</td>
                <td className="border">0.8832</td>
                <td className="border">0.9894</td>
                <td className="border">52.11 ms/img (19.19 img/s)</td>
                <td className="border">68.16M params / 12.26G MACs</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (selected === "compare") {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Models Comparison</h2>

          {/* Models Comparison */}
          <table className="table-auto border-collapse border border-gray-400 w-1/2 text-sm text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2 py-1">Metric</th>
                <th className="border px-2 py-1">mAP@0.5</th>
                <th className="border px-2 py-1">mAP@0.5:0.95</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border font-bold">YOLOv9t</td>
                <td className="border">0.9438</td>
                <td className="border">0.7860</td>
              </tr>
              <tr>
                <td className="border font-bold">YOLO11n</td>
                <td className="border">0.9387</td>
                <td className="border">0.7867</td>
              </tr>
              <tr>
                <td className="border font-bold">Faster Rcnn R-50 FPN 3x</td>
                <td className="border">0.9053</td>
                <td className="border">0.6314</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Fast Diagnosis</h1>
        <p
          className={`cursor-pointer mb-3 ${
            selected === "train" ? "text-yellow-400 font-semibold" : ""
          }`}
          onClick={() => setSelected("train")}
        >
          Train Score
        </p>
        <p
          className={`cursor-pointer mb-3 ${
            selected === "test" ? "text-yellow-400 font-semibold" : ""
          }`}
          onClick={() => setSelected("test")}
        >
          Test Score
        </p>
        <p
          className={`cursor-pointer ${
            selected === "compare" ? "text-yellow-400 font-semibold" : ""
          }`}
          onClick={() => setSelected("compare")}
        >
          Models Comparison
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 overflow-auto">{renderContent()}</div>
    </div>
  );
}

export default AnalyticsPage;
