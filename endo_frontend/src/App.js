import React, { useState, useEffect } from "react";
import API from "./api";
import UploadHistory from "./UploadHistory";
import ImageCompare from "./components/ImageCompare";
import AdminDashboard from "./components/AdminDashboard";
import ResultView from "./ResultView";

function App() {
  // Upload state
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [uploadResults, setUploadResults] = useState([]);
  const [model, setModel] = useState("default"); 

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isEditing, setIsEditing] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(isLoggedIn ? "upload" : "login");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 10); // max 10
    setFiles(selectedFiles);
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Handles
  const upload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("patient_name", patientName);
    formData.append("patient_id", patientId);
    formData.append("notes", notes);
    formData.append("model_name", model);

    setMessage("Uploading...");
    setUploadResults([]);

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadResults(res.data.results);
      setMessage(res.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.detail || "Upload failed.");
    }
  };

  const handleRegister = async () => {
    try {
      await API.post("/register", { email, password });
      setAuthMessage("Registration successful! You can now log in.");
    } catch (err) {
      setAuthMessage(err.response?.data?.detail || "Error registering.");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_id", res.data.user_id); // ✅ Store user_id
      localStorage.setItem("email", res.data.email);     // ✅ Store email
      setIsLoggedIn(true);
      setActiveTab("upload");
      setAuthMessage("Login successful!");
      fetchProfile();
    } catch (err) {
      setAuthMessage(err.response?.data?.detail || "Error logging in.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setProfile(null);
    setActiveTab("login");
    setAuthMessage("Logged out.");
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
    } catch (err) {
      setProfile(null);
    }
  };

  const handleSaveProfile = async () => {
  try {
    await API.put("/profile", {
      name: profile.name,
      workplace: profile.workplace,
      address: profile.address,
      occupation: profile.occupation,
      phone: profile.phone,
    });
    setIsEditing(false);
    fetchProfile(); // ✅ refresh with latest from backend
  } catch (err) {
    console.error("Failed to save profile:", err);
    alert("Error saving profile.");
  }
};


  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Polyp Detection Webapp
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded ${
                activeTab === "upload" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded ${
                activeTab === "profile" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded ${
                activeTab === "history" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              History
            </button>
            
            {profile?.is_admin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded ${
                  activeTab === "admin" ? "bg-blue-500 text-white" : "bg-white"
                }`}
              >
                Admin
              </button>
            )}


            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-500 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("login")}
              className={`px-4 py-2 rounded ${
                activeTab === "login" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`px-4 py-2 rounded ${
                activeTab === "register" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* Tabs content */}
      {activeTab === "upload" && isLoggedIn && (
        <div className="bg-white p-6 rounded shadow w-full max-w-lg">
          {/* ✅ Model selection */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="border p-2 w-full">
              <option value="default">Default Model</option>
              <option value="fast">Fast Model</option>
              <option value="accurate">Accurate Model</option>
              <option value="experimental">Experimental Model</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Images (max 10)</label>
            <input type="file" onChange={handleFileChange}
              className="border p-2 w-full" multiple accept="image/*" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Patient Name</label>
            <input type="text" value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="border p-2 w-full" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Patient ID</label>
            <input type="text" value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border p-2 w-full" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="border p-2 w-full" rows={3}></textarea>
          </div>

          <button onClick={upload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Scan
          </button>
        </div>
      )}

      {uploadResults.length > 0 && activeTab === "upload" && (
        <div className="w-full flex flex-col items-center mt-10">
          <h2 className="text-lg font-semibold mb-4">Processed Results:</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {uploadResults.map((res, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <ImageCompare
                  originalUrl={previewUrls[i]} // ⬅ original image from preview
                  processedUrl={res.processed_s3_url} // ⬅ processed image from backend
                />
                <ResultView result={res.result} />
              </div>
            ))}
          </div>
        </div>
      )}

      {message && activeTab === "upload" && (
        <div className="w-full flex justify-center mt-6">
          <div className="bg-white px-6 py-3 rounded shadow text-sm text-center text-gray-800 font-medium">
            {message}
          </div>
        </div>
      )}


      {activeTab === "login" && (
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Login
          </button>
          {authMessage && (
            <p className="mt-2 text-center text-gray-700">{authMessage}</p>
          )}
        </div>
      )}

      {activeTab === "register" && (
        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Register</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleRegister}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Register
          </button>
          {authMessage && (
            <p className="mt-2 text-center text-gray-700">{authMessage}</p>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>

          <p className="mb-2"><strong>Email:</strong> {profile?.email}</p>
          <p className="mb-2"><strong>User ID:</strong> {profile?.user_id}</p>
          <p className="mb-4"><strong>Created At:</strong> {new Date(profile?.created_at).toLocaleString()}</p>

          <div className="text-left">
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              value={profile?.name || ""}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className={`border p-2 w-full mb-4 ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />

            <label className="block font-semibold mb-1">Workplace</label>
            <input
              type="text"
              value={profile?.workplace || ""}
              onChange={(e) => setProfile((p) => ({ ...p, workplace: e.target.value }))}
              className={`border p-2 w-full mb-4 ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />

            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              value={profile?.address || ""}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              className={`border p-2 w-full mb-4 ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />

            <label className="block font-semibold mb-1">Occupation</label>
            <input
              type="text"
              value={profile?.occupation || ""}
              onChange={(e) => setProfile((p) => ({ ...p, occupation: e.target.value }))}
              className={`border p-2 w-full mb-4 ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />

            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              value={profile?.phone || ""}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className={`border p-2 w-full mb-4 ${
                isEditing ? "" : "bg-gray-100 text-gray-600 cursor-not-allowed"
              }`}
              readOnly={!isEditing}
            />
          </div>

          {isEditing ? (
            <button
              onClick={handleSaveProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2 hover:bg-blue-600"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2 hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <UploadHistory />
      )}

      {activeTab === "admin" && profile?.is_admin && (
        <AdminDashboard user={profile} />
      )}

    </div>
  );
}

export default App;