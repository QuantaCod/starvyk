import { Heart } from 'lucide-react'
import { useLike } from '../../hooks/useLike'
import styles from './LikeButton.module.css'

export default function LikeButton({ type, targetId, initialCount = 0, size = 'md' }) {
  const { liked, count, loading, handleLike } = useLike(type, targetId, initialCount)

  return (
    <button
      className={`${styles.btn} ${liked ? styles.liked : ''} ${styles[size]} ${loading ? styles.loading : ''}`}
      onClick={handleLike}
      disabled={loading}
      aria-label={liked ? 'Unlike this' : 'Like this'}
      aria-pressed={liked}
      title={liked ? 'Click to unlike' : 'Click to like'}
    >
      <Heart
        size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15}
        fill={liked ? 'currentColor' : 'none'}
        strokeWidth={liked ? 0 : 2}
        className={`${styles.icon} ${liked ? styles.iconFilled : ''}`}
      />
      <span className={styles.count}>{count}</span>
      {liked && <span className={styles.label}>Liked</span>}
    </button>
  )
}
