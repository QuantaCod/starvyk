import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart2, Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <BarChart2 size={20} strokeWidth={2} />
          <span>StarVyk</span>
          <span className={styles.logoBadge}>See Beyond The Numbers</span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>
            Home
          </Link>
          <Link to="/datasets" className={`${styles.link} ${isActive('/datasets') ? styles.active : ''}`}>
            Datasets
          </Link>
          <Link to="/articles" className={`${styles.link} ${isActive('/articles') ? styles.active : ''}`}>
            Articles
          </Link>
        </div>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>
    </header>
  )
}
