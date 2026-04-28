import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Database } from 'lucide-react'
import { format } from 'date-fns'
import { getDatasetBySlug } from '../lib/api'
import ChartRenderer from '../components/charts/ChartRenderer'
import ChartTypeSwitcher from '../components/charts/ChartTypeSwitcher'
import LikeButton from '../components/ui/LikeButton'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import styles from './DatasetPage.module.css'

export default function DatasetPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [chartType, setChartType] = useState('bar')

  useEffect(() => {
    getDatasetBySlug(slug)
      .then(data => {
        setDataset(data)
        setChartType(data.chart_type || 'bar')
      })
      .catch(() => setError('Dataset not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSkeleton onBack={() => navigate(-1)} />
  if (error || !dataset) return <NotFound />

  let chartData = null
  try {
    chartData = typeof dataset.chart_data === 'string'
      ? JSON.parse(dataset.chart_data)
      : dataset.chart_data
  } catch { chartData = null }

  return (
    <>
      <SEO
        title={dataset.title}
        description={dataset.description}
        url={`/dataset/${dataset.slug}`}
        type="article"
      />
      <div className={styles.page}>

        {/* Back */}
        <Link to="/datasets" className={styles.back}>
          <ArrowLeft size={14} /> Back to Datasets
        </Link>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <Database size={12} />
              <span>Dataset</span>
            </div>
            <h1 className={styles.title}>{dataset.title}</h1>
            <p className={styles.desc}>{dataset.description}</p>
            <div className={styles.tags}>
              {(dataset.tags || []).map(tag => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>

          <div className={styles.headerRight}>
            <LikeButton
              type="dataset"
              targetId={dataset.id}
              initialCount={dataset.likes_count || 0}
              size="lg"
            />
            <span className={styles.meta}>
              <Calendar size={12} />
              {format(new Date(dataset.created_at), 'MMMM d, yyyy')}
            </span>
          </div>
        </header>

        {/* Chart */}
        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Visualization</h2>
            <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          </div>
          <div className={styles.chartCard}>
            <ChartRenderer data={chartData} chartType={chartType} />
          </div>
        </section>

        {/* Raw data
        {dataset.chart_data && (
          <section className={styles.rawSection}>
            <details className={styles.rawDetails}>
              <summary className={styles.rawSummary}>View raw JSON data</summary>
              <pre className={styles.rawCode}>
                {JSON.stringify(
                  typeof dataset.chart_data === 'string'
                    ? JSON.parse(dataset.chart_data)
                    : dataset.chart_data,
                  null, 2
                )}
              </pre>
            </details>
          </section>
        )} */}

        {/* Bottom back */}
        <div className={styles.bottomNav}>
          <Link to="/datasets" className={styles.back}>
            <ArrowLeft size={14} /> Back to Datasets
          </Link>
        </div>

      </div>
    </>
  )
}

function LoadingSkeleton({ onBack }) {
  return (
    <div className={styles.page}>
      <button onClick={onBack} className={styles.back} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className={`skeleton ${styles.skTitle}`} />
      <div className={`skeleton ${styles.skDesc}`} />
      <div className={`skeleton ${styles.skChart}`} />
    </div>
  )
}

function NotFound() {
  return (
    <div className={styles.notFound}>
      <h2>Dataset not found</h2>
      <Link to="/datasets" className={styles.back}>
        <ArrowLeft size={14} /> Back to Datasets
      </Link>
    </div>
  )
}
