import { BarChart2, LineChart, PieChart, Table } from 'lucide-react'
import styles from './ChartTypeSwitcher.module.css'

const TYPES = [
  { key: 'bar', icon: BarChart2, label: 'Bar' },
  { key: 'line', icon: LineChart, label: 'Line' },
  { key: 'pie', icon: PieChart, label: 'Pie' },
  { key: 'table', icon: Table, label: 'Table' },
]

export default function ChartTypeSwitcher({ value, onChange }) {
  return (
    <div className={styles.switcher}>
      {TYPES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          className={`${styles.btn} ${value === key ? styles.active : ''}`}
          onClick={() => onChange(key)}
          title={label}
        >
          <Icon size={14} strokeWidth={1.5} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
