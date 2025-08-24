// src/pages/AdminDashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/profile");
        const p = res.data;
        setProfile(p);

        // hard gate: non-admins get redirected away
        if (!p?.is_admin) {
          navigate("/", { replace: true, state: { forbidden: true } });
        }
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="w-full bg-gray-100">
        <div className="min-h-[70vh] max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-gray-600">Loading admin data…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-100">
        <div className="min-h-[70vh] max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // If we already redirected a non-admin, render nothing
  if (!profile?.is_admin) return null;

  // Admin-only content
  return (
    <div className="w-full bg-gray-100">
      <div className="min-h-[70vh] max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
        <AdminDashboard user={profile} />
      </div>
    </div>
  );
}
