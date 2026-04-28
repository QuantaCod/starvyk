import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Heart, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getDatasets, deleteDataset } from '../../lib/api'
import styles from './AdminList.module.css'

export default function AdminDatasetList() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDatasets({ limit: 50 })
      setDatasets(data)
    } catch {
      toast.error('Failed to load datasets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteDataset(id)
      toast.success('Dataset deleted')
      setDatasets(ds => ds.filter(d => d.id !== id))
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
          <h1 className={styles.title}>Datasets</h1>
          <p className={styles.sub}>{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/admin/datasets/new" className={styles.addBtn}>
          <Plus size={14} /> New Dataset
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1,2,3,4].map(i => <div key={i} className={`skeleton ${styles.skeleton}`} />)}
        </div>
      ) : datasets.length === 0 ? (
        <div className={styles.empty}>
          <p>No datasets yet.</p>
          <Link to="/admin/datasets/new" className={styles.emptyBtn}>
            <Plus size={13} /> Create your first dataset
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {datasets.map(ds => (
            <div key={ds.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemTitle}>{ds.title}</h3>
                <p className={styles.itemDesc}>{ds.description}</p>
                <div className={styles.itemMeta}>
                  <span className={styles.metaBadge}>{ds.chart_type || 'bar'}</span>
                  {(ds.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className={styles.metaTag}>{tag}</span>
                  ))}
                  <span className={styles.metaDate}>
                    {format(new Date(ds.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div className={styles.itemActions}>
                <span className={styles.likes}>
                  <Heart size={11} /> {ds.likes_count || 0}
                </span>
                <Link
                  to={`/dataset/${ds.slug}`}
                  target="_blank"
                  className={styles.actionBtn}
                  title="View"
                >
                  <ExternalLink size={13} />
                </Link>
                <Link
                  to={`/admin/datasets/edit/${ds.id}`}
                  className={styles.actionBtn}
                  title="Edit"
                >
                  <Edit2 size={13} />
                </Link>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(ds.id, ds.title)}
                  disabled={deleting === ds.id}
                  title="Delete"
                >
                  {deleting === ds.id
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
