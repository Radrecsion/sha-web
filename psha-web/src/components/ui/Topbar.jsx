import { useState, useEffect } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import LoginModal from "../../modals/LoginModal";
import ProfileModal from "../../modals/ProfileModal";

export default function Topbar({
  onNewProject,
  onHelp,
  theme,
  onMenuToggle,
  apiUrl,
  user: userProp,
  onUserUpdate,
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /** ================== THEME ================== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  /** ================== SYNC USER ================== */
  useEffect(() => {
    if (userProp) setUser(userProp);
    else {
      const username = localStorage.getItem("username");
      const avatar = localStorage.getItem("avatar");
      const token = localStorage.getItem("access_token");
      if (username && token) setUser({ username, avatar, token });
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
      className={`px-3 py-1 rounded hover:opacity-80 transition ${colorClass}`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--card)] text-[var(--text)] shadow">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)]"
          >
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold">SHA-Web</span>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {renderButton("New Project", onNewProject, "bg-green-500 text-white")}

              {/* User Dropdown */}
              <div className="relative">
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span>{user?.username || ""}</span>
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
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
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
            </>
          ) : (
            renderButton(
              "Login",
              () => setShowLoginModal(true),
              "hover:text-blue-400"
            )
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--hover)] transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          apiUrl={apiUrl}
          theme={darkMode ? "dark" : "light"} // pakai state darkMode
          show={showLoginModal}
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


      {/* Profile Modal */}
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
