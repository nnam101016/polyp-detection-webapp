import EndoSample from "../image/bg2.avif";
import CarouselWithText from "../components/CarouselWithText";
import {Link} from "react-router-dom"
import banner from '../image/home_banner.jpg';
import LeftPanelBox from "../components/LeftPanelBox";
import { useState } from "react";

import model1 from "../image/model1.png";
import model2 from "../image/model2.png";
import model3 from "../image/model3.png";

const paragraphInstruct = [
    {step: "step1", content: "Check the Navbar and click on what page you want to go."},
    {step: "step2", content: "Upload endoscopic image(s)/video in the supported format and size for analysis."},
    {step: "step3", content: "Select mode of analysis (low - high - segmentation), run the analysis and wait."},
    {step: "step4", content: "The result will appear in the same page, replacing the upload bar. You can choose to save and retry with different images and modes"},
    {step: "step5", content: "Go back to homepage and navigate Analytics page. Scroll through the collection. You can move, delete or download the results from there"}
]

function HomePage(){
    const [selected, setSelected] = useState("step1");

    const currText = paragraphInstruct.find(item => item.step === selected)?.content || "ERROR: No text are found matching the step";
    return (
        <div className="w-full">
            <div className="flex justify-center items-center flex-row">
                <img src={banner} alt="Endoscopic Homepage Banner" className="w-1/3 my-5"/>

                <div className="flex flex-col justify-center items-start w-1/3">
                    <h1 className="text-3xl text-egypt-blue flex-wrap">
                        EndoDetect: Lesion Detection in Endoscopic Images using Deep Learning
                    </h1>
                    <p className="w-full text-lg flex-wrap mt-2 mb-10 text-select-yellow">
                        Upload your images and let our advanced AI help you detect potential polyps with high accuracy.
                    </p>
                    <div className="flex justify-center items-center flex-row">
                        <Link to="diagnosis">
                            <button className="button-border">
                                Start Diagnosis
                            </button>
                        </Link>
                        <Link to="faq">
                            <button className="button-border">
                                Learn More
                            </button>
                        </Link>
                    </div>
                    
                </div>
            </div>

            <div className="flex h-1/2 justify-center items-center w-full">
                <img src={EndoSample} alt="Endoscopic Sample" className="w-1/3 h-3/4 object-cover"/>
                <div className="text-center w-1/3">
                    <h2 className="text-egypt-blue text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-black text-base mb-6 text-left flex-wrap">
                        Upload your endoscopic images and our Machine Learning model will analyze them to detect potential polyps with great accuracy
                        <br/><br/>
                        Get instant results and insights to assist in your medical evaluations.
                        <br/><br/>
                        Compatible with various image formats and work with multiple images at once along with video files,
                        make it a versatile tool for healthcare professionals.
                    </p>
                </div>
            </div>
            
            <CarouselWithText/>

            <div className="flex flex-row w-full justify-center items-center py-10 gap-10">
                <LeftPanelBox selected={selected} onSelect={setSelected} className = "w-1/4"/>
                <p className="flex flex-wrap text-lg text-egypt-blue w-1/4 h-1/2 text-left">
                    {currText}
                </p>
            </div>
        </div>
    );
}

export default HomePage;