import React, { useEffect, useState } from "react";
import API from "./api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setProfile(res.data);
      } catch (err) {
        setError("Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, []);

  if (error) return <p>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Profile</h2>
      <p>User ID: {profile.user_id}</p>
      <p>Email: {profile.email}</p>
      <p>Created At: {profile.created_at}</p>
    </div>
  );
}

export default Profile;
