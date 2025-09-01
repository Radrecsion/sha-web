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

  /** ================== FETCH GMPE ================== */
  useEffect(() => {
    async function fetchGmpe() {
      try {
        // PAKSA HTTPS untuk testing cepat
        const apiUrl = "https://sha-api-production.up.railway.app/api/v1/gmpe/";
        console.log("👉 Fetching GMPE from:", apiUrl);

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
        const data = await res.json();

        // Ambil data array langsung
        if (Array.isArray(data)) {
          setGmpeList(data);
        } else if (Array.isArray(data.data)) {
          setGmpeList(data.data);
        } else {
          setGmpeList([]);
          setError("Format data GMPE tidak sesuai");
        }
      } catch (err) {
        console.error("❌ GMPE fetch error:", err);
        setError(err.message || "Gagal fetch GMPE");
      } finally {
        setLoading(false);
      }
    }

    fetchGmpe();
  }, []);

  /** ================== RENDER ================== */
  if (loading) return <div className="p-4">⏳ Memuat GMPE...</div>;
  if (error) return <div className="p-4 text-red-500">❌ {error}</div>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ================== LEFT: DATASOURCES ================== */}
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="font-semibold mb-2">Available Datasources</h2>
        <div className="flex-1 max-h-80 overflow-y-auto pr-2 space-y-1">
          {datasources.length === 0 ? (
            <p className="text-gray-500">No datasource available</p>
          ) : (
            datasources.map((ds) => (
              <div key={ds.id} className="cursor-pointer px-3 py-2 rounded border hover:bg-gray-100 border-gray-300">
                {ds.name || "Unnamed Source"}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================== RIGHT: GMPE ================== */}
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="font-semibold mb-2">Available GMPEs</h2>
        <div className="flex-1 max-h-80 overflow-y-auto pr-2 space-y-1">
          {gmpeList.length === 0 ? (
            <p className="text-gray-500">Tidak ada GMPE tersedia</p>
          ) : (
            gmpeList.map((gmpe) => (
              <div
                key={gmpe.id}
                className="cursor-pointer px-3 py-2 rounded border hover:bg-gray-100 border-gray-300"
              >
                {gmpe.name} ({gmpe.year || "-"}, {gmpe.region || "-"})
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
