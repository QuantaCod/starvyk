import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Database, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { getDatasetBySlug, getRelatedDatasets, incrementDatasetViews } from '../lib/api'
import ChartRenderer from '../components/charts/ChartRenderer'
import ChartTypeSwitcher from '../components/charts/ChartTypeSwitcher'
import LikeButton from '../components/ui/LikeButton'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import RichTextDisplay from '../components/ui/RichTextDisplay'
import Comments from '../components/ui/Comments'
import RelatedContent from '../components/ui/RelatedContent'
import styles from './DatasetPage.module.css'

export default function DatasetPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset]     = useState(null)
  const [related, setRelated]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [chartType, setChartType] = useState('bar')

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDatasetBySlug(slug)
      .then(async data => {
        setDataset(data)
        setChartType(data.chart_type || 'bar')
        incrementDatasetViews(data.id)
        const rel = await getRelatedDatasets(data.id, data.tags || [])
        setRelated(rel)
      })
      .catch(() => setError('Dataset not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSkeleton />
  if (error || !dataset) return <NotFound />

  let chartData = null
  try {
    chartData = typeof dataset.chart_data === 'string'
      ? JSON.parse(dataset.chart_data)
      : dataset.chart_data
  } catch { chartData = null }

  return (
    <>
      <SEO title={dataset.title} description={dataset.description} url={`/dataset/${dataset.slug}`} type="article" />
      <div className={styles.page}>
        <Link to="/datasets" className={styles.back}><ArrowLeft size={14} /> Back to Datasets</Link>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}><Database size={12} /><span>Dataset</span></div>
            <h1 className={styles.title}>{dataset.title}</h1>
            <p className={styles.desc}>{dataset.description}</p>
            <div className={styles.tags}>
              {(dataset.tags || []).map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          </div>
          <div className={styles.headerRight}>
            <LikeButton type="dataset" targetId={dataset.id} initialCount={dataset.likes_count || 0} size="lg" />
            <div className={styles.metaGroup}>
              <span className={styles.meta}><Calendar size={11} />{format(new Date(dataset.created_at), 'MMM d, yyyy')}</span>
              <span className={styles.meta}><Eye size={11} />{(dataset.views_count || 0).toLocaleString()} views</span>
            </div>
          </div>
        </header>

        <section>
          <div className={styles.chartHeader}>
            <h2 className={styles.sectionLabel}>Visualization</h2>
            <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          </div>
          <div className={styles.chartCard}>
            <ChartRenderer data={chartData} chartType={chartType} />
          </div>
        </section>

        {dataset.body && (
          <section>
            <h2 className={styles.sectionLabel} style={{ marginBottom: 14 }}>About this Dataset</h2>
            <div className={styles.bodyCard}>
              <RichTextDisplay html={dataset.body} />
            </div>
          </section>
        )}

        {dataset.chart_data && (
          <details className={styles.rawDetails}>
            <summary className={styles.rawSummary}>View raw JSON data</summary>
            <pre className={styles.rawCode}>
              {JSON.stringify(
                typeof dataset.chart_data === 'string' ? JSON.parse(dataset.chart_data) : dataset.chart_data,
                null, 2
              )}
            </pre>
          </details>
        )}

        <Comments type="dataset" targetId={dataset.id} />

        {related.length > 0 && <RelatedContent items={related} type="dataset" title="More Datasets" />}

        <div className={styles.bottomNav}>
          <Link to="/datasets" className={styles.back}><ArrowLeft size={14} /> Back to Datasets</Link>
        </div>
      </div>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className={styles.page}>
      <div className={`skeleton ${styles.skBack}`} />
      <div className={`skeleton ${styles.skTitle}`} />
      <div className={`skeleton ${styles.skDesc}`} />
      <div className={`skeleton ${styles.skChart}`} />
    </div>
  )
}

function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.notFound}>
        <h2>Dataset not found</h2>
        <Link to="/datasets" className={styles.back}><ArrowLeft size={14} /> Back to Datasets</Link>
      </div>
    </div>
  )
}