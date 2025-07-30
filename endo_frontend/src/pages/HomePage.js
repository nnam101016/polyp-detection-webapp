import NavBar from "../components/NavBar";
import Footer from "../components/Footer";


function HomePage(){
    return (
        <div>
            <NavBar/>
            <image src="../../../public/bg1.avif" alt="EndoDetect Logo" className="mx-auto w-1 h-1"/>
            <Footer/>
        </div>
    );
}

export default HomePage;