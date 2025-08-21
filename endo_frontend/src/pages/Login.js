import { useState } from "react";
import {Link} from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

//   const handleLogin = async () => {
//     try {
//       const res = await API.post("/login", { email, password });
//       localStorage.setItem("token", res.data.access_token);
//       setMessage("Login successful!");
//     } catch (err) {
//       setMessage(err.response?.data?.detail || "Error logging in.");
//     }
//   };

  return (
      <div className="w-full h-full items-center flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-1/3 flex justify-center items-center flex-col">
          <h2 className="font-bold text-6xl text-sky-800"> LOGIN </h2>
          <input
            className="border rounded-md p-2 mb-4 w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded-md p-2 mb-4 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="rounded-md p-2 mb-4 w-full bg-sky-800 text-white text-xl" >Login</button>
          <p>{message}</p>
          <a href="/signup" className="text-sky-800 opacity-50">Don't have an account? Sign up</a>
          <p className="my-2"> Or continue with </p>
          <button className="rounded-xl bordered border-2 border-black rounded-md p-4 w-full mb-4">
            Continue with Google
          </button>
          <button className="rounded-xl bordered border-2 border-black rounded-md p-4 w-full">
            Continue with Apple
        </button>
        </div>
      </div>
  );
}

export default Login;