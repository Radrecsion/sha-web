import { useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";

export default function LoginModal({ show, onClose, onLogin, apiUrl, theme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!show) return null; // Hanya render jika show=true

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await axios.post(
        `${apiUrl}/auth/login`,
        `username=${username}&password=${password}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          withCredentials: true,
        }
      );

      const res = await axios.get(`${apiUrl}/auth/me`, { withCredentials: true });
      if (res.data.email) {
        const userData = { username: res.data.email, avatar: res.data.avatar || "" };
        onLogin(userData);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Login gagal, periksa username/password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google?redirect=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-md p-6 bg-[var(--card)] text-[var(--text)] rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2">
        <h2 className="text-lg font-bold mb-4 text-center">Login</h2>

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {errorMsg && <p className="text-red-500 text-sm mb-2 text-center">{errorMsg}</p>}

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={handleGoogleLogin}
            className={`flex items-center justify-center w-full border rounded px-3 py-2 transition-colors ${
              theme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-black hover:bg-gray-100"
            }`}
            disabled={loading}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Login with Google
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border rounded"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
