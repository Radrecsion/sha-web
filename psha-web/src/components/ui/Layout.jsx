import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // default bisa "light" atau "dark"

  // update data-theme di <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Topbar
            onSaveClick={() => alert("Save clicked")}
            onLoadClick={(src) => alert("Load from " + src)}
            onHelpClick={() => alert("Help clicked")}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onMenuToggle={() => setSidebarOpen((v) => !v)}
            onThemeToggle={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            theme={theme}
          />
        </div>

        {/* Main content */}
        <main
          className="
            flex-1 overflow-y-auto p-6
            pt-14          /* jarak topbar */
            md:ml-64       /* jarak sidebar */
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
