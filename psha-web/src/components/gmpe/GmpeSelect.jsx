import { useState, useEffect } from "react";

export default function GmpeSelect({ value, onChange }) {
  const [gmpeList, setGmpeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGmpe() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/gmpe`);
        if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
        const data = await res.json();
        setGmpeList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err.message || "Gagal fetch GMPE");
      } finally {
        setLoading(false);
      }
    }
    fetchGmpe();
  }, []);

  if (loading) return <option disabled>⏳ Loading...</option>;
  if (error) return <option disabled>❌ {error}</option>;

  return (
    <>
      <option value="">-- pilih GMPE --</option>
      {gmpeList.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name} ({g.year || "-"}, {g.tectonic_region || g.region || "-"})
        </option>
      ))}
    </>
  );
}
