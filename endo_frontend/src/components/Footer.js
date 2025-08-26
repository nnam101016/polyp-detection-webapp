import {Link} from "react-router-dom";

const scrollToSection = (targetedID) => {
    const targetSection = document.getElementById(targetedID);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' }); // 'smooth' for animated scroll
    }
}

function Footer (){
    return (
        <footer className="bar-style flex flex-col h-full p-8 items-center justify-center text-center">
            <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
                
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-xl">Developer Team</h1>
                    <Link to="/about" className="text-white hover:text-select-yellow">About Us</Link>
                    <Link to="/contact" className="text-white hover:text-select-yellow">Contact Us</Link>
                </div>  

                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-xl">Quality Control</h1>
                    <Link to="/faq" className="text-white hover:text-select-yellow">FAQ</Link>
                    <Link to="/feedback" className="text-white hover:text-select-yellow">Feedback</Link>
                </div>

                <div className="flex flex-col gap-2 items-center">
                    <h1>@2025 RMIT UNIVERSITY OF VIETNAM</h1>
                    <Link to="/terms" className="text-white hover:text-select-yellow">TERMS OF SERVICE</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;