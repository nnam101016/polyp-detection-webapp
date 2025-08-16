import {Link} from "react-router-dom";

function Footer (){
    return (
        <footer className="bar-style px-8">
            <Link to="/about" className="px-4  hover:text-select-yellow">About Us</Link>
            <Link to="/terms" className="px-4  hover:text-select-yellow">TOS</Link>
            <Link to="/faq" className="px-4  hover:text-select-yellow">FAQ</Link>
            <Link to="/contact" className="px-4  hover:text-select-yellow">Contact Us</Link>
        </footer>
    );
}
export default Footer;