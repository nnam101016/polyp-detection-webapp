// src/pages/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api"; // if you use it

export default function Login() {
  const [usernameOrEmail, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      // Call your backend
      const payload = usernameOrEmail.includes("@")
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      const res = await API.post("/login", payload);
      localStorage.setItem("token", res.data?.access_token);

      // go to the page they wanted, or home
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Login</h1>
        <p className="text-sm text-slate-500 mb-4">Sign in to continue.</p>

        {err && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}

        <label className="block text-sm font-medium">Username or Email</label>
        <input
          className="mt-1 mb-3 block w-full rounded-lg border-slate-300 focus:border-egypt-blue focus:ring-egypt-blue"
          value={usernameOrEmail}
          onChange={(e) => setU(e.target.value)}
          required
        />

        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          className="mt-1 mb-4 block w-full rounded-lg border-slate-300 focus:border-egypt-blue focus:ring-egypt-blue"
          value={password}
          onChange={(e) => setP(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-egypt-blue text-white font-semibold py-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
