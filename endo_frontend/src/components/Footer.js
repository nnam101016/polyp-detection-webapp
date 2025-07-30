function Footer (){
    return (
        <footer className="flex gap-10 py-1 mx-auto text-md content-center justify-center flex-wrap text-gray-600">
            <a href="/diagnostic" className="">About Us</a>
            <a href="/analytic" className="hover:text-gray-400">User Feedbacks</a>
            <a href="/showcase" className="hover:text-gray-400">Copyright claims</a>
            <a href="/showcase" className="hover:text-gray-400">Private Policy</a>
            <a href="/showcase" className="hover:text-gray-400">Term of Service</a>
        </footer>
    );
}
export default Footer;