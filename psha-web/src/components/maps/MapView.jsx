import { useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import Papa from "papaparse"

export default function MapView() {
  const [markers, setMarkers] = useState([{ lat: -6.2, lng: 106.8 }]) // default Jakarta

  // Tambah marker dengan klik peta
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMarkers((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
      },
    })
    return null
  }

  // Export ke CSV
  function handleExportCSV() {
    const csv = Papa.unparse(markers)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sites.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Import CSV
  function handleImportCSV(event) {
    const file = event.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const points = results.data
          .filter((row) => row.Latitude && row.Longitude)
          .map((row) => ({ lat: row.Latitude, lng: row.Longitude }))
        if (points.length > 0) {
          setMarkers(points)
        }
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Peta */}
      <MapContainer
        center={[-2, 118]} // tengah Indonesia
        zoom={5}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((pos, idx) => (
          <Marker key={idx} position={[pos.lat, pos.lng]} />
        ))}
        <LocationMarker />
      </MapContainer>

      {/* Tombol Import / Export */}
      <div className="flex gap-4">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          Export CSV
        </button>

        <label className="px-4 py-2 bg-green-600 text-white rounded-lg shadow cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" onChange={handleImportCSV} hidden />
        </label>
      </div>
    </div>
  )
}
