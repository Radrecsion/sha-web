import { useState, useEffect } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import LoginModal from "../../modals/LoginModal";
import ProfileModal from "../../modals/ProfileModal";

export default function Topbar({
  activeTab,
  setActiveTab,
  onSave,
  onLoad,
  onHelp,
  onMenuToggle,
  apiUrl,
  user: userProp,         // menerima user dari App
  onUserUpdate,           // callback untuk update user state di App
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menu = [
    { key: "analysis", label: "PSHA" },
    { key: "datasource", label: "Datasource" },
    { key: "gmpe", label: "Attenuation" },
  ];

  // Ambil theme dari localStorage & set state
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-theme", savedTheme || "light");
  }, []);

  // Ambil user dari props atau localStorage
  useEffect(() => {
    if (userProp) {
      setUser(userProp);
    } else {
      const token = localStorage.getItem("access_token");
      const username = localStorage.getItem("username");
      const avatar = localStorage.getItem("avatar");
      if (token && username) setUser({ username, token, avatar });
    }
  }, [userProp]);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("access_token");
    setUser(null);
    setIsDropdownOpen(false);
    if (onUserUpdate) onUserUpdate(null);
  };

  const renderButton = (label, onClick, colorClass) => (
    <button
      onClick={onClick}
      className={`relative transition-colors ${colorClass}`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--card)] text-[var(--text)] shadow">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]"
          >
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold">SHA-Web</span>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            {!user && renderButton("Login", () => setShowLoginModal(true), "hover:text-blue-400")}

            {user && (
              <div className="relative">
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                  <span>{user.username}</span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[var(--card)] shadow-lg rounded border border-gray-600 z-50">
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-600"
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsDropdownOpen(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-3 py-2 hover:bg-gray-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {user && renderButton("Save", onSave, "hover:text-blue-400")}
            {user && renderButton(() => onLoad("file"), "Load", "hover:text-green-400")}
            {renderButton("Help", onHelp, "hover:text-gray-400")}
          </nav>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--hover)] transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          <aside className="relative z-50 w-64 bg-[var(--card)] text-[var(--text)] p-6 h-full pt-16 shadow-lg">
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
                    activeTab === item.key ? "bg-blue-600 text-white" : "hover:bg-[var(--hover)]"
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
          </aside>
        </div>
      )}

      {showLoginModal && (
        <LoginModal
          apiUrl={apiUrl}
          onClose={() => setShowLoginModal(false)}
          onLogin={(userData) => {
            setUser(userData);
            localStorage.setItem("access_token", userData.token || "");
            localStorage.setItem("username", userData.username);
            localStorage.setItem("avatar", userData.avatar || "");
            if (onUserUpdate) onUserUpdate(userData);
            setShowLoginModal(false);
          }}
        />
      )}

      {showProfileModal && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            if (onUserUpdate) onUserUpdate(updatedUser);
          }}
        />
      )}
    </header>
  );
}
