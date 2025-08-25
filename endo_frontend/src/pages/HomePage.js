import CarouselWithText from "../components/CarouselWithText";
import {Link} from "react-router-dom"
import banner from '../image/home_banner.jpg';
import LeftPanelBox, { navItems } from "../components/LeftPanelBox";
import { useState } from "react";
import Footer from "../components/Footer";

import image from "../image/why detect.png";
import sam1 from "../image/bg2.avif"
import sam2 from "../image/bg1.avif"
import sam3 from "../image/login_banner.jpg"

const cards = [
    {id: 1, src: sam1, text: "This is input"}, 
    {id: 2, src: sam2, text: "This is detectation"}, 
    {id: 3, src: sam3, text: "This is segmentation"},  
]

function HomePage(){

    const [selected, setSelected] = useState("step1", "step2", "step3", "step4", "step5");

    const selectedItem = navItems.find((i) => i.label === selected) || null;
    return (
        <div className="h-full w-full flex flex-col items-center gap-32 bg-white">
            <div id="quick-start" className="flex justify-center items-center flex-row">
                <img src={banner} alt="Endoscopic Homepage Banner" className="w-1/3 my-5"/>

                <div className="flex flex-col justify-center items-start w-1/3">
                    <h1 className="text-4xl text-egypt-blue flex-wrap font-bold">
                        EndoDetect: Lesion Detection in Endoscopic Images using Deep Learning
                    </h1>
                    <p className="w-full text-xl flex-wrap mt-2 mb-10 text-select-yellow">
                        Upload your images and let our advanced AI help you detect potential polyps with high accuracy.
                    </p>
                    <div className="flex w-full justify-center items-center flex-row gap-6">
                        <Link to="diagnosis">
                            <button className="button-border">
                                Start Diagnosis
                            </button>
                        </Link>
                        <Link to="faq">
                            <button className="button-border">
                                Learn More Here
                            </button>
                        </Link>
                    </div>
                    
                </div>
            </div>

            {/* Why EndoDetect */}
            <section id="why" className="bg-egypt-blue w-full py-12 px-4 flex flex-col md:flex-row justify-center gap-8">
                <div className="flex flex-row w-2/3 items-center">
                    <img
                    src={image}
                    alt="Why EndoDetect?"
                    className="w-full md:w-1/2 flex flex-col items-center p-6"
                    />
                    <div className="flex-1 text-white text-center md:text-left">
                    <h2 className="text-2xl text-white sm:text-3xl font-bold mb-4">Why EndoDetect?</h2>
                    <p className="text-base text-white sm:text-lg">
                        EndoDetect helps doctors quickly and accurately identify polyps in endoscopic images, 
                        improving diagnostic efficiency and patient care. Early detection is vital in preventing colorectal cancer,
                        and AI support reduces the risk of missed findings. The tool provides reliable assistance, 
                        enabling doctors to work with confidence and patients to receive timely treatment.
                    </p>
                    </div>
                </div>
        </section>

        <div id="model" className="w-3/4 flex flex-col items-center">
            <h1 className="text-3xl text-egypt-blue font-bold">Models Comparision</h1>
            <CarouselWithText cards={cards}/>
        </div>
            

            {/* Left Panel Instructions */}
        <section id="steps" className="w-full flex flex-col md:flex-row items-center justify-center">
            <div  className="w-3/4 flex flex-col items-center">
                <h1 className="text-xl sm:text-2xl font-bold mb-4">How to Use</h1>
                <div className=" flex flex-row gap-6 p-10 ">
                    <div>
                        <LeftPanelBox onSelect={setSelected} selected={selected} />
                    </div>

                    <div>
                        {selectedItem && (
                        <img
                            src={selectedItem.img}
                            alt={selected}
                            className="w-64 h-64 rounded shadow mb-4 block"
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
                </div>
                
            </div>
        </section>

        
        {/* Footer stays at the bottom */}
        <Footer/>
        </div>
    );
}

export default HomePage;