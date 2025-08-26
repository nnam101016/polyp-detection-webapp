import {Link} from "react-router-dom";

const scrollToSection = (targetedID) => {
    const targetSection = document.getElementById(targetedID);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' }); // 'smooth' for animated scroll
    }
}

function Footer (){
    return (
        <footer className="bar-style flex flex-col h-full p-8">
            <div className="grid grid-cols-3 grid-rows-2 gap-10 w-full relative">
                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl">Developer Team</h1>
                        <Link to="/about" className= "text-white hover:text-select-yellow">About Us</Link>
                        <Link to="/contact" className="text-white hover:text-select-yellow">Contact Us</Link>
                    </div>  

                    <div className="flex flex-col justify-center gap-2">
                        <h1 className="text-xl">Quality Control</h1>
                        
                        <Link to="/faq" className="text-white hover:text-select-yellow">FAQ</Link>
                        <Link to="/feedback"  className="text-white hover:text-select-yellow">Feedback</Link>
                    </div>
                <div className="flex flex-col items-start gap-2 row-span-2">
                    <h1 className="text-xl">Explore More</h1>
                    <button onClick={() => scrollToSection('quick-start')} className="text-white hover:text-select-yellow">Quick Start</button>
                    <button onClick={() => scrollToSection('nav')} className="text-white hover:text-select-yellow">Check Profile</button>
                    <button onClick={() => scrollToSection('model')} className="text-white hover:text-select-yellow">Model Research</button>
                    <button onClick={() => scrollToSection('steps')} className="text-white hover:text-select-yellow">How to Navigate</button>
                </div>
                <div className="flex flex-row self-end col-span-2 gap-20">
                    <h1>@2025 RMIT UNIVERSITY OF VIETNAM</h1>
                    <Link to="/terms" className="text-white hover:text-select-yellow">TERMS OF SERVICE</Link>
                </div>
            </div>
        </footer>
    );
}
export default Footer;