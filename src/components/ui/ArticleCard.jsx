import { Link } from 'react-router-dom'
import { FileText, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import TagBadge from '../ui/TagBadge'
import LikeButton from '../ui/LikeButton'
import styles from './ArticleCard.module.css'

export default function ArticleCard({ article, index = 0 }) {
  return (
    <article
      className={`${styles.card} animate-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link to={`/article/${article.slug}`} className={styles.inner}>
        <div className={styles.iconWrap}>
          <FileText size={20} strokeWidth={1.5} />
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{article.title}</h3>
          <p className={styles.desc}>{article.description}</p>
        </div>

        <div className={styles.tags}>
          {(article.tags || []).slice(0, 3).map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>
            <Calendar size={11} />
            {format(new Date(article.created_at), 'MMM d, yyyy')}
          </span>
          {article.read_time && (
            <span className={styles.readTime}>
              <Clock size={11} />
              {article.read_time} min read
            </span>
          )}
        </div>
      </Link>

      <div className={styles.likeRow}>
        <LikeButton
          type="article"
          targetId={article.id}
          initialCount={article.likes_count || 0}
          size="sm"
        />
      </div>
    </article>
  )
}
