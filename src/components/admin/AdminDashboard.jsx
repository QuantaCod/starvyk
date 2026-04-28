import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Database, FileText, Heart, Plus, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ datasets: 0, articles: 0, likes: 0 })
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState({ datasets: [], articles: [] })

  useEffect(() => {
    async function load() {
      const [{ count: dsCount }, { count: artCount }, { count: likesCount }, { data: recentDs }, { data: recentArt }] =
        await Promise.all([
          supabase.from('datasets').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('likes').select('*', { count: 'exact', head: true }),
          supabase.from('datasets').select('id, title, slug, created_at, likes_count').order('created_at', { ascending: false }).limit(3),
          supabase.from('articles').select('id, title, slug, created_at, likes_count').order('created_at', { ascending: false }).limit(3),
        ])
      setStats({ datasets: dsCount || 0, articles: artCount || 0, likes: likesCount || 0 })
      setRecent({ datasets: recentDs || [], articles: recentArt || [] })
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Datasets', value: stats.datasets, icon: Database, color: '#4dabf7', to: '/admin/datasets' },
    { label: 'Articles', value: stats.articles, icon: FileText, color: '#e8ff47', to: '/admin/articles' },
    { label: 'Total Likes', value: stats.likes, icon: Heart, color: '#ff6b6b', to: null },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Overview of your DataViz Platform</p>
        </div>
        <div className={styles.quickBtns}>
          <Link to="/admin/datasets/new" className={`${styles.quickBtn} ${styles.quickBtnPrimary}`}>
            <Plus size={14} /> Dataset
          </Link>
          <Link to="/admin/articles/new" className={styles.quickBtn}>
            <Plus size={14} /> Article
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon, color, to }) => (
          <div key={label} className={styles.statCard} style={{ '--stat-color': color }}>
            <div className={styles.statIcon}>
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className={styles.statValue}>{loading ? '—' : value.toLocaleString()}</div>
            <div className={styles.statLabel}>{label}</div>
            {to && (
              <Link to={to} className={styles.statLink}>
                Manage <ArrowRight size={11} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className={styles.recentGrid}>
        <RecentList
          title="Recent Datasets"
          items={recent.datasets}
          type="datasets"
          loading={loading}
        />
        <RecentList
          title="Recent Articles"
          items={recent.articles}
          type="articles"
          loading={loading}
        />
      </div>
    </div>
  )
}

function RecentList({ title, items, type, loading }) {
  return (
    <div className={styles.recentCard}>
      <div className={styles.recentHeader}>
        <h3 className={styles.recentTitle}>{title}</h3>
        <Link to={`/admin/${type}`} className={styles.recentAll}>
          View all <ArrowRight size={11} />
        </Link>
      </div>
      <div className={styles.recentList}>
        {loading ? (
          [1,2,3].map(i => <div key={i} className={`skeleton ${styles.recentSkeleton}`} />)
        ) : items.length === 0 ? (
          <p className={styles.recentEmpty}>No {type} yet</p>
        ) : (
          items.map(item => (
            <Link
              key={item.id}
              to={`/admin/${type}/edit/${item.id}`}
              className={styles.recentItem}
            >
              <span className={styles.recentName}>{item.title}</span>
              <span className={styles.recentLikes}>
                <Heart size={10} /> {item.likes_count || 0}
              </span>
            </Link>
          ))
        )}
      </div>
      <Link to={`/admin/${type}/new`} className={styles.recentAddBtn}>
        <Plus size={13} /> Add new
      </Link>
    </div>
  )
}
