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

export default function App() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [siteData, setSiteData] = useState({});
  const [datasources, setDatasources] = useState([]);
  const [gmpeList, setGmpeList] = useState([]);

  // untuk simpan hasil pilihan di SeismicModelTab
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedGmpes, setSelectedGmpes] = useState([]);

  // modal states
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);


  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
    const project = {
      name,
      site: siteData,
      datasources,
      selectedSources,
      selectedGmpes,
    };
    saveProject(project);
    setToast({ type: "success", message: `Project "${name}" saved!` });
    setTimeout(() => setToast(null), 3000);
  }

  function handleLoadProject(project) {
    setSiteData(project.site || {});
    setDatasources(project.datasources || []);
    setSelectedSources(project.selectedSources || []);
    setSelectedGmpes(project.selectedGmpes || []);
    setToast({ type: "info", message: `Project "${project.name}" loaded!` });
    setTimeout(() => setToast(null), 3000);
  }

  /** ================== FETCH ================== */
  async function fetchDatasources() {
    try {
      const res = await fetch(`${apiUrl}/datasource/`);
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
      const res = await fetch(`${apiUrl}/gmpe/`);
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

  /** ================== RENDER ================== */
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Topbar */}
      <Topbar
        onSave={() => setIsSaveOpen(true)}
        onLoad={() => setIsLoadOpen(true)}
        onHelp={() => alert("Help clicked!")}
        setActiveTab={setActiveTab}
      />


      <div className="flex flex-1 pt-14">
        {/* Sidebar hanya muncul di desktop */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

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
            <DataSourceForm
              datasources={datasources}
              setDatasources={setDatasources}
            />
          )}

          {activeTab === "gmpe" && <GmpePage gmpeList={gmpeList} />}
        </main>
      </div>

      {/* Modals */}
      <SaveProjectModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        onSave={handleSaveProject}
      />
      <LoadProjectModal
        isOpen={isLoadOpen}
        onClose={() => setIsLoadOpen(false)}
        onLoad={handleLoadProject}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
