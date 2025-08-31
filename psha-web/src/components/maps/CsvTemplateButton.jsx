// components/CsvTemplateButton.jsx
import { saveAs } from "file-saver"

export default function CsvTemplateButton() {
  function handleDownload() {
    const template = "site_id,latitude,longitude\n1,-6.2,106.8\n"
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "template_sites.csv")
  }

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Download Template CSV
    </button>
  )
}
