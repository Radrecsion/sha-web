import { Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function HazardChart({ curves }) {
  if (!curves) return <p>Tidak ada data curve</p>

  const datasets = curves.map(curve => ({
    label: `T = ${curve.period}s`,
    data: curve.points.map(p => ({ x: p.im, y: p.prob })),
    borderColor: "rgba(59,130,246,1)",
    backgroundColor: "rgba(59,130,246,0.2)",
    fill: false
  }))

  const data = { datasets }
  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { type: "linear", title: { display: true, text: "IML (g)" } },
      y: { type: "linear", title: { display: true, text: "Prob Exceed" } }
    }
  }

  return <Line data={data} options={options} />
}
