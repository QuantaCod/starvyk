import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="404 — Not Found" />
      <div className={styles.page}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className={styles.btn}>← Back to explore</Link>
      </div>
    </>
  )
}
