//Navigation Bar to move between pages
import logo from '../image/logo.svg';
import {Link} from "react-router-dom"

function NavBar(){
    return (
        <div className= "sticky bar-style shadow-lg">
            <Link className="self-start justify-self-start flex items-center" to="/">
                <img src= {logo} alt="Logo" className="h-16"/>
                <div className="text-3xl font-bold">
                        EndoDetect
                </div>
            </Link>

            <div className='flex items-center'>
                <Link to="/diagnosis" className=" mr-4  hover:text-select-yellow"> Diagnostic </Link>
                <Link to="/analytic" className="mr-4 hover:text-select-yellow ">Analytic</Link>
                <Link to="/login">
                    <button className="button-enlarge mr-4 py-2">
                        Login
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default NavBar;