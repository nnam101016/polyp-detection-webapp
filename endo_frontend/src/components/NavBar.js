import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import API from "../api";

export default function NavBar() {
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setProfile(null); return; }
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
      // keep a cached name so greeting appears instantly next time
      const name = res.data?.name || res.data?.email;
      if (name) localStorage.setItem("user_name", name);
    } catch (e) {
      console.error("profile fetch failed:", e);
      setProfile(null);
    }
  };

  useEffect(() => {
    // on mount and on route change, if token exist → (re)load profile
    loadProfile();
  }, [location.pathname]); // triggers when you navigate after login

  useEffect(() => {
    // listen for our custom auth event (same tab) and storage changes (other tabs)
    const onAuth = () => loadProfile();
    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    setProfile(null);
    window.dispatchEvent(new Event("auth-changed"));
  };

  const displayName = profile?.name || profile?.email || localStorage.getItem("user_name");

  return (
    <header className="bg-egypt-blue text-white">
      <nav className="container mx-auto h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo192.png" alt="logo" className="h-8" />
          EndoDetect
        </Link>

        <ul className="flex gap-6 items-center">
          <li><NavLink to="/diagnosis" className="hover:text-select-yellow">Diagnostic</NavLink></li>
          <li><NavLink to="/analytic"  className="hover:text-select-yellow">Analytic</NavLink></li>
          <li><NavLink to="/feedback"  className="hover:text-select-yellow">Feedback</NavLink></li>
          {displayName && (
            <>
              <li><NavLink to="/profile" className="hover:text-select-yellow">Profile</NavLink></li>
              <li><NavLink to="/history" className="hover:text-select-yellow">History</NavLink></li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-4">
          {displayName ? (
            <>
              <span className="text-select-yellow font-semibold">Hello {displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-2xl font-semibold hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-select-yellow text-egypt-blue px-4 py-2 rounded-2xl font-semibold hover:opacity-90"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
