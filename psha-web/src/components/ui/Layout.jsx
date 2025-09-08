import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export const API_URL =
  window.RUNTIME_CONFIG?.API_URL || "https://sha-api-production.up.railway.app/api/v1";

export default function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [currentProject, setCurrentProject] = useState(null);
  const [user, setUser] = useState(null);

  /** ================== LOAD USER ================== */
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

      // bersihkan query string
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const localToken = localStorage.getItem("access_token");
      const localUsername = localStorage.getItem("username");
      const localAvatar = localStorage.getItem("avatar");
      if (localToken && localUsername) {
        setUser({ username: localUsername, token: localToken, avatar: localAvatar });
      }
    }
  }, []);

  /** ================== SYNC THEME ================== */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
  };

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
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewProject={() => console.log("New project")}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          apiUrl={API_URL}
          onUserUpdate={setUser}
          onLogout={handleLogout}
          onHelp={() => console.log("Help clicked")}
          currentProject={currentProject}
        />

        <main className="flex-1 overflow-y-auto p-6 pt-14 md:ml-64 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
