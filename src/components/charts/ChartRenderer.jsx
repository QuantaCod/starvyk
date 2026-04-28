import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import styles from './ChartRenderer.module.css'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

const PALETTE = [
  '#4dabf7', '#69db7c', '#da77f2', '#ffa94d',
  '#e8ff47', '#ff6b6b', '#74c0fc', '#a9e34b',
]

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#888',
        font: { family: 'DM Mono, monospace', size: 11 },
        padding: 16,
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      borderColor: '#252525',
      borderWidth: 1,
      titleColor: '#f0f0f0',
      bodyColor: '#888',
      titleFont: { family: 'Syne, sans-serif', size: 13, weight: '600' },
      bodyFont: { family: 'DM Mono, monospace', size: 11 },
      padding: 12,
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { color: '#1e1e1e', drawBorder: false },
      ticks: { color: '#4a4a4a', font: { family: 'DM Mono, monospace', size: 10 } },
    },
    y: {
      grid: { color: '#1e1e1e', drawBorder: false },
      ticks: { color: '#4a4a4a', font: { family: 'DM Mono, monospace', size: 10 } },
    },
  },
}

export default function ChartRenderer({ data, chartType = 'bar' }) {
  if (!data || !data.labels || !data.datasets) {
    return <p className={styles.empty}>No chart data available.</p>
  }

  const colorizedDatasets = data.datasets.map((ds, i) => ({
    ...ds,
    backgroundColor: Array.isArray(ds.backgroundColor)
      ? ds.backgroundColor
      : chartType === 'pie'
        ? PALETTE
        : `${PALETTE[i % PALETTE.length]}33`,
    borderColor: Array.isArray(ds.borderColor)
      ? ds.borderColor
      : PALETTE[i % PALETTE.length],
    borderWidth: 2,
    borderRadius: chartType === 'bar' ? 4 : 0,
    tension: 0.4,
    fill: chartType === 'line',
    pointBackgroundColor: PALETTE[i % PALETTE.length],
    pointRadius: chartType === 'line' ? 4 : 0,
    pointHoverRadius: 6,
  }))

  const chartData = { ...data, datasets: colorizedDatasets }

  if (chartType === 'table') {
    return <TableView data={data} />
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        ...baseOptions.plugins.legend,
        position: 'right',
      },
    },
  }

  return (
    <div className={styles.wrapper}>
      {chartType === 'bar' && <Bar data={chartData} options={baseOptions} />}
      {chartType === 'line' && <Line data={chartData} options={baseOptions} />}
      {chartType === 'pie' && <Pie data={chartData} options={pieOptions} />}
    </div>
  )
}

function TableView({ data }) {
  if (!data.labels || !data.datasets?.length) return null
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Label</th>
            {data.datasets.map(ds => <th key={ds.label}>{ds.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, i) => (
            <tr key={label}>
              <td className={styles.labelCell}>{label}</td>
              {data.datasets.map(ds => (
                <td key={ds.label}>{ds.data[i] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
