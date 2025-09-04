import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, setIsOpen, activeTab, setActiveTab }) {
  const [animate, setAnimate] = useState("");

  const menu = [
    { key: "analysis", label: "PSHA" },
    { key: "datasource", label: "Datasource" },
    { key: "gmpe", label: "Attenuation" },
  ];

  // handle animasi keluar sebelum unmount
  useEffect(() => {
    if (isOpen) {
      setAnimate("animate-slide-in");
    } else if (animate === "animate-slide-in") {
      setAnimate("animate-slide-out");
      const timer = setTimeout(() => setAnimate(""), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-14 left-0 bg-[var(--card)] text-[var(--text)] shadow">
        <nav className="flex flex-col space-y-2 p-4">
          {menu.map((item) => (
            <button
              key={item.key}
              className={`text-left px-3 py-2 rounded-lg transition ${
                activeTab === item.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-[var(--hover)]"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {(isOpen || animate === "animate-slide-out") && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Drawer */}
          <aside
            className={`relative z-50 w-64 bg-[var(--card)] text-[var(--text)] p-6 h-full pt-16 shadow-lg ${animate}`}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            <nav className="flex flex-col space-y-2 mt-8">
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
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
