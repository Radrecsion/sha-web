import { useState } from "react";
import { Tab } from "@headlessui/react";
import SiteParameterTab from "./SiteParameterTab";
import SeismicModelTab from "./SeismicModelTab";
import AnalysisConclusionTab from "./AnalysisConclusionTab";
import axios from "axios";

export default function AnalysisTabs({ datasources, onRunResult }) {
  const [activeTab, setActiveTab] = useState(0);
  const [siteData, setSiteData] = useState({});
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedGmpes, setSelectedGmpes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ["Site Parameter", "Seismic Model", "Analysis Conclusion"];

  async function handleRunAnalysis() {
    setLoading(true);
    setError(null);
    const payload = {
      site: siteData,
      sources: selectedSources,
      gmpes: selectedGmpes,
    };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/run-analysis`,
        payload
      );
      onRunResult?.({
        result: data,
        siteData,
        selectedSources,
        selectedGmpes,
        error: null,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "Terjadi kesalahan";
      console.error(errorMsg);
      setError(errorMsg);
      onRunResult?.({
        result: null,
        siteData,
        selectedSources,
        selectedGmpes,
        error: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full p-6">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <div className="tab-wrapper">
          <Tab.List className="tab-list">
            {tabs.map((tab) => (
              <Tab key={tab} className="tab-item group">
                {tab}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="p-4 sm:p-6">
            <Tab.Panel className="tab-panel">
              <SiteParameterTab siteData={siteData} setSiteData={setSiteData} />
            </Tab.Panel>

            <Tab.Panel className="tab-panel">
              <SeismicModelTab
                datasources={datasources}
                selectedSources={selectedSources}
                setSelectedSources={setSelectedSources}
                selectedGmpes={selectedGmpes}
                setSelectedGmpes={setSelectedGmpes}
                siteParameter={siteData?.siteType}
              />
            </Tab.Panel>

            <Tab.Panel className="tab-panel">
              <AnalysisConclusionTab
                siteData={siteData}
                selectedSources={selectedSources}
                selectedGmpes={selectedGmpes}
                datasources={datasources}
                onRunResult={handleRunAnalysis}
                loading={loading}
                error={error}
              />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>

  );
}
