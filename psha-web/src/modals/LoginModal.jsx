import { useState, useEffect } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";

export default function LoginModal({ onClose, onLogin, apiUrl, theme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-check Google callback (misal ?login=success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "success") {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  }, [onClose]);

  /** ----------------------------- */
  /** Manual login */
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

      // Ambil user profile
      const res = await axios.get(`${apiUrl}/auth/me`, { withCredentials: true });
      if (res.data.email) {
        const userData = { username: res.data.email, avatar: "" };
        onLogin(userData);
        setSuccess(true);

        // auto close modal
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Login gagal, periksa username/password");
    } finally {
      setLoading(false);
    }
  };

  /** ----------------------------- */
  /** Google OAuth login */
  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google?redirect=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className={`modal-overlay ${success ? "animate-fade-in" : ""}`} onClick={onClose}></div>

      {/* Modal Content */}
      <div className={`modal-content ${success ? "animate-slide-fade-in" : ""}`}>
        <h2 className="text-lg font-bold mb-4">Login</h2>

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading || success}
        />
        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || success}
        />

        {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

        {success && (
          <div className="toast toast-success mb-2 text-center">
            Login berhasil!
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center"
            disabled={loading || success}
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
            disabled={loading || success}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Login with Google
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border rounded"
            disabled={loading || success}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
