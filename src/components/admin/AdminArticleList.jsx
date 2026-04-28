import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Heart, ExternalLink, Clock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getArticles, deleteArticle } from '../../lib/api'
import styles from './AdminList.module.css'

export default function AdminArticleList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getArticles({ limit: 50 })
      setArticles(data)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteArticle(id)
      toast.success('Article deleted')
      setArticles(a => a.filter(x => x.id !== id))
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Articles</h1>
          <p className={styles.sub}>{articles.length} article{articles.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/admin/articles/new" className={styles.addBtn}>
          <Plus size={14} /> New Article
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeleton}`} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className={styles.empty}>
          <p>No articles yet.</p>
          <Link to="/admin/articles/new" className={styles.emptyBtn}>
            <Plus size={13} /> Write your first article
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {articles.map(art => (
            <div key={art.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{art.title}</h3>
                <p className={styles.itemDesc}>{art.description}</p>
                <div className={styles.itemMeta}>
                  {art.read_time && (
                    <span className={styles.metaBadge}>
                      <Clock size={9} /> {art.read_time}m
                    </span>
                  )}
                  {(art.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className={styles.metaTag}>{tag}</span>
                  ))}
                  <span className={styles.metaDate}>
                    {format(new Date(art.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div className={styles.itemActions}>
                <span className={styles.likes}>
                  <Heart size={11} /> {art.likes_count || 0}
                </span>
                <Link
                  to={`/article/${art.slug}`}
                  target="_blank"
                  className={styles.actionBtn}
                  title="View"
                >
                  <ExternalLink size={13} />
                </Link>
                <Link
                  to={`/admin/articles/edit/${art.id}`}
                  className={styles.actionBtn}
                  title="Edit"
                >
                  <Edit2 size={13} />
                </Link>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(art.id, art.title)}
                  disabled={deleting === art.id}
                  title="Delete"
                >
                  {deleting === art.id
                    ? <span className={styles.miniSpinner} />
                    : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
