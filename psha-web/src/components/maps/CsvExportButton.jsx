// components/CsvExportButton.jsx
import { saveAs } from "file-saver"

export default function CsvExportButton({ sites }) {
  function handleExport() {
    if (!sites || sites.length === 0) return

    // buat header + isi
    const header = "site_id,latitude,longitude\n"
    const rows = sites.map((s, i) => `${i + 1},${s.lat},${s.lng}`).join("\n")
    const csv = header + rows

    // simpan file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "sites_export.csv")
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Export CSV
    </button>
  )
}
