function Footer (){
    return (
        <footer className="flex mx-auto font-bold text-xl content-center justify-center flex-wrap">
            
                <button className="hover:bg-gray-200 text-sky-800 py-4 px-10 rounded-full">
                    About Us
                </button>

                <button className="hover:bg-gray-200 text-sky-800 py-4 px-10 rounded-full">
                    User Feedbacks
                </button>

                <button className="hover:bg-gray-200 text-sky-800 py-4 px-10 rounded-full">
                    Copyright claims
                </button>

                <button className="hover:bg-gray-200 text-sky-800 py-4 px-10 rounded-full">
                    Private Policy
                </button>

                <button className="hover:bg-gray-200 text-sky-800 py-4 px-10 rounded-full">
                    Term of Service
                </button>
            
        </footer>
    );
}

// each button lead to misc pages and the header have navbar to Home, FAQ, Analytics and Login

export default Footer;