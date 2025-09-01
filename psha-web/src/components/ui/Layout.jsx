import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // default light

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
      />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSaveClick={() => alert("Save clicked")}
          onLoadClick={(src) => alert("Load from " + src)}
          onHelpClick={() => alert("Help clicked")}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          onThemeToggle={toggleTheme}
          theme={theme}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-14 md:ml-64 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
