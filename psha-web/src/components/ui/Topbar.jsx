import { useState, useEffect } from "react";
import { Menu, Sun, Moon } from "lucide-react";

export default function Topbar({
  activeTab,
  setActiveTab,
  onSaveClick,
  onLoadClick,
  onHelpClick,
  onMenuToggle,
  onThemeToggle,
  theme,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const darkMode = theme === "dark";

  const menu = [
    { key: "analysis", label: "PSHA" },
    { key: "datasource", label: "List Sumber Gempa" },
    { key: "gmpe", label: "List Atenuasi" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--card)] text-[var(--text)] shadow flex items-center px-4">
      {/* Left: Burger + Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            setIsDrawerOpen(true);
            onMenuToggle?.();
          }}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-xl">SHA-Web</span>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex ml-auto items-center space-x-4">
        <button className="dropdown-trigger" onClick={onSaveClick}>
          Save
        </button>
        <button className="dropdown-trigger" onClick={() => onLoadClick("file")}>
          Load
        </button>
        <button className="dropdown-trigger" onClick={onHelpClick}>
          Help
        </button>
        <button
          onClick={onThemeToggle}
          className="theme-toggle p-2 rounded-lg hover:bg-[var(--hover)]"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="relative z-50 w-64 bg-[var(--card)] text-[var(--text)] p-6 h-full pt-16 shadow-lg animate-slide-in">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

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

            {/* Mobile actions */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={onSaveClick}
                className="text-left px-3 py-2 hover:bg-[var(--hover)]"
              >
                Save
              </button>
              <button
                onClick={() => onLoadClick("file")}
                className="text-left px-3 py-2 hover:bg-[var(--hover)]"
              >
                Load
              </button>
              <button
                onClick={onHelpClick}
                className="text-left px-3 py-2 hover:bg-[var(--hover)]"
              >
                Help
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
