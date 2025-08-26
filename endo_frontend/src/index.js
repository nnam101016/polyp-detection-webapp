import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Diagnosis from "./pages/DiagnosisPage";
import HomePage from "./pages/HomePage";
import Analytics from "./pages/AnalyticsPage";
import Login from "./pages/Login";
import Profile from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import TOS from "./pages/TOSPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Error from "./pages/Error";
import FAQPage from "./pages/FAQPage";
import FeedbackForm from "./pages/FeedbackForm";

import NavBar from "./components/NavBar";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      {/* Sticky footer layout */}
      <div className="min-h-screen flex flex-col">
        <NavBar />
        {/* Page content grows to fill leftover space */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/analytic" element={<Analytics />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />

            
            <Route path="/terms" element={<TOS />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>

      </div>
    </Router>
  </React.StrictMode>
);
