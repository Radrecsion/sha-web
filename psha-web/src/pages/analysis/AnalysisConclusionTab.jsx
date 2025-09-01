import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import axios from "axios";
import ResponsiveCard from "../../components/common/ResponsiveCard";

// 🔹 Override default marker icon agar muncul
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// 🔹 Helper validasi koordinat
const toLatLng = (coords) =>
  (coords || [])
    .map((c) => {
      if (Array.isArray(c) && c.length === 2) {
        return [c[0], c[1]]; // [lat, lon] dari [lat, lon]
      }
      if (typeof c === "object" && c.lat != null && c.lon != null) {
        return [c.lat, c.lon]; // [lat, lon] dari object
      }
      return null;
    })
    .filter(Boolean);

// 🔹 Komponen auto-zoom ke bounds
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [coords, map]);
  return null;
}

export default function AnalysisConclusionTab({
  siteData,
  selectedSources,
  datasources,
  onRunResult,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gabungkan semua koordinat
  const allCoords = selectedSources.flatMap((ds) => [
    ...toLatLng(ds.coords_up),
    ...toLatLng(ds.coords_down),
  ]);

  async function handleRunAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const payload = { site: siteData, sources: selectedSources };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/run-analysis`,
        payload
      );
      if (onRunResult) onRunResult({ result: response.data, siteData, selectedSources });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* Site Configuration */}
      <ResponsiveCard title="Site Configuration">
        {Object.keys(siteData).length === 0 ? (
          <p className="text-gray-500">No site parameters saved</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(siteData).map(([key, value]) => {
              if (key === "sites") {
                const coords = toLatLng(value);
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
                          <MapContainer center={coords[0] || [0, 0]} zoom={6} className="h-full w-full">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <FitBounds coords={coords} />
                            {coords.map((c, i) => (
                              <Marker key={i} position={c}>
                                <Popup>
                                  {value[i]?.name || `Site-${i + 1}`}<br />
                                  Lat: {c[0]}, Lon: {c[1]}
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>
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

      {/* Datasources Map */}
      <ResponsiveCard title="Selected Datasources">
        {selectedSources.length > 0 ? (
          <div className="h-[35vh] sm:h-[55vh] w-full border rounded overflow-hidden">
            <MapContainer center={allCoords[0] || [0, 0]} zoom={6} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitBounds coords={allCoords} />
              {selectedSources.map((ds, i) => (
                <>
                  {toLatLng(ds.coords_up).map((c, idx) => (
                    <Marker key={`up-${i}-${idx}`} position={c}>
                      <Popup>
                        {ds.name} (Up)<br />Lat: {c[0]}, Lon: {c[1]}
                      </Popup>
                    </Marker>
                  ))}
                  {toLatLng(ds.coords_down).map((c, idx) => (
                    <Marker key={`down-${i}-${idx}`} position={c}>
                      <Popup>
                        {ds.name} (Down)<br />Lat: {c[0]}, Lon: {c[1]}
                      </Popup>
                    </Marker>
                  ))}
                </>
              ))}
            </MapContainer>
          </div>
        ) : (
          <p className="text-gray-500">No sources selected</p>
        )}
      </ResponsiveCard>

      {/* Action */}
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
