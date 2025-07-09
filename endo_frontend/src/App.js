import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [s3Url, setS3Url] = useState("");

  const backendUrl = "http://127.0.0.1:8000"; // Adjust when deployed

  const register = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${backendUrl}/register`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message || data.detail);
  };

  const login = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setMessage("Login successful!");
    } else {
      setMessage(data.detail);
    }
  };

  const upload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", token);

    const res = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setS3Url(data.s3_url);
    setMessage(data.message || data.detail);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Polyp Detection Webapp</h1>

      <div className="bg-white p-4 rounded shadow w-full max-w-md mb-4">
        <h2 className="font-semibold mb-2">Register / Login</h2>
        <input
          className="border p-2 w-full mb-2"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={register}
          >
            Register
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={login}
          >
            Login
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow w-full max-w-md mb-4">
        <h2 className="font-semibold mb-2">Upload Image</h2>
        <input
          className="border p-2 w-full mb-2"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={upload}
        >
          Upload
        </button>
      </div>

      {message && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded w-full max-w-md">
          {message}
        </div>
      )}

      {s3Url && (
        <div className="mt-2">
          <a
            href={s3Url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Uploaded File
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
