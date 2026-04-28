import { Link } from 'react-router-dom'
import { BarChart2, FileText, Eye, Heart, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import TagBadge from './TagBadge'
import styles from './RelatedContent.module.css'

export default function RelatedContent({ items = [], type = 'dataset', title = 'More to Explore' }) {
  if (!items.length) return null
  const isDataset = type === 'dataset'

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <Link to={isDataset ? '/datasets' : '/articles'} className={styles.viewAll}>
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className={styles.grid}>
        {items.map(item => (
          <Link
            key={item.id}
            to={isDataset ? `/dataset/${item.slug}` : `/article/${item.slug}`}
            className={styles.card}
          >
            <div className={styles.cardIcon} style={{ '--ic': isDataset ? '#4dabf7' : '#e8ff47' }}>
              {isDataset
                ? <BarChart2 size={15} strokeWidth={1.5} />
                : <FileText size={15} strokeWidth={1.5} />}
            </div>
            <div className={styles.cardBody}>
              <h4 className={styles.cardTitle}>{item.title}</h4>
              {item.description && <p className={styles.cardDesc}>{item.description}</p>}
              <div className={styles.cardTags}>
                {(item.tags || []).slice(0, 2).map(tag => (
                  <TagBadge key={tag} tag={tag} onClick={e => e.preventDefault()} />
                ))}
              </div>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.stat}><Eye size={10} /> {item.views_count || 0}</span>
              <span className={styles.stat}><Heart size={10} /> {item.likes_count || 0}</span>
              <span className={styles.date}>{format(new Date(item.created_at), 'MMM d')}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}