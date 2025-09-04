import { useState, useEffect } from "react";
import AnalysisTabs from "./pages/analysis/AnalysisTabs";
import ResultPage from "./pages/ResultPage";
import Toast from "./components/ui/Toast";
import DataSourceForm from "./pages/DataSourceForm";
import GmpePage from "./pages/GmpePage";

import Sidebar from "./components/ui/Sidebar";
import Topbar from "./components/ui/Topbar";

import SaveProjectModal from "./modals/SaveProjectModal";
import LoadProjectModal from "./modals/LoadProjectModal";
import HelpModal from "./modals/HelpModal";

import { saveProject } from "./services/projectService";
import axios from "axios";

// Ambil API_URL dari runtime config
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
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [currentProject, setCurrentProject] = useState(null);
  const [user, setUser] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /** ================== LOGIN / USER ================== */
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
      if (res.data.email) {
        setUser({ username: res.data.email, avatar: "" });
      }
    } catch (err) {
      console.log("User not logged in yet");
    }
  };
  fetchUser();
}, []);

  

  /** ================== FETCH DATA ================== */
  async function fetchDatasources() {
    try {
      const res = await fetch(`${API_URL}/datasource/`);
      if (!res.ok) throw new Error(`Fetch datasource status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setDatasources(data);
      else if (Array.isArray(data.data)) setDatasources(data.data);
      else setDatasources([]);
    } catch (err) {
      console.error("Gagal fetch datasources:", err);
      setDatasources([]);
    }
  }

  async function fetchGmpes() {
    try {
      const res = await fetch(`${API_URL}/gmpe/`);
      if (!res.ok) throw new Error(`Fetch gmpe status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setGmpeList(data);
      else if (Array.isArray(data.data)) setGmpeList(data.data);
      else setGmpeList([]);
    } catch (err) {
      console.error("Gagal fetch gmpe:", err);
      setGmpeList([]);
    }
  }

  useEffect(() => {
    fetchDatasources();
    fetchGmpes();
  }, []);

  /** ================== HANDLERS ================== */
  function handleRun({ result, siteData, selectedSources, selectedGmpes, error }) {
    if (error) {
      setError(error);
      setToast({ type: "error", message: error });
    } else {
      setResult(result);
      setError(null);
      setToast({ type: "success", message: "Analysis completed successfully!" });
    }
    setTimeout(() => setToast(null), 4000);
  }

  function handleSaveProject(name) {
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
      .catch((err) => {
        console.error(err);
        setToast({ type: "error", message: "Gagal menyimpan project" });
        setTimeout(() => setToast(null), 3000);
      });
  }

  function handleLoadProject(project) {
    setSiteData(project.site || {});
    setDatasources(project.datasources || []);
    setSelectedSources(project.selectedSources || []);
    setSelectedGmpes(project.selectedGmpes || []);
    setCurrentProject(project);

    setActiveTab("analysis");
    setToast({ type: "info", message: `Project "${project.name}" loaded!` });
    setTimeout(() => setToast(null), 3000);
  }

  /** ================== EFFECT LOAD PROJECT ================== */
  useEffect(() => {
    if (currentProject) {
      handleLoadProject(currentProject);
    }
  }, [currentProject]);

  /** ================== RENDER ================== */
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Topbar */}
    <Topbar
      onSave={() => setIsSaveOpen(true)}
      onLoad={() => setIsLoadOpen(true)}
      onHelp={() => setIsHelpOpen(true)}
      setActiveTab={setActiveTab}
      user={user}
      apiUrl={API_URL}
      onUserUpdate={setUser}
    />

      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          setCurrentProject={setCurrentProject}
        />

        {/* Main Content */}
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

      {/* Modals */}
      <SaveProjectModal isOpen={isSaveOpen} onClose={() => setIsSaveOpen(false)} onSave={handleSaveProject} />
      <LoadProjectModal isOpen={isLoadOpen} onClose={() => setIsLoadOpen(false)} onLoad={handleLoadProject} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
