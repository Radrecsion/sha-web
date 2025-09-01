import { useState, useEffect } from "react";

export default function SeismicModelTab({
  datasources,
  selectedSources,
  setSelectedSources,
  selectedGmpes,
  setSelectedGmpes,
  siteParameter, // "rock" / "soil"
}) {
  const [gmpeList, setGmpeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "";

  /** ================== FETCH GMPE ================== */
  useEffect(() => {
    async function fetchGmpe() {
      try {
        const res = await fetch(`${API_URL}/gmpe`);
        if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
        const data = await res.json();
        setGmpeList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("❌ GMPE fetch error:", err);
        setError(err.message || "Gagal fetch GMPE");
      } finally {
        setLoading(false);
      }
    }
    fetchGmpe();
  }, [API_URL]);

  /** ================== SOURCES ================== */
  const toggleSource = (ds) =>
    setSelectedSources((prev) =>
      prev.some((s) => s.id === ds.id)
        ? prev.filter((s) => s.id !== ds.id)
        : [...prev, ds]
    );

  const toggleAllSources = () =>
    setSelectedSources((prev) =>
      prev.length === datasources.length ? [] : datasources
    );

  /** ================== GMPE SELECTION ================== */
  const toggleGmpe = (gmpe) => {
    setSelectedGmpes((prev) => {
      const exists = prev.find((g) => g.gmpeId === gmpe.id);
      if (exists) return prev.filter((g) => g.gmpeId !== gmpe.id);
      return [...prev, { gmpeId: gmpe.id, gmpeName: gmpe.name, weight: 0 }];
    });
  };

  const handleWeightChange = (gmpeId, weight) => {
    setSelectedGmpes((prev) =>
      prev.map((g) =>
        g.gmpeId === gmpeId ? { ...g, weight: parseFloat(weight) || 0 } : g
      )
    );
  };

  /** ================== RENDER ================== */
  if (loading) return <div className="p-4">⏳ Memuat GMPE...</div>;
  if (error) return <div className="p-4 text-red-500">❌ {error}</div>;

  const totalWeight = selectedGmpes.reduce((sum, g) => sum + (g.weight || 0), 0);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT: Datasources */}
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="font-semibold mb-2">Available Datasources</h2>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={selectedSources.length === datasources.length && datasources.length > 0}
            onChange={toggleAllSources}
          />
          <span className="font-medium">Select All</span>
        </div>
        <div className="flex-1 max-h-80 overflow-y-auto pr-2 space-y-1">
          {datasources.length === 0 ? (
            <p className="text-gray-500">No datasource available</p>
          ) : (
            datasources.map((ds) => {
              const isSelected = selectedSources.some((s) => s.id === ds.id);
              return (
                <div
                  key={ds.id}
                  onClick={() => toggleSource(ds)}
                  className={`cursor-pointer px-3 py-2 rounded border ${
                    isSelected ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {ds.name || "Unnamed Source"}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: GMPE */}
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="font-semibold mb-2">Available GMPEs</h2>

        <div className="flex-1 max-h-80 overflow-y-auto pr-2 space-y-1">
          {gmpeList.length === 0 ? (
            <p className="text-gray-500">Tidak ada GMPE tersedia</p>
          ) : (
            gmpeList.map((gmpe) => {
              const selected = selectedGmpes.find((g) => g.gmpeId === gmpe.id);
              return (
                <div
                  key={gmpe.id}
                  onClick={() => toggleGmpe(gmpe)}
                  className={`cursor-pointer px-3 py-2 rounded border flex items-center justify-between ${
                    selected ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span>{gmpe.name} ({gmpe.year || "-"}, {gmpe.tectonic_region || gmpe.region || "-"})</span>
                  {selected && (
                    <input
                      type="number"
                      step="0.01"
                      value={selected.weight}
                      onChange={(e) => handleWeightChange(gmpe.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 border rounded px-2 py-1 text-right"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={`mt-2 text-sm ${Math.abs(selectedGmpes.reduce((sum, g) => sum + (g.weight || 0), 0) - 1.0) > 0.001 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          Total weight = <strong>{selectedGmpes.reduce((sum, g) => sum + (g.weight || 0), 0).toFixed(2)}</strong> 
          {Math.abs(selectedGmpes.reduce((sum, g) => sum + (g.weight || 0), 0) - 1.0) > 0.001 ? " (harus = 1.0)" : " ✅ Sudah valid"}
        </div>
      </div>
    </div>
  );
}
