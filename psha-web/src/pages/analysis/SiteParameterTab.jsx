import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";


export default function SiteParameterTab({ siteData, setSiteData, initialData = {} }) {
  const [mode, setMode] = useState("single"); // "single" | "multi"
  const [textInput, setTextInput] = useState("");
  const [previewCoords, setPreviewCoords] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // 🔹 Parser untuk single & multi
  function parseSites(text) {
    return (text || "")
      .split("\n")
      .map((line, i) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => {
        const parts = line.split(/[\s,]+/);
        if (mode === "single") {
          return {
            name: siteData.name || `Site-${i + 1}`,
            lat: parseFloat(parts[0]) || 0,
            lon: parseFloat(parts[1]) || 0,
          };
        }
        return {
          name: parts[0] || `Site-${i + 1}`,
          lat: parseFloat(parts[1]) || 0,
          lon: parseFloat(parts[2]) || 0,
        };
      });
  }

  function handleSaveLocal() {
    const parsedSites = parseSites(textInput);
    const updated = {
      ...siteData,
      sites: parsedSites,
    };

    setSiteData(updated); // kirim ke parent
    alert("Site parameters updated!");
  }

  const handlePreview = () => {
    setPreviewCoords(parseSites(textInput));
    setShowPreview(true);
  };

  // 🔹 Komponen auto-zoom
  function FitBounds({ coords }) {
    const map = useMap();
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lon]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
    return null;
  }

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setSiteData(initialData);
    }
  }, [initialData]);

  return (
    <div className="p-4 space-y-4">
      {/* Toggle Mode */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />
          <span>Single Site</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={mode === "multi"}
            onChange={() => setMode("multi")}
          />
          <span>Multi Site</span>
        </label>
      </div>

      {/* Single Site */}
      {mode === "single" && (
        <>
          <div>
            <label className="block font-semibold">Site Name</label>
            <input
              type="text"
              className="input"
              value={siteData.name || ""}
              onChange={(e) =>
                setSiteData({ ...siteData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Coordinate (Latitude, Longitude)
            </label>
            <textarea
              rows={2}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`-6.9 107.6`}
              className="w-full border px-3 py-2 rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: <code>Lat Lon</code>
            </p>
          </div>
        </>
      )}

      {/* Multi Site */}
      {mode === "multi" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Input Sites (Name, Latitude, Longitude)
          </label>
          <textarea
            rows={6}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`SiteA -6.9 107.6\nSiteB -7.0 108.1`}
            className="w-full border px-3 py-2 rounded-lg font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: <code>Name Lat Lon</code>, pisahkan dengan spasi/koma/tab.
          </p>
        </div>
      )}

      {/* Shared Fields */}
      <div>
        <label className="block font-semibold">Rock/Soil Site</label>
        <select
          className="input"
          value={siteData.siteType || ""}
          onChange={(e) => {
            const updated = { ...siteData, siteType: e.target.value };
            setSiteData(updated); // 🔹 langsung kirim ke parent
          }}
        >
          <option value="">Select</option>
          <option value="rock">Rock Site</option>
          <option value="soil">Soil Site</option>
        </select>
      </div>


      <div>
        <label className="block font-semibold">Wall</label>
        <select
          className="input"
          value={siteData.wall || ""}
          onChange={(e) => setSiteData({ ...siteData, wall: e.target.value })}
        >
          <option value="">Select</option>
          <option value="hanging">Site on Hanging Wall</option>
          <option value="foot">Site on Foot Wall</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold">Vs30 (m/s)</label>
        <input
          type="number"
          className="input"
          value={siteData.vs30 || ""}
          onChange={(e) => setSiteData({ ...siteData, vs30: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-semibold">
          Depth of Basement Rock (D, km)
        </label>
        <input
          type="number"
          className="input"
          value={siteData.depth || ""}
          onChange={(e) =>
            setSiteData({ ...siteData, depth: e.target.value })
          }
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Preview on Map
        </button>
        <button
          onClick={handleSaveLocal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update
        </button>
      </div>

      {/* Map Preview */}
      {showPreview && previewCoords.length > 0 && (
        <div className="mt-4 h-64 border rounded-lg overflow-hidden">
          <MapContainer
            center={[-6.9, 107.6]}
            zoom={6}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds coords={previewCoords} />

            {previewCoords.map((s, i) => (
              <Marker key={i} position={[s.lat, s.lon]}>
                <Popup>
                  <strong>{s.name}</strong>
                  <br />
                  Lat: {s.lat}, Lon: {s.lon}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
