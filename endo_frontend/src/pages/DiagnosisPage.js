import {Link} from "react-router-dom";

function DiagnosisPage() {
  return (
    <div>
      <h1>Diagnosis Page</h1>
      {/* Add your diagnosis page content here */}
      <Link to="/">
        <button className="text-blue-500 hover:underline mt-4">
          Back to Home
        </button>
      </Link>
    </div>
  );
}   

export default DiagnosisPage;