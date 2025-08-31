import { useState, useEffect, useRef } from "react";
import render3D from "../utils/render3D";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BaseModal from "./BaseModal";

export default function DataSourceModal({ onClose, onSaved, initialData }) {
  const [form, setForm] = useState({
    name: "",
    mechanism: "",
    minMag: "",
    maxMag: "",
    coordsUpText: "",
    coordsDownText: "",
    gr_beta: "",
    gr_rate: "",
    gr_weight: "",
    dipAngle: "", // Menambahkan input angle
    strikeAngle: "",
  });

  const [saving, setSaving] = useState(false);
  const [previewCoordsUp, setPreviewCoordsUp] = useState([]);
  const [previewCoordsDown, setPreviewCoordsDown] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [mechanisms, setMechanisms] = useState([]);
  const canvasRef = useRef(null);

  // Load daftar mechanism dari backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/mechanism/`)
      .then(res => res.json())
      .then(data => setMechanisms(data))
      .catch(err => console.error("Gagal load mechanisms:", err));
  }, []);

  // Prefill saat edit
   useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        mechanism: initialData.mechanism || "",
        minMag: initialData.min_mag ?? "",
        maxMag: initialData.max_mag ?? "",
        coordsUpText: (initialData.coords_up || [])
          .map((c) => `${c.lat} ${c.lon} ${c.depth}`)
          .join("\n"),
        coordsDownText: (initialData.coords_down || [])
          .map((c) => `${c.lat} ${c.lon} ${c.depth}`)
          .join("\n"),
        gr_beta: initialData.gr_beta ?? "",
        gr_rate: initialData.gr_rate ?? "",
        gr_weight: initialData.gr_weight ?? "",
        dipAngle: initialData.dipAngle ?? "",  // Menambahkan nilai dipAngle
        strikeAngle: initialData.strikeAngle ?? "",  // Menambahkan nilai strikeAngle
      });
    }
  }, [initialData]);

useEffect(() => {
  if (showPreview && previewCoordsUp.length && previewCoordsDown.length) {
    render3D(
      canvasRef,
      previewCoordsUp,
      previewCoordsDown,
      form.dipAngle,
      form.strikeAngle,
      form.mechanism
    );
  }
}, [showPreview, previewCoordsUp, previewCoordsDown, form.dipAngle, form.strikeAngle, form.mechanism]);




  /** ================== Koordinat Parser ================== */
  function parseCoords(text) {
    return (text || "")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(/[\s,]+/);
        return {
          lat: parseFloat(parts[0]) || 0,
          lon: parseFloat(parts[1]) || 0,
          depth: parseFloat(parts[2]) || 0,
        };
      });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePreview() {
    const up = parseCoords(form.coordsUpText);
    const down = parseCoords(form.coordsDownText);
    setPreviewCoordsUp(up);
    setPreviewCoordsDown(down);
    setShowPreview(true);
  }

  // Komponen helper untuk auto-zoom
  function FitBounds({ coords }) {
    const map = useMap();
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lon]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
    return null;
  }

  /** ================== Submit ================== */
async function handleSubmit(e) {
    e.preventDefault();

    const coords_up = parseCoords(form.coordsUpText);
    const coords_down = parseCoords(form.coordsDownText);

    const payload = {
      name: form.name,
      mechanism: form.mechanism,
      min_mag: form.minMag ? parseFloat(form.minMag) : undefined,
      max_mag: form.maxMag ? parseFloat(form.maxMag) : undefined,
      coords_up,
      coords_down,
      gr_beta: form.gr_beta ? parseFloat(form.gr_beta) : undefined,
      gr_rate: form.gr_rate ? parseFloat(form.gr_rate) : undefined,
      gr_weight: form.gr_weight ? parseFloat(form.gr_weight) : undefined,
      dipAngle: form.dipAngle ? parseFloat(form.dipAngle) : undefined,  // Menambahkan dipAngle
      strikeAngle: form.strikeAngle ? parseFloat(form.strikeAngle) : undefined,  // Menambahkan strikeAngle
    };

    try {
      setSaving(true);
      const url = initialData
        ? `${import.meta.env.VITE_API_URL}/datasource/${initialData.id}`
        : `${import.meta.env.VITE_API_URL}/datasource/`;

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Gagal simpan datasource");
      }

      const savedData = await res.json();
      onSaved(savedData);
      onClose();
    } catch (err) {
      alert(err.message);
      console.error("Payload gagal:", payload, err);
    } finally {
      setSaving(false);
    }
  }

  /** ================== RENDER ================== */
  return (
    <BaseModal
      title={initialData ? "Edit Sumber Gempa" : "Tambah Sumber Gempa"}
      onClose={onClose}
      width="w-[800px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Name */}
        <div>
          <label className="block text-sm font-medium">Source Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            required
          />
        </div>

        {/* Mechanism */}
        <div>
          <label className="block text-sm font-medium">Mechanism</label>
          <select
            name="mechanism"
            value={form.mechanism}
            onChange={handleChange}
            className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            required
          >
            <option value="">-- pilih mechanism --</option>
            {mechanisms.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min/Max Magnitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Min Magnitude</label>
            <input
              type="number"
              name="minMag"
              value={form.minMag}
              onChange={handleChange}
              className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max Magnitude</label>
            <input
              type="number"
              name="maxMag"
              value={form.maxMag}
              onChange={handleChange}
              className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            />
          </div>
        </div>

        {/* Coordinates Up */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Coordinates Up (Lat, Lon, Depth)
          </label>
          <textarea
            rows={5}
            value={form.coordsUpText || ""}
            onChange={(e) => setForm({ ...form, coordsUpText: e.target.value })}
            placeholder={`lat lon depth\n-6.87 107.61 0\n-6.90 107.65 10`}
            className="w-full border border-[var(--color-border)] px-2 py-1 rounded-lg font-mono text-sm bg-[var(--bg)] text-[var(--text)]"
          />
        </div>

        {/* Coordinates Down */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Coordinates Down (Lat, Lon, Depth)
          </label>
          <textarea
            rows={5}
            value={form.coordsDownText || ""}
            onChange={(e) => setForm({ ...form, coordsDownText: e.target.value })}
            placeholder={`lat lon depth\n-6.95 107.70 15\n-7.00 107.75 20`}
            className="w-full border border-[var(--color-border)] px-2 py-1 rounded-lg font-mono text-sm bg-[var(--bg)] text-[var(--text)]"
          />
        </div>
        {/* Dip Angle (Sudut Kemiringan) */}
        <div>
          <label className="block text-sm font-medium">Dip Angle</label>
          <input
            type="number"
            name="dipAngle"
            value={form.dipAngle}
            onChange={handleChange}
            className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            placeholder="Enter dip angle in degrees"
          />
        </div>

        {/* Strike Angle */}
        <div>
          <label className="block text-sm font-medium">Strike Angle</label>
          <input
            type="number"
            name="strikeAngle"
            value={form.strikeAngle}
            onChange={handleChange}
            className="w-full border border-[var(--color-border)] px-3 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)]"
            placeholder="Enter strike angle in degrees"
          />
        </div>
        {/* Gutenberg-Richter Parameters */}
        <div>
          <label className="block text-sm font-medium mb-2">Gutenberg-Richter</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs">Beta</label>
              <input
                type="number"
                step="0.01"
                name="gr_beta"
                value={form.gr_beta}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] px-2 py-1 rounded-lg bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
            <div>
              <label className="block text-xs">Rate</label>
              <input
                type="number"
                step="0.01"
                name="gr_rate"
                value={form.gr_rate}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] px-2 py-1 rounded-lg bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
            <div>
              <label className="block text-xs">Weight</label>
              <input
                type="number"
                step="0.01"
                name="gr_weight"
                value={form.gr_weight}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] px-2 py-1 rounded-lg bg-[var(--bg)] text-[var(--text)]"
              />
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <button
          type="button"
          onClick={handlePreview}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          Preview Coordinates
        </button>

        {/* Preview Map */}
        {showPreview && (
          <div className="mt-4 h-64 border border-[var(--color-border)] rounded-lg overflow-hidden">
            <MapContainer center={[-6.9, 107.6]} zoom={9} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitBounds coords={[...previewCoordsUp, ...previewCoordsDown]} />
              {previewCoordsUp.length > 0 && previewCoordsDown.length > 0 && (
                <Polygon
                  positions={[
                    ...previewCoordsUp.map((c) => [c.lat, c.lon]),
                    ...previewCoordsDown.slice().reverse().map((c) => [c.lat, c.lon]),
                  ]}
                  color="purple"
                  fillColor="purple"
                  fillOpacity={0.2}
                />
              )}
              {previewCoordsUp.length > 0 && (
                <>
                  <Polyline positions={previewCoordsUp.map((c) => [c.lat, c.lon])} color="blue" />
                  {previewCoordsUp.map((c, i) => (
                    <Marker key={`up-${i}`} position={[c.lat, c.lon]}>
                      <Popup>Up {i + 1}: Depth {c.depth} km</Popup>
                    </Marker>
                  ))}
                </>
              )}
              {previewCoordsDown.length > 0 && (
                <>
                  <Polyline positions={previewCoordsDown.map((c) => [c.lat, c.lon])} color="red" />
                  {previewCoordsDown.map((c, i) => (
                    <Marker key={`down-${i}`} position={[c.lat, c.lon]}>
                      <Popup>Down {i + 1}: Depth {c.depth} km</Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>
          </div>
        )}        

        {/* Preview 3D Canvas */}
        <div className="preview-container">
          <canvas ref={canvasRef} className="w-full h-96 rounded-lg shadow-lg" />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--hover)] text-[var(--text)] hover:opacity-80"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            {saving ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
