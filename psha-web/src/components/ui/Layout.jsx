import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export const API_URL = window.RUNTIME_CONFIG?.API_URL || "http://localhost:8000/api/v1";

export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [currentProject, setCurrentProject] = useState(null);
  const [user, setUser] = useState(null);

  // Ambil user dari Google OAuth atau localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const avatar = urlParams.get("avatar");

    if (token && username) {
      const userData = { username, token, avatar };
      localStorage.setItem("access_token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("avatar", avatar || "");
      setUser(userData);

      // bersihkan URL query
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const token = localStorage.getItem("access_token");
      const username = localStorage.getItem("username");
      const avatar = localStorage.getItem("avatar");
      if (token && username) setUser({ username, token, avatar });
    }
  }, []);

  // Update theme di <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        setCurrentProject={setCurrentProject}
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
      <Topbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={() => console.log("New project")} // opsional
        onMenuToggle={() => setSidebarOpen(v => !v)}
        theme={theme}
        user={user}
        apiUrl={API_URL}
        onUserUpdate={setUser} // <- ini penting untuk update user setelah login/logout
      />


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-14 md:ml-64 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
