
import EndoSample from "../image/bg2.avif";
import CarouselWithText from "../components/CarouselWithText";
import {Link} from "react-router-dom"

function HomePage(){
    return (
        <div className="w-screen">
            <div className=" bg-contain h-screen w-screen flex justify-center items-center flex-col">
            
                <p className="w-2/3 text-2xl p-4">
                    Welcome to EndoDetect, your AI-powered tool for polyp detection in endoscopic images.
                    <br/>
                    Upload your images and let our advanced algorithms assist you in identifying potential polyps.
                </p>
                <Link to="diagnosis">
                    <button className="border-2 border-white rounded-full my-6 px-8 py-4 text-xl font-semibold hover:opacity-50 transition duration-100">
                        Learn More
                    </button>
                </Link>
            </div>

            <div className="bg-sky-800 flex p-8 h-96 justify-center items-center">
                <img src={EndoSample} alt="Endoscopic Sample" className="w-1/3 h-3/4 object-cover m-8"/>
                <div className="text-center w-1/3 m-8">
                    <h2 className="text-white text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-white text-lg mb-6 text-left">
                        Upload your endoscopic images and our Machine Learning model will analyze them to detect potential polyps with great accuracy
                        <br/>
                        Get instant results and insights to assist in your medical evaluations.
                        <br/>
                        Compatible with various image formats and work with multiple images at once along with video files,
                        make it a versatile tool for healthcare professionals.
                    </p>
                </div>
            </div>
            <CarouselWithText/>
        </div>
    );
}

export default HomePage;