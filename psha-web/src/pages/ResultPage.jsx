import { useState } from "react"
import HazardChart from "../components/HazardChart"
import ResultTable from "../components/ResultTable"
import MapView from "../components/maps/MapView"

export default function ResultPage({ result, mode, error }) {
  const [view, setView] = useState("chart") // chart | table | map

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-500">Belum ada hasil analisis.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Analysis Result</h3>

      {/* View Toggle */}
      <div className="flex mb-4 rounded-xl overflow-hidden border w-full">
        <button
          onClick={() => setView("chart")}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            view === "chart"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Chart
        </button>
        <button
          onClick={() => setView("table")}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            view === "table"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Table
        </button>
        {mode === "multi" && (
          <button
            onClick={() => setView("map")}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              view === "map"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Map
          </button>
        )}
      </div>

      {/* Content Switch */}
      {view === "chart" && <HazardChart curves={result.curves} />}
      {view === "table" && <ResultTable curves={result.curves} />}
      {view === "map" && mode === "multi" && <MapView />}
    </div>
  )
}
