import { useState, useEffect } from "react";
import axios from "axios";

export default function Sidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  setCurrentProject,
  apiUrl = "https://sha-api-production.up.railway.app/api/v1", // fallback
}) {
  const [animate, setAnimate] = useState("");
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, project: null });

  const menu = [
    { key: "analysis", label: "PSHA" },
    { key: "datasource", label: "Datasource" },
    { key: "gmpe", label: "Attenuation" },
  ];

  /** ================== ANIMASI SIDEBAR ================== */
  useEffect(() => {
    if (isOpen) {
      setAnimate("animate-slide-in");
    } else if (animate === "animate-slide-in") {
      setAnimate("animate-slide-out");
      const timer = setTimeout(() => setAnimate(""), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /** ================== LOAD USER ================== */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    if (token && username) setUser({ username, token });
  }, []);

  /** ================== FETCH PROJECTS ================== */
  useEffect(() => {
    if (!user?.token) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${apiUrl}/projects`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Gagal fetch project:", err);
        setProjects([]);
      }
    };

    fetchProjects();
  }, [user, apiUrl]);

  /** ================== HANDLER ================== */
  const handleLoadProject = (proj) => {
    setActiveTab("analysis"); // langsung ke tab analysis
    setCurrentProject(proj); // simpan project global
    setIsOpen(false); // tutup drawer mobile
  };

  const handleDeleteProject = async (proj) => {
    if (!user?.token) return;
    if (!confirm(`Delete project "${proj.name}"?`)) return;

    try {
      await axios.delete(`${apiUrl}/projects/${proj.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProjects(projects.filter((p) => p.id !== proj.id));

      // kalau project aktif yang dihapus → reset
      setCurrentProject((prev) => (prev?.id === proj.id ? null : prev));
    } catch (err) {
      console.error("Gagal hapus project:", err);
      alert("Gagal hapus project");
    }
  };

  const openContextMenu = (e, proj) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, project: proj });
  };

  const closeContextMenu = () =>
    setContextMenu({ visible: false, x: 0, y: 0, project: null });

  const renderProjectList = () =>
    projects.length > 0 ? (
      projects.map((proj) => (
        <button
          key={proj.id}
          onClick={() => handleLoadProject(proj)}
          onContextMenu={(e) => openContextMenu(e, proj)}
          className="text-left px-2 py-1 rounded hover:bg-[var(--hover)] w-full"
        >
          {proj.name}
        </button>
      ))
    ) : (
      <p className="text-sm text-gray-400">No projects found</p>
    );

  /** ================== RENDER ================== */
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-14 left-0 bg-[var(--card)] text-[var(--text)] shadow pt-2">
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

        {user && (
          <>
            <hr className="my-2 border-gray-500" />
            <div className="p-2">
              <p className="font-semibold mb-1">Projects ({user.username}):</p>
              {renderProjectList()}
            </div>
          </>
        )}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {(isOpen || animate === "animate-slide-out") && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={closeContextMenu}>
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>

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

            {user && (
              <>
                <hr className="my-2 border-gray-500" />
                <div className="p-2">
                  <p className="font-semibold mb-1">Projects ({user.username}):</p>
                  {renderProjectList()}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* Context menu */}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-[var(--card)] border rounded shadow p-2 z-50"
          onMouseLeave={closeContextMenu}
        >
          <button
            className="px-2 py-1 hover:bg-red-500 hover:text-white rounded w-full text-left"
            onClick={() => {
              handleDeleteProject(contextMenu.project);
              closeContextMenu();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
