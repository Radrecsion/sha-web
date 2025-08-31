import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import ResponsiveCard from "../../components/common/ResponsiveCard";

// 🔹 Helper validasi koordinat
const toLatLng = (coords) =>
  (coords || [])
    .map((c) => {
      if (Array.isArray(c) && c.length === 2) {
        return [c[1], c[0]]; // [lat, lon] dari [lon, lat]
      }
      if (typeof c === "object" && c.lat != null && c.lon != null) {
        return [c.lat, c.lon]; // [lat, lon] dari object
      }
      return null;
    })
    .filter(Boolean);


export default function AnalysisConclusionTab({
  siteData,
  selectedSources, // ✅ konsisten pakai ini
  datasources,
  onRunResult,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Gabungkan semua koordinat untuk bounds
  const allCoords = selectedSources.flatMap((ds) => [
    ...toLatLng(ds.coords_up),
    ...toLatLng(ds.coords_down),
  ]);

    // 🔎 Debug log
  console.log("🔎 [AnalysisConclusionTab] selectedSources:", selectedSources);
  console.log("🔎 [AnalysisConclusionTab] allCoords:", allCoords);

   async function handleRunAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        site: siteData,
        sources: selectedSources,
      };

      console.log("📤 Sending payload to API:", payload);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/run-analysis`,
        payload
      );

      const result = response.data;

      console.log("✅ Analysis result received:", result);

      if (onRunResult) {
        onRunResult({ result, siteData, selectedSources });
      }
    } catch (err) {
      console.error("❌ Error in handleRunAnalysis:", err);
      setError(err.response?.data?.error || err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* 🔹 Site Configuration */}
      <ResponsiveCard title="Site Configuration">
        {Object.keys(siteData).length === 0 ? (
          <p className="text-gray-500">No site parameters saved</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(siteData).map(([key, value]) => {
              if (key === "sites") {
                return (
                  <div key={key}>
                    <span className="font-medium">Sites:</span>
                    {value?.length > 0 ? (
                      <>
                        <ul className="list-disc pl-5 mt-1 text-sm sm:text-base overflow-x-auto">
                          {value.map((s, i) => (
                            <li key={i}>
                              {s.name ? <strong>{s.name}</strong> : `Site-${i + 1}`} → 
                              Lat: {s.lat}, Lon: {s.lon}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 h-[35vh] sm:h-[50vh] border rounded overflow-hidden">
                          {/* MapContainer di sini */}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500 ml-2">None</span>
                    )}
                  </div>
                );
              }
              return (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value) || "-"}
                </div>
              );
            })}
          </div>
        )}
      </ResponsiveCard>

      {/* 🔹 Datasource */}
      <ResponsiveCard title="Selected Datasources">
        {selectedSources.length > 0 ? (
          <>
            <ul className="list-disc pl-5 mb-4 text-sm sm:text-base overflow-x-auto">
              {selectedSources.map((ds, i) => (
                <li key={i}>{ds.name}</li>
              ))}
            </ul>
            <div className="h-[35vh] sm:h-[55vh] w-full border rounded overflow-hidden">
              {/* MapContainer di sini */}
            </div>
          </>
        ) : (
          <p className="text-gray-500">No sources selected</p>
        )}
      </ResponsiveCard>

      {/* 🔹 Action */}
      <ResponsiveCard
        footer={
          <>
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !siteData || selectedSources.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Running..." : "Run Analysis"}
            </button>
          </>
        }
      />
    </div>
  );
}
