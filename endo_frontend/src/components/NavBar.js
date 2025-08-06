//Navigation Bar to move between pages
import logo from '../image/logo.svg';
import {Link} from "react-router-dom"

function NavBar(){
    return (
        <div className= " w-screen h-[12vh] container mx-auto flex flex-wrap justify-between items-center shadow-md bg-white">
            <img src= {logo} alt="Logo" className="h-2/3"/>
            <div className="text-3xl font-bold text-egypt-blue">
                    EndoDetect
            </div>
            <div className="">

            </div>
            <Link to="/diagnosis" className="text-egypt-blue hover:text-clear-sky"> Diagnostic </Link>
            <Link to="/analytic" className="text-egypt-blue hover:text-clear-sky p-x-3">Analytic</Link>
            <Link to="/login">
                <button className="bg-egypt-blue text-white items-center px-6 py-2 font-bold rounded-full hover:opacity-75 transition duration-200">
                    Login
                </button>
            </Link>
        </div>
    );
}

export default NavBar;