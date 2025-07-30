//Navigation Bar to move between pages
import logo from '../image/logo.svg';

function NavBar(){
    return (
        <nav className="bg-sky-800">
            <div className="container flex justify-between items-center">
               <img src= {logo} alt="Logo" className="w-16 h-16"></img>
                <div className="space-x-12 text-xl ml-auto">
                    <a href="/diagnostic" className="text-sky-300 hover:text-white">Diagnostic</a>
                    <a href="/analytic" className="text-sky-300 hover:text-white">Analytic</a>
                    <button className="bg-white text-sky-800 px-4 py-1 rounded hover:bg-sky-100 hover:text-sky-900">
                        Login
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;