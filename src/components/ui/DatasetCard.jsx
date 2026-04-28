import { Link } from 'react-router-dom'
import { BarChart2, LineChart, PieChart, Table, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import TagBadge from '../ui/TagBadge'
import LikeButton from '../ui/LikeButton'
import styles from './DatasetCard.module.css'

const CHART_ICONS = {
  bar: BarChart2,
  line: LineChart,
  pie: PieChart,
  table: Table,
}

const CHART_COLORS = {
  bar: '#4dabf7',
  line: '#69db7c',
  pie: '#da77f2',
  table: '#ffa94d',
}

export default function DatasetCard({ dataset, index = 0 }) {
  const Icon = CHART_ICONS[dataset.chart_type] || BarChart2
  const color = CHART_COLORS[dataset.chart_type] || '#4dabf7'

  return (
    <article
      className={`${styles.card} animate-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link to={`/dataset/${dataset.slug}`} className={styles.inner}>
        <div className={styles.iconWrap} style={{ '--card-color': color }}>
          <Icon size={20} strokeWidth={1.5} />
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{dataset.title}</h3>
          <p className={styles.desc}>{dataset.description}</p>
        </div>

        <div className={styles.tags}>
          {(dataset.tags || []).slice(0, 3).map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>
            <Calendar size={11} />
            {format(new Date(dataset.created_at), 'MMM d, yyyy')}
          </span>
          <span className={styles.chartType} style={{ color }}>
            {dataset.chart_type || 'bar'} chart
          </span>
        </div>
      </Link>

      <div className={styles.likeRow}>
        <LikeButton
          type="dataset"
          targetId={dataset.id}
          initialCount={dataset.likes_count || 0}
          size="sm"
        />
      </div>
    </article>
  )
}
