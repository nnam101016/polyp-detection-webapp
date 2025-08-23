//   const handleLogin = async () => {
//     try {
//       const res = await API.post("/login", { email, password });
//       localStorage.setItem("token", res.data.access_token);
//       setMessage("Login successful!");
//     } catch (err) {
//       setMessage(err.response?.data?.detail || "Error logging in.");
//     }
//   };

import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = onLogin(username, password);
    if (!success) {
      setError("Invalid username or password.");
    } else {
      setError("");
    }
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="input-group">
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
      </div>

      <div className="input-group">
        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button type="submit" className="login-btn">
        Login
      </button>
    </form>
  );
};

export default Login;