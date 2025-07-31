import { useState } from "react";

function Signup() {
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
    <div className="bg-[url(image/bg2.avif)] bg-cover w-screen h-screen items-center flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-1/3 flex justify-center items-center flex-col">
        <h2 className="font-bold text-6xl text-sky-800">SIGNUP</h2>
        <input
          className="border rounded-md p-2 mb-4 w-full"
          type="email"
          placeholder="Full Name"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded-md p-2 mb-4 w-full"
          type="password"
          placeholder="Date Of Birth"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="border rounded-md p-2 mb-4 w-full"
          type="password"
          placeholder="User Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="border rounded-md p-2 mb-4 w-full"
          type="password"
          placeholder="Email"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </div>
  );
}

export default Signup;