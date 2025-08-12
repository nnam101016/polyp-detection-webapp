import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import EndoSample from "../image/bg2.avif";

import bgSample from "../image/bg2.avif";
import model1 from "../images/model1.png";
import model2 from "../images/model2.png";
import model3 from "../images/model3.png";

function HomePage() {
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
          src={EndoSample}
          alt="Why EndoDetect"
          className="flex-1 rounded-lg shadow-lg object-cover w-full sm:w-4/5 md:w-1/2"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why EndoDetect</h2>
          <p className="text-base sm:text-lg">
            Fast, accurate, and easy-to-use AI tool designed to help healthcare professionals detect potential polyps in endoscopic images with confidence.
          </p>
        </div>
      </section>

      {/* Carousel */}
      <section className="py-12 px-4">
        <CarouselWithText />
      </section>

      {/* Left Panel Instructions */}
      <section className="bg-clear-sky py-12 px-4 flex flex-col md:flex-row gap-8">
        {/* Left Side Panel */}
        <div className="relative flex-1">
          <div className="absolute -top-4 -left-4 w-full h-full bg-egypt-blue rounded-xl"></div>
          <div className="relative bg-clear-sky rounded-xl p-6 shadow-lg z-10">
            <img src={EndoSample} alt="Instruction" className="rounded-md mb-4" />
            <p className="text-left text-base sm:text-lg">
              Step-by-step guide to using EndoDetect effectively for your diagnosis workflow.
            </p>
          </div>
        </div>
        {/* Right Content */}
        <div className="flex-1 text-left flex flex-col justify-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">How to Use</h3>
          <p className="text-base sm:text-lg">
            Upload your endoscopic images, select the analysis mode, and receive AI-driven insights in seconds.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clear-sky py-8 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-6 text-lg font-medium">
          <Link to="/faq">FAQ</Link>
          <Link to="/tos">Terms of Service</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/about">About Us</Link>
        </div>
      </footer>
    </div>
  );
}
export default HomePage;