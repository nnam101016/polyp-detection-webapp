import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import EndoSample from "../image/bg2.avif";

function HomePage(){
    const [steps, setSteps] = useState([
    "Step 1: Upload endoscopy image",
    "Step 2: Click Detect",
    "Step 3: View result and compare with model",
  ]);

  const [hoveredStep, setHoveredStep] = useState(null);

  const [carouselIndex, setCarouselIndex] = useState(0);

  const [modelImages, setModelImages] = useState([
    "/images/model1.png",
    "/images/model2.png",
    "/images/model3.png",
  ]);
    return (
        <><><><div>
            <NavBar />
            <div className="bg-[url(image/bg1.avif)] bg-cover w-screen h-96 flex justify-center items-center flex-col">
                <div className="font-bold text-sky-800 text-8xl p-4">
                    ENDODETECT
                </div>

                <p className="text-sky-600 w-2/3 text-2xl p-4">
                    Welcome to EndoDetect, your AI-powered tool for polyp detection in endoscopic images.
                    <br />
                    Upload your images and let our advanced algorithms assist you in identifying potential polyps.
                </p>

                <button className="text-white rounded-full my-6 bg-sky-800 px-8 py-4 text-xl font-semibold hover:bg-sky-600 transition duration-100">
                    Learn More
                </button>
            </div>
            <hr className="border-white border-4"></hr>
            <div className="bg-sky-800 flex p-8 h-96 justify-center items-center">
                <img src={EndoSample} alt="Endoscopic Sample" className="w-1/3 h-3/4 object-cover m-8" />
                <div className="text-center w-1/3 m-8">
                    <h2 className="text-white text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-white text-lg mb-6 text-left">
                        Upload your endoscopic images and our Machine Learning model will analyze them to detect potential polyps with great accuracy
                        <br />
                        Get instant results and insights to assist in your medical evaluations.
                        <br />
                        Compatible with various image formats and work with multiple images at once along with video files,
                        make it a versatile tool for healthcare professionals.

                    </p>
                </div>
            </div>
            <Footer />
        </div><div className="flex flex-row bg-white h-[600px] p-12 items-center justify-between">
                <div className="w-1/2 pr-8">
                    <h2 className="text-3xl font-bold text-sky-800 mb-6">Usage Instructions</h2>
                    <ul className="space-y-4 text-xl text-sky-700">
                        {steps.map(step => (
                            <li
                                key={step.id}
                                className={`cursor-pointer p-3 rounded-lg transition duration-200 ${hoveredStep === step.id ? "bg-sky-100 font-semibold" : "hover:bg-sky-50"}`}
                                onMouseEnter={() => setHoveredStep(step.id)}
                            >
                                {step.text}
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="w-1/2 pl-8">
                    <img
                        src={steps.find(s => s.id === hoveredStep)?.image}
                        alt="Step Preview"
                        className="w-full h-96 object-contain border-2 border-sky-200 rounded-xl shadow-lg" />
                </div>
            </div></><div className="bg-gray-100 py-12 flex flex-col items-center">
                <h2 className="text-3xl font-bold text-sky-800 mb-6">Model Comparison</h2>
                <div className="flex items-center justify-center space-x-4">
                    <button
                        onClick={() => setCarouselIndex((carouselIndex - 1 + modelImages.length) % modelImages.length)}
                        className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600"
                    >
                        Prev
                    </button>
                    <img
                        src={modelImages[carouselIndex]}
                        alt="Model Result"
                        className="w-[500px] h-[300px] object-contain border border-gray-400 rounded-lg" />
                    <button
                        onClick={() => setCarouselIndex((carouselIndex + 1) % modelImages.length)}
                        className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600"
                    >
                        Next
                    </button>
                </div>
            </div></><div className="bg-sky-800 text-white p-6 text-center">
                <p className="text-lg">Macrohard</p>
            
                <p>GitHub: <a href="https://github.com/nnam101016/polyp-detection-webapp" className="underline" target="_blank">github.com/ourrepo</a></p>
            </div></>
    );
}

export default HomePage;