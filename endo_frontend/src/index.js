import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Diagnosis from "./pages/DiagnosisPage";
import HomePage from "./pages/HomePage";
import Analytics from "./pages/AnalyticsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TOSandFAQPage from "./pages/TOSandFQAPage";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
// TODO: import a page for error

import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <>
      <Router>
        <NavBar/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/analytic" element={<Analytics/>} />
          <Route path="/profile" element={<></>}></Route>
          <Route path="/terms" element={<TOSandFAQPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
        <Footer />
      </Router>
      
    </>
  </React.StrictMode>
);
