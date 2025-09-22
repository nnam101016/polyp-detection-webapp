// src/ProfilePage.js
import React, { useEffect, useState } from "react";
import API from "../api";

export default function ProfilePage({ onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      await API.put("/profile", {
        name: profile.name,
        workplace: profile.workplace,
        address: profile.address,
        occupation: profile.occupation,
        phone: profile.phone,
      });
      setIsEditing(false);
      await fetchProfile(); // refresh after save
      onProfileUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.detail || "Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Token is read by API interceptor; we just try to fetch
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
        <p className="text-gray-600">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProfile}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
        <p className="text-gray-700">No profile data.</p>
      </div>
    );
  }

return (
  <div className="w-full">
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded shadow w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Profile</h2>

        <p className="mb-2"><strong>Email:</strong> {profile.email}</p>
        <p className="mb-2"><strong>User ID:</strong> {profile.user_id}</p>
        <p className="mb-6"><strong>Created At:</strong>{" "}
          {profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              value={profile.name || ""}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className={`border p-2 w-full ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Workplace</label>
            <input
              type="text"
              value={profile.workplace || ""}
              onChange={(e) => setProfile((p) => ({ ...p, workplace: e.target.value }))}
              className={`border p-2 w-full ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              value={profile.address || ""}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              className={`border p-2 w-full ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Occupation</label>
            <input
              type="text"
              value={profile.occupation || ""}
              onChange={(e) => setProfile((p) => ({ ...p, occupation: e.target.value }))}
              className={`border p-2 w-full ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone || ""}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className={`border p-2 w-full ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>
        </div>

        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded w-full mt-6 hover:bg-blue-600"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded w-full mt-6 hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  </div>
);


}
