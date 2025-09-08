import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

// 🔹 Fix default marker issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function SiteParameterTab({ siteData, setSiteData, initialData = {} }) {
  const [mode, setMode] = useState("single"); // "single" | "multi"
  const [textInput, setTextInput] = useState("");
  const [previewCoords, setPreviewCoords] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

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
    setSiteData({ ...siteData, sites: parsedSites });
    alert("Site parameters updated!");
  }

  const handlePreview = () => {
    setPreviewCoords(parseSites(textInput));
    setShowPreview(true);
  };

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
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="theme-adaptive"
              checked={mode === "single"}
              onChange={() => setMode("single")}
            />
            <span>Single Site</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="theme-adaptive"
              checked={mode === "multi"}
              onChange={() => setMode("multi")}
            />
            <span>Multi Site</span>
          </label>
        </div>

        {/* Coordinates with transition */}
        <AnimatePresence mode="wait">
          {mode === "single" && (
            <motion.div
              key="single"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block font-semibold">Site Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={siteData.name || ""}
                  onChange={(e) =>
                    setSiteData({ ...siteData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-semibold">Coordinate (Lat, Lon)</label>
                <input
                  type="text"
                  className="input w-full font-mono"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="-6.9 107.6"
                />
                <p className="text-xs text-gray-500 mt-1">Format: Lat Lon</p>
              </div>
            </motion.div>
          )}

          {mode === "multi" && (
            <motion.div
              key="multi"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block font-semibold mb-1">
                Input Sites (Name, Lat, Lon)
              </label>
              <textarea
                rows={4}
                className="w-full border px-2 py-1 rounded font-mono text-sm"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="SiteA -6.9 107.6\nSiteB -7.0 108.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Name Lat Lon, pisahkan dengan spasi/koma/tab
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shared Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
                <label className="block font-semibold">Rock/Soil Site</label>
                <select
                  className="input w-full"
                  value={siteData.siteType || ""}
                  onChange={(e) => setSiteData({ ...siteData, siteType: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="rock">Rock Site</option>
                  <option value="soil">Soil Site</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Wall</label>
                <select
                  className="input w-full"
                  value={siteData.wall || ""}
                  onChange={(e) => setSiteData({ ...siteData, wall: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="hanging">Hanging Wall</option>
                  <option value="foot">Foot Wall</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Vs30 (m/s)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={siteData.vs30 || ""}
                  onChange={(e) => setSiteData({ ...siteData, vs30: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold">Depth of Basement Rock (D, km)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={siteData.depth || ""}
                  onChange={(e) => setSiteData({ ...siteData, depth: e.target.value })}
                />
              </div>
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
      </div>
  );
}
