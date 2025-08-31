import { useEffect, useState } from "react"

export default function SourceSelect({ selectedSources, setSelectedSources }) {
  const [sources, setSources] = useState([])

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/sources")
      .then(res => res.json())
      .then(data => setSources(data))
      .catch(err => console.error("Error load sources:", err))
  }, [])

  function handleSourceChange(e) {
    const options = Array.from(e.target.selectedOptions, o => o.value)
    setSelectedSources(options)
  }

  return (
    <div className="mb-4">
      <label className="block font-semibold">Seismic Sources</label>
      <select
        multiple
        value={selectedSources}
        onChange={handleSourceChange}
        className="border p-2 rounded w-full h-32"
      >
        {sources.map(src => (
          <option key={src.id} value={src.id}>{src.name}</option>
        ))}
      </select>
    </div>
  )
}
