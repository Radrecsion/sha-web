import "leaflet/dist/leaflet.css";
import { useState } from "react";
import DataSourceModal from "../modals/DataSourceModal";
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup } from "react-leaflet";


export default function DataSourceForm({ datasources, setDatasources }) {
  const [showModal, setShowModal] = useState(false);
  const [editingDs, setEditingDs] = useState(null);
  const [previewDs, setPreviewDs] = useState(null);

  // Callback setelah modal create
  const handleSaved = (newData) => {
    setDatasources((prev) => [...prev, newData]);
    setShowModal(false);
    setEditingDs(null);
  };

  // Callback setelah modal edit
  const handleUpdated = (updatedData) => {
    setDatasources((prev) =>
      prev.map((ds) => (ds.id === updatedData.id ? updatedData : ds))
    );
    setShowModal(false);
    setEditingDs(null);
  };

  // Hapus datasource
  const handleDelete = (id) => {
    if (!confirm("Apakah yakin ingin menghapus datasource ini?")) return;
    setDatasources((prev) => prev.filter((ds) => ds.id !== id));
  };

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">List Sumber Gempa</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => {
            setEditingDs(null);
            setShowModal(true);
          }}
        >
          + Tambah Sumber Gempa
        </button>
      </div>

      {/* Card Grid */}
      {/* Card Grid */}
      {datasources.length === 0 ? (
        <p className="text-[var(--text)] opacity-60">Belum ada sumber gempa.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasources.map((ds) => (
            <div
              key={ds.id}
              className="border rounded-xl p-4 shadow-sm bg-[var(--card)] text-[var(--text)] hover:shadow-md transition-colors duration-300"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3 className="font-semibold text-lg mb-1">{ds.name}</h3>
              <p className="text-xs opacity-60 mb-2">ID: {ds.id}</p>

              {/* Mechanism Badge */}
              <span className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 rounded-full mb-2">
                {ds.mechanism || "Unknown"}
              </span>

              {/* Magnitude badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Min Mag: {ds.min_mag ?? "-"}
                </span>
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-full">
                  Max Mag: {ds.max_mag ?? "-"}
                </span>
              </div>

              {/* GMPE list */}
              <div className="text-sm mb-3">
                <p className="font-medium">GMPEs:</p>
                {ds.gmpe_weights?.length > 0 ? (
                  <ul className="list-disc list-inside text-xs opacity-80">
                    {ds.gmpe_weights.map((w, i) => (
                      <li key={i}>
                        {w.gmpe_name || w.gmpe_id} ({w.weight})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs opacity-60">Belum ada GMPE</p>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => setPreviewDs(ds)}
                >
                  Lihat Peta
                </button>
                <button
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => {
                    setEditingDs(ds);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(ds.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal Tambah/Edit */}
      {showModal && (
        <DataSourceModal
          onClose={() => {
            setShowModal(false);
            setEditingDs(null);
          }}
          onSaved={editingDs ? handleUpdated : handleSaved}
          initialData={editingDs} // untuk edit
        />
      )}

      {/* Modal Preview Map */}
      {previewDs && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-[700px] h-[500px] relative">
            <h3 className="text-lg font-semibold mb-2">
              Preview Peta - {previewDs.name}
            </h3>
            <MapContainer
              center={[
                previewDs.coords_up?.[0]?.lat || -6.9,
                previewDs.coords_up?.[0]?.lon || 107.6,
              ]}
              zoom={8}
              className="h-[400px] w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Polygon Fault Plane */}
              {previewDs.coords_up?.length > 0 && previewDs.coords_down?.length > 0 && (
                <Polygon
                  positions={[
                    ...previewDs.coords_up.map((c) => [c.lat, c.lon]),
                    ...previewDs.coords_down.slice().reverse().map((c) => [
                      c.lat,
                      c.lon,
                    ]),
                  ]}
                  color="purple"
                  fillColor="purple"
                  fillOpacity={0.2}
                />
              )}

              {/* Garis Up */}
              {previewDs.coords_up?.length > 0 && (
                <Polyline
                  positions={previewDs.coords_up.map((c) => [c.lat, c.lon])}
                  color="blue"
                />
              )}

              {/* Garis Down */}
              {previewDs.coords_down?.length > 0 && (
                <Polyline
                  positions={previewDs.coords_down.map((c) => [c.lat, c.lon])}
                  color="red"
                />
              )}

              {/* Marker */}
              {previewDs.coords_up?.map((c, i) => (
                <Marker key={`up-${i}`} position={[c.lat, c.lon]}>
                  <Popup>Up {i + 1}: Depth {c.depth} km</Popup>
                </Marker>
              ))}
              {previewDs.coords_down?.map((c, i) => (
                <Marker key={`down-${i}`} position={[c.lat, c.lon]}>
                  <Popup>Down {i + 1}: Depth {c.depth} km</Popup>
                </Marker>
              ))}
            </MapContainer>

            <button
              className="absolute top-2 right-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setPreviewDs(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
