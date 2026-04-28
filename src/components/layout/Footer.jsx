import { Link } from 'react-router-dom'
import { BarChart2, Heart } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <BarChart2 size={15} />
          <span>StarVyk</span>
        </Link>

        <nav className={styles.links}>
          <Link to="/" className={styles.link}>Home</Link>
          <Link to="/datasets" className={styles.link}>Datasets</Link>
          <Link to="/articles" className={styles.link}>Articles</Link>
        </nav>
        <nav className={styles.links}>
          <Link to="https://www.facebook.com/profile.php?id=61573226736702" className={styles.link}>Facebook</Link>
          <Link to="https://www.instagram.com/starvyk_?igsh=dW9tZzJ5cmVycjI3" className={styles.link}>Instagram</Link>
        </nav>

        <p className={styles.copy}>
          Made with <Heart size={11} className={styles.heart} /> · Open data,Read Article, beautifully visualized
        </p>
      </div>
    </footer>
  )
}
