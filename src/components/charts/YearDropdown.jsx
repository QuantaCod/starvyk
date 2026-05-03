import { ChevronDown, Calendar } from 'lucide-react'
import styles from './YearDropdown.module.css'

export default function YearDropdown({ years, selectedYear, onChange }) {
  if (!years || years.length < 2) return null

  return (
    <div className={styles.wrap}>
      <Calendar size={13} className={styles.calIcon} />
      <div className={styles.selectWrap}>
        <select
          className={styles.select}
          value={selectedYear || ''}
          onChange={e => onChange(e.target.value)}
        >
          {years.map((year, i) => (
            <option key={year} value={year}>
              {year}{i === 0 ? ' · Latest' : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className={styles.chevron} />
      </div>
    </div>
  )
}