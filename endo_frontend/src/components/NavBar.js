//Navigation Bar to move between pages

<<<<<<< Updated upstream
function NavBar(){
    return (
        <nav className="bg-sky-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-5xl font-bold">EndoDetect</div>
                <div className="space-x-4 text-xl">
                <a href="/diagnostic" className="text-gray-300 hover:text-white">Diagnostic</a>
                <a href="/analytic" className="text-gray-300 hover:text-white">Analytic</a>
                <a href="/showcase" className="text-gray-300 hover:text-white">Showcase</a>
=======
export default function NavBar() {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false); // mobile menu
  const [userMenuOpen, setUserMenuOpen] = useState(false); // desktop dropdown
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

  // Desktop nav link style
  const navLinkStyle = ({ isActive }) =>
    [
      "px-3 py-1.5 rounded-md font-medium transition-colors",
      isActive
        ? "bg-white/20 text-select-yellow"
        : "text-white/90 hover:text-white hover:bg-white/10"
    ].join(" ");

  return (
    <header className="relative text-white bg-egypt-blue shadow border-b border-white/20">
      <nav className="container mx-auto h-12 px-4 flex items-center justify-between">
        {/* Brand + desktop links */}
        <div className="flex items-center gap-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/favicon2.png" alt="logo" className="h-6" />
            EndoDetect
          </Link>
          {displayName && (
            <div className="flex items-center gap-4">
              <NavLink to="/diagnosis" className={navLinkStyle}>
                Diagnostic
              </NavLink>
              {/* <NavLink to="/analytic" className={navLinkStyle}>
                Analytics
              </NavLink> */}
            </div>
          )}
        </div>

        {/* Desktop auth with dropdown */}
        <div className="hidden md:flex items-center gap-5 relative">
          {displayName ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-white/20 hover:bg-white/30"
              >
                Hello {displayName} <span className="opacity-80">▾</span>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-lg ring-1 ring-black/5 overflow-hidden z-50 text-sm"
                >
                  <NavLink to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-1.5 hover:bg-slate-100">
                    Profile
                  </NavLink>
                  <NavLink to="/history" onClick={() => setUserMenuOpen(false)} className="block px-4 py-1.5 hover:bg-slate-100">
                    History
                  </NavLink>
                  {profile?.is_admin && (
                    <NavLink to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-1.5 hover:bg-slate-100">
                      Admin
                    </NavLink>
                  )}
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    Logout
                  </button>
>>>>>>> Stashed changes
                </div>
            </div>
        </nav>
    );
}

export default NavBar;