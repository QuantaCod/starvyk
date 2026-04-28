import styles from './Skeleton.module.css'

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`skeleton ${styles.icon}`} />
      <div className={styles.body}>
        <div className={`skeleton ${styles.title}`} />
        <div className={`skeleton ${styles.desc}`} />
        <div className={`skeleton ${styles.desc2}`} />
      </div>
      <div className={styles.footer}>
        <div className={`skeleton ${styles.tag}`} />
        <div className={`skeleton ${styles.tag}`} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
