import React, { useState, useEffect } from "react";
import API from "./api";

function App() {
  // Upload state
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [s3Url, setS3Url] = useState("");
  const [processedS3Url, setProcessedS3Url] = useState("");
  const [result, setResult] = useState("");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Tab state
  const [activeTab, setActiveTab] = useState(isLoggedIn ? "upload" : "login");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  const upload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_name", patientName);
    formData.append("patient_id", patientId);
    formData.append("notes", notes);

    setMessage("Uploading...");
    setResult("");
    setS3Url("");
    setProcessedS3Url("");

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setS3Url(res.data.s3_url);
      setProcessedS3Url(res.data.processed_s3_url);
      setMessage(res.data.message);
      setResult(res.data.result);
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
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Patient ID</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 w-full"
              rows={3}
            ></textarea>
          </div>
          <button
            onClick={upload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Scan
          </button>
        </div>
      )}

      {previewUrl && activeTab === "upload" && (
        <div className="mt-6 text-center">
          <p className="font-semibold mb-2">Uploaded Image Preview:</p>
          <img src={previewUrl} alt="Preview" className="max-w-xs rounded border" />
        </div>
      )}

      {processedS3Url && activeTab === "upload" && (
        <div className="mt-6 text-center">
          <p className="font-semibold mb-2">Processed Image with Detections:</p>
          <img src={processedS3Url} alt="Detections" className="max-w-xs rounded border" />
          <a
            href={processedS3Url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline block mt-2"
          >
            View Processed Image
          </a>
        </div>
      )}

      {result && activeTab === "upload" && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-bold">Scan Result: {result}</p>
        </div>
      )}

      {message && activeTab === "upload" && (
        <div className="mt-2 text-center">
          <p className="text-gray-800">{message}</p>
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
          {profile ? (
            <>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>User ID:</strong> {profile.user_id}</p>
              <p><strong>Created At:</strong> {profile.created_at}</p>
            </>
          ) : (
            <p>Loading your profile...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
