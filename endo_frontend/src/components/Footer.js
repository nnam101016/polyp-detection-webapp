import {Link} from "react-router-dom";

function Footer (){
    return (
        <footer className="flex gap-10 py-1 mx-auto text-md content-center justify-center flex-wrap text-gray-600">
            <Link to="/analytic" className="hover:text-gray-400">User Feedbacks</Link>
            <Link to="/terms" className="hover:text-gray-400">Term of Services/Privacy Policies/FAQ</Link>
        </footer>
    );
}
export default Footer;