import { useEffect, useState } from "react"

export default function GmpeSelect({ gmpe, setGmpe }) {
  const [gmpeList, setGmpeList] = useState([])

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/gmpe/list`)
    .then(res => res.json())
    .then(data => setGmpeList(data))
    .catch(err => console.error("Error load gmpe:", err))
}, [])

  return (
    <div className="mb-4">
      <label className="block font-semibold">GMPE Model</label>
      <select
        value={gmpe}
        onChange={e => setGmpe(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">-- pilih GMPE --</option>
        {gmpeList.map(model => (
          <option key={model.id} value={model.id}>{model.name}</option>
        ))}
      </select>
    </div>
  )
}