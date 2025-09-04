import { useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc"; // ikon Google

export default function LoginModal({ onClose, onLogin, apiUrl, theme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/auth/login`,
        `username=${username}&password=${password}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = res.data.access_token;
      const userData = {
        username,
        avatar: res.data.avatar || "",
        token,
      };

      localStorage.setItem("access_token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("avatar", userData.avatar);

      onLogin(userData);
      onClose();
    } catch (err) {
      alert("Login gagal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="p-6 rounded-lg shadow-md w-80 card-custom"
        style={{ backgroundColor: "var(--card)", color: "var(--text)" }}
      >
        <h2 className="text-lg font-bold mb-4">Login</h2>

        {/* Username / Password */}
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <a
            href={`${apiUrl}/auth/google`}
            className={`flex items-center justify-center w-full border rounded px-3 py-2 transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Login with Google
          </a>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border rounded"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
