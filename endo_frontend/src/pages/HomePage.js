import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import EndoSample from "../image/bg2.avif";
import image from "../image/why detect.png";
import {Link} from "react-router-dom";
import LeftPanelBox, { navItems } from "../components/LeftPanelBox";


function HomePage() {
  const [selected, setSelected] = useState("step1", "step2", "step3", "step4", "step5");

  const selectedItem = navItems.find((i) => i.label === selected) || null;

  return (
    <div className="w-screen">

      {/* Hero Section */}
      <div className="bg-clear-sky min-h-screen flex flex-col md:flex-row justify-center items-center px-4 py-12">
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold">EndoDetect: Lesion Detection in Endoscopic Images using Deep Learning</h1>
          <p className="text-lg sm:text-xl">
            Upload your images and let our advanced AI help you detect potential polyps with high accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-start justify-center">
            <Link to="/diagnosis" className="btn-primary text-center">Start Diagnosis</Link>
            <Link to="#why" className="btn-primary text-center">Learn More</Link>
          </div>
        </div>
        <div className="flex-1 mt-8 md:mt-0 md:ml-8">
          <img src={EndoSample} alt="Endoscopic Sample" className="rounded-lg shadow-lg w-full object-cover" />
        </div>
      </div>

      {/* Why EndoDetect */}
      <section id="why" className="bg-clear-sky py-12 px-4 flex flex-col md:flex-row items-center gap-8">
        <img
          src={image}
          alt="Why EndoDetect?"
          className="w-full md:w-1/3 flex flex-col items-center panel-sky p-6 shadow-lg"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why EndoDetect?</h2>
          <p className="text-base sm:text-lg">
            EndoDetect helps doctors quickly and accurately identify polyps in endoscopic images, 
            improving diagnostic efficiency and patient care. Early detection is vital in preventing colorectal cancer,
            and AI support reduces the risk of missed findings. The tool provides reliable assistance, 
            enabling doctors to work with confidence and patients to receive timely treatment.
          </p>
        </div>
      </section>
      

      {/* Left Panel Instructions */}
      <section className="bg-clear-sky py-12 px-4 flex flex-col md:flex-row gap-8">
        {/* Left Side Panel */}
      <div className="flex gap-8 p-8">
        <div className="w-full md:w-1/3 bg-clear-sky rounded-2xl p-6 flex flex-col items-center shadow-lg">
        <LeftPanelBox onSelect={setSelected} selected={selected} />
      </div>
      
        {/* Right Content */}
        <div className="flex-1 text-left flex flex-col justify-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">How to Use</h3>
          <p className="text-base sm:text-lg">
                  To get the most out of the detection tool, simply follow the steps in order. 
                  Start by uploading the applicable medical images, then run the AI-powered diagnosis.  
                  Once completed, you can check the detailed results and available options, and finally browse through your saved results for future reference.
                  Each step is designed to guide you smoothly through the process.     
          </p>
        </div>
      </div>

      <div>
         {selectedItem && (
          <img
            src={selectedItem.img}
            alt={selected}
            className="max-w-md w-full rounded shadow mb-4 block"
            onError={(e) => {
              console.error("Image failed:", selectedItem.img);
              e.currentTarget.alt = "Image failed to load";
            }}
          />
        )}

        {selectedItem && (
          <p className="text-gray-700">{selectedItem.value}</p>
        )}
      </div>
      </section>


      {/* Footer */}
     <footer/>
    </div>
  );
}
export default HomePage;