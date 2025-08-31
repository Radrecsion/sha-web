import { useState, useEffect } from "react";
import { Menu, Sun, Moon } from "lucide-react";

export default function Topbar({
  activeTab,
  setActiveTab,
  onSaveClick,
  onLoadClick,
  onHelpClick,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const menu = [
    { key: "analysis", label: "PSHA" },
    { key: "datasource", label: "List Sumber Gempa" },
    { key: "gmpe", label: "List Atenuasi" },
  ];

  // cek preferensi awal theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--card)] text-[var(--text)] shadow">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Logo + Burger */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]"
          >
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold">SHA-Web</span>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={onSaveClick} className="hover:text-blue-400">Save</button>
            <button onClick={() => onLoadClick("file")} className="hover:text-green-400">Load</button>
            <button onClick={onHelpClick} className="hover:text-gray-400">Help</button>
          </nav>

          {/* Theme toggle always visible */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--hover)] transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          {/* Drawer Content */}
          <aside className="relative z-50 w-64 bg-[var(--card)] text-[var(--text)] p-6 h-full pt-16 shadow-lg">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            {/* Navigation */}
            <nav className="flex flex-col space-y-2 mt-6">
              {menu.map((item) => (
                <button
                  key={item.key}
                  className={`text-left px-3 py-2 rounded-lg transition ${
                    activeTab === item.key
                      ? "bg-blue-600 text-white"
                      : "hover:bg-[var(--hover)]"
                  }`}
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsDrawerOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <hr className="my-4 border-gray-600" />

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <button onClick={onSaveClick} className="text-left px-3 py-2 hover:bg-[var(--hover)]">Save</button>
              <button onClick={() => onLoadClick("file")} className="text-left px-3 py-2 hover:bg-[var(--hover)]">Load</button>
              <button onClick={onHelpClick} className="text-left px-3 py-2 hover:bg-[var(--hover)]">Help</button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
