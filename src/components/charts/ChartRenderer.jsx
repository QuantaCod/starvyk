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

// Sum all values across all datasets
function calcTotal(datasets) {
  return datasets.reduce((sum, ds) =>
    sum + ds.data.reduce((s, v) => s + (parseFloat(v) || 0), 0), 0)
}

function buildBaseOptions(datasets) {
  const total = calcTotal(datasets)
  return {
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
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed?.y ?? ctx.parsed ?? 0
            const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            const label = ctx.dataset.label || ctx.label || ''
            return `  ${label}: ${Number(value).toLocaleString()}  (${pct}%)`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1e1e1e', drawBorder: false },
        ticks: { color: '#4a4a4a', font: { family: 'DM Mono, monospace', size: 10 } },
      },
      y: {
        grid: { color: '#1e1e1e', drawBorder: false },
        ticks: {
          color: '#4a4a4a',
          font: { family: 'DM Mono, monospace', size: 10 },
          callback: (v) => Number(v).toLocaleString(),
        },
      },
    },
  }
}

function buildPieOptions(datasets) {
  const total = calcTotal(datasets)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#888',
          font: { family: 'DM Mono, monospace', size: 11 },
          padding: 14,
          boxWidth: 12,
          generateLabels: (chart) => {
            const data = chart.data
            if (!data.labels?.length) return []
            return data.labels.map((label, i) => {
              const value = data.datasets[0]?.data[i] || 0
              const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return {
                text: `${label}  —  ${pct}%`,
                fillStyle: PALETTE[i % PALETTE.length],
                strokeStyle: PALETTE[i % PALETTE.length],
                lineWidth: 0,
                index: i,
                hidden: false,
              }
            })
          },
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
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed || 0
            const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            return `  ${Number(value).toLocaleString()}  —  ${pct}%`
          },
        },
      },
    },
  }
}

export default function ChartRenderer({ data, chartType = 'bar' }) {
  if (!data || !data.labels || !data.datasets) {
    return <p className={styles.empty}>No chart data available.</p>
  }

  const colorized = data.datasets.map((ds, i) => ({
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

  const chartData = { ...data, datasets: colorized }

  if (chartType === 'table') return <TableView data={data} />

  return (
    <div className={styles.wrapper}>
      {chartType === 'bar'  && <Bar  data={chartData} options={buildBaseOptions(data.datasets)} />}
      {chartType === 'line' && <Line data={chartData} options={buildBaseOptions(data.datasets)} />}
      {chartType === 'pie'  && <Pie  data={chartData} options={buildPieOptions(data.datasets)}  />}
    </div>
  )
}

function TableView({ data }) {
  if (!data.labels || !data.datasets?.length) return null
  const total = calcTotal(data.datasets)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Label</th>
            {data.datasets.map(ds => <th key={ds.label}>{ds.label}</th>)}
            <th className={styles.pctHead}>Share %</th>
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, i) => {
            const rowSum = data.datasets.reduce((s, ds) => s + (parseFloat(ds.data[i]) || 0), 0)
            const pct    = total > 0 ? ((rowSum / total) * 100).toFixed(1) : '0.0'
            return (
              <tr key={i}>
                <td className={styles.labelCell}>{label}</td>
                {data.datasets.map(ds => (
                  <td key={ds.label}>{Number(ds.data[i] ?? 0).toLocaleString()}</td>
                ))}
                <td className={styles.pctCell}>{pct}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}