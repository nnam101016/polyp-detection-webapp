import {Link} from "react-router-dom";

function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics Page</h1>
      <p>This is the analytics page where you can view various statistics and data visualizations.</p>
      {/* Add your analytics components here */}
      <Link to="/">
        <button className="text-blue-500 hover:underline mt-4">
          Back to Home
        </button>
      </Link>
    </div>
  );
}

export default AnalyticsPage;