import { useState, useEffect } from "react";
import AnalysisTabs from "./pages/analysis/AnalysisTabs";
import ResultPage from "./pages/ResultPage";
import Toast from "./components/ui/Toast";
import DataSourceForm from "./pages/DataSourceForm";
import GmpePage from "./pages/GmpePage";

import Sidebar from "./components/ui/Sidebar";
import Topbar from "./components/ui/Topbar";

import SaveProjectModal from "./modals/SaveProjectModal";
import HelpModal from "./modals/HelpModal";
import LoginModal from "./modals/LoginModal";

import { saveProject } from "./services/projectService";
import axios from "axios";

export const API_URL =
  window.RUNTIME_CONFIG?.API_URL || "https://sha-api-production.up.railway.app/api/v1";

export default function App() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [siteData, setSiteData] = useState({});
  const [datasources, setDatasources] = useState([]);
  const [gmpeList, setGmpeList] = useState([]);

  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedGmpes, setSelectedGmpes] = useState([]);

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);

  /** ================== CHECK LOGIN ================== */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.get(`${API_URL}/auth/me`, { withCredentials: true })
        .then(res => {
          if (res.data.email) {
            setUser({
              username: res.data.email,
              avatar: res.data.avatar || "",
              token,
            });
          }
        })
        .catch(() => console.log("User not logged in yet"));
    }
  }, []);

  /** ================== HANDLE LOGIN CALLBACK ================== */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "success") {
      axios.get(`${API_URL}/auth/me`, { withCredentials: true })
        .then(res => {
          if (res.data.email) {
            const userData = {
              username: res.data.email,
              avatar: res.data.avatar || "",
              token: localStorage.getItem("access_token") || "",
            };
            setUser(userData);
            localStorage.setItem("username", userData.username);
            localStorage.setItem("avatar", userData.avatar || "");
            setToast({ type: "success", message: "Login successful!" });
            setTimeout(() => setToast(null), 3000);

            // Hapus query string
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        })
        .catch(console.error);
    }
  }, []);

  /** ================== FETCH DATA ================== */
  useEffect(() => {
    const fetchDatasources = async () => {
      try {
        const res = await fetch(`${API_URL}/datasource/`);
        if (!res.ok) throw new Error(`Fetch datasource status: ${res.status}`);
        const data = await res.json();
        setDatasources(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Gagal fetch datasources:", err);
        setDatasources([]);
      }
    };

    const fetchGmpes = async () => {
      try {
        const res = await fetch(`${API_URL}/gmpe/`);
        if (!res.ok) throw new Error(`Fetch gmpe status: ${res.status}`);
        const data = await res.json();
        setGmpeList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Gagal fetch gmpe:", err);
        setGmpeList([]);
      }
    };

    fetchDatasources();
    fetchGmpes();
  }, []);

  /** ================== HANDLERS ================== */
  const handleRun = ({ result, siteData, selectedSources, selectedGmpes, error }) => {
    if (error) {
      setError(error);
      setToast({ type: "error", message: error });
    } else {
      setResult(result);
      setError(null);
      setToast({ type: "success", message: "Analysis completed successfully!" });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleNewProject = () => {
    setSiteData({});
    setDatasources([]);
    setSelectedSources([]);
    setSelectedGmpes([]);
    setCurrentProject(null);
    setToast({ type: "info", message: "New project started!" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProject = (name) => {
    if (!user) {
      setToast({ type: "error", message: "Login dulu sebelum menyimpan project!" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const project = {
      name,
      site: siteData,
      datasources,
      selectedSources,
      selectedGmpes,
    };
    saveProject(project, user.token)
      .then(() => {
        setToast({ type: "success", message: `Project "${name}" saved!` });
        setTimeout(() => setToast(null), 3000);
      })
      .catch(() => {
        setToast({ type: "error", message: "Gagal menyimpan project" });
        setTimeout(() => setToast(null), 3000);
      });
  };

  const handleLoadProject = (project) => {
    setSiteData(project.site || {});
    setDatasources(project.datasources || []);
    setSelectedSources(project.selectedSources || []);
    setSelectedGmpes(project.selectedGmpes || []);
    setCurrentProject(project);

    setActiveTab("analysis");
    setToast({ type: "info", message: `Project "${project.name}" loaded!` });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync ke <html> saat theme berubah
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /** ================== RENDER ================== */
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
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

      <div className="flex flex-1 pt-14">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          setCurrentProject={setCurrentProject}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <Toast toast={toast} />

          {activeTab === "analysis" && (
            <>
              <AnalysisTabs
                siteData={siteData}
                setSiteData={setSiteData}
                datasources={datasources}
                gmpeList={gmpeList}
                selectedSources={selectedSources}
                setSelectedSources={setSelectedSources}
                selectedGmpes={selectedGmpes}
                setSelectedGmpes={setSelectedGmpes}
                onRunResult={handleRun}
              />
              {result && <ResultPage result={result} error={error} />}
            </>
          )}

          {activeTab === "datasource" && (
            <DataSourceForm datasources={datasources} setDatasources={setDatasources} />
          )}

          {activeTab === "gmpe" && <GmpePage gmpeList={gmpeList} />}
        </main>
      </div>

      <SaveProjectModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onSave={handleSaveProject}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {showLoginModal && (
        <LoginModal
          apiUrl={API_URL}
          onClose={() => setShowLoginModal(false)}
          onLogin={(userData) => {
            setUser(userData);
            localStorage.setItem("access_token", userData.token || "");
            localStorage.setItem("username", userData.username);
            localStorage.setItem("avatar", userData.avatar || "");
            setShowLoginModal(false);
          }}
        />
      )}
    </div>
  );
}
