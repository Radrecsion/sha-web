export default function ResultTable({ curves }) {
  if (!curves) return <p>Tidak ada data tabel</p>

  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Period (s)</th>
          <th className="border p-2">IML</th>
          <th className="border p-2">Prob</th>
        </tr>
      </thead>
      <tbody>
        {curves.map(curve =>
          curve.points.map((p, idx) => (
            <tr key={`${curve.period}-${idx}`}>
              <td className="border p-2 text-center">{curve.period}</td>
              <td className="border p-2 text-center">{p.im}</td>
              <td className="border p-2 text-center">{p.prob}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
