// src/components/NavBar.js
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function NavBar() {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setProfile(null); return; }
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
      const name = res.data?.name || res.data?.email;
      if (name) localStorage.setItem("user_name", name);
    } catch (e) {
      console.error("profile fetch failed:", e);
      setProfile(null);
    }
  };

  useEffect(() => { loadProfile(); }, [location.pathname]);
  useEffect(() => {
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
    navigate("/", { replace: true });
  };

  const displayName = profile?.name || profile?.email || localStorage.getItem("user_name");

  // Desktop link styling with larger, clearer text
  const desktopLink = ({ isActive }) =>
    [
      "px-3 py-2 rounded-full text-base font-semibold transition-colors",
      isActive
        ? "bg-white text-egypt-blue shadow-sm"
        : "text-white/90 hover:text-select-yellow"
    ].join(" ");

  // Mobile link styling, larger and padded
  const mobileLink = ({ isActive }) =>
    [
      "px-3 py-2 rounded-md text-lg font-medium transition",
      isActive
        ? "bg-white/10 border-l-4 border-select-yellow text-white"
        : "text-white/90 hover:text-select-yellow"
    ].join(" ");

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={desktopLink}
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {children}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-egypt-blue to-teal-700 text-white shadow">
      <nav className="container mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
          <img src="/favicon2.png" alt="logo" className="h-8" />
          EndoDetect
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-4 items-center">
          {displayName && (
            <>
              <li><NavItem to="/diagnosis">Diagnostic</NavItem></li>
              <li><NavItem to="/analytic">Analytics</NavItem></li>
              <li><NavItem to="/profile">Profile</NavItem></li>
              <li><NavItem to="/history">History</NavItem></li>
              {profile?.is_admin && (
                <li><NavItem to="/admin">Admin</NavItem></li>
              )}
            </>
          )}
        </ul>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-5">
          {displayName ? (
            <>
              <span className="text-select-yellow font-semibold text-base truncate max-w-[200px]">
                Hello {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-5 py-2 rounded-2xl font-semibold text-base hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-select-yellow text-egypt-blue px-5 py-2 rounded-2xl font-semibold text-base hover:opacity-90"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-lg"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden bg-egypt-blue/95 border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {displayName ? (
              <>
                <NavLink to="/diagnosis" className={mobileLink} onClick={()=>setOpen(false)}>Diagnostic</NavLink>
                <NavLink to="/analytic"  className={mobileLink} onClick={()=>setOpen(false)}>Analytics</NavLink>
                <NavLink to="/profile"   className={mobileLink} onClick={()=>setOpen(false)}>Profile</NavLink>
                <NavLink to="/history"   className={mobileLink} onClick={()=>setOpen(false)}>History</NavLink>
                {profile?.is_admin && (
                  <NavLink to="/admin" className={mobileLink} onClick={()=>setOpen(false)}>Admin</NavLink>
                )}
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="mt-2 bg-red-600 text-white px-5 py-2 rounded-2xl font-semibold text-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={()=>setOpen(false)}
                className="bg-select-yellow text-egypt-blue px-5 py-2 rounded-2xl font-semibold text-lg hover:opacity-90"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
