//Navigation Bar to move between pages

function NavBar(){
    return (
        <nav className="bg-sky-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-5xl font-bold">EndoDetect</div>
                <div className="space-x-4 text-xl">
                <a href="/diagnostic" className="text-sky-300 hover:text-white">Diagnostic</a>
                <a href="/analytic" className="text-sky-300 hover:text-white">Analytic</a>
                <a href="/showcase" className="text-sky-300 hover:text-white">Showcase</a>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;