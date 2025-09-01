import { useState, useEffect } from "react";

export default function GmpePage() {
  const [gmpeList, setGmpeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function fetchGmpe() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${baseUrl}/gmpe`);
        if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
        const data = await res.json();
        setGmpeList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("❌ Fetch GMPE error:", err);
        setError(err.message || "Gagal fetch GMPE");
      } finally {
        setLoading(false);
      }
    }
    fetchGmpe();
  }, []);


  if (loading) return <div className="p-4">⏳ Memuat data GMPE...</div>;
  if (error) return <div className="p-4 text-red-500">❌ {error}</div>;
  if (gmpeList.length === 0)
    return <div className="p-4 opacity-70">Tidak ada GMPE tersedia</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Daftar GMPE</h2>

      {gmpeList.map((gmpe) => {
        const headers =
          gmpe.coeffs?.length > 0 ? Object.keys(gmpe.coeffs[0]) : [];
        const isOpen = openId === gmpe.id;

        return (
          <div
            key={gmpe.id || gmpe.name}
            className="card-custom rounded-2xl shadow"
          >
            {/* Header clickable */}
            <button
              onClick={() => setOpenId(isOpen ? null : gmpe.id)}
              className="w-full text-left px-6 py-4 flex justify-between items-center"
            >
              <span className="font-semibold">{gmpe.name}</span>
              <span className="text-sm opacity-70">
                {isOpen ? "▲ Tutup" : "▼ Detail"}
              </span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div
                className="p-6 space-y-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p className="text-sm opacity-80">
                  Tahun: {gmpe.year || "-"} | Region:{" "}
                  {gmpe.tectonic_region || "-"}
                </p>
                <p className="text-sm">{gmpe.description}</p>

                {headers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full border text-sm"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "var(--hover)" }}>
                          {headers.map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 border"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gmpe.coeffs.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[var(--hover)]">
                            {headers.map((key, i) => (
                              <td
                                key={i}
                                className="px-3 py-2 border"
                                style={{ borderColor: "var(--color-border)" }}
                              >
                                {typeof row[key] === "number"
                                  ? row[key].toFixed(3)
                                  : row[key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="opacity-70">
                    Koefisien GMPE tidak tersedia
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
