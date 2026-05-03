import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Database, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { getDatasetBySlug, getRelatedDatasets, incrementDatasetViews } from '../lib/api'
import ChartRenderer from '../components/charts/ChartRenderer'
import ChartTypeSwitcher from '../components/charts/ChartTypeSwitcher'
import YearDropdown from '../components/charts/YearDropdown'
import LikeButton from '../components/ui/LikeButton'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import RichTextDisplay from '../components/ui/RichTextDisplay'
import Comments from '../components/ui/Comments'
import RelatedContent from '../components/ui/RelatedContent'
import styles from './DatasetPage.module.css'

export default function DatasetPage() {
  const { slug } = useParams()
  const [dataset, setDataset]         = useState(null)
  const [related, setRelated]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [chartType, setChartType]     = useState('bar')
  const [selectedYear, setSelectedYear] = useState(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    getDatasetBySlug(slug)
      .then(async data => {
        setDataset(data)
        setChartType(data.chart_type || 'bar')
        incrementDatasetViews(data.id)

        // Set default year to latest if years_data exists
        if (data.years_data && Object.keys(data.years_data).length > 0) {
          const years = Object.keys(data.years_data).sort((a, b) => b - a)
          setSelectedYear(years[0])
        }

        const rel = await getRelatedDatasets(data.id, data.tags || [])
        setRelated(rel)
      })
      .catch(() => setError('Dataset not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSkeleton />
  if (error || !dataset) return <NotFound />

  // Build years list — sorted latest first
  const hasYears = dataset.years_data && Object.keys(dataset.years_data).length > 0
  const years    = hasYears
    ? Object.keys(dataset.years_data).sort((a, b) => b - a)
    : []

  // Determine active chart data and body
  // If a year is selected use that year's data, else use the base data
  let activeChartData = null
  let activeTitle     = dataset.title
  let activeBody      = dataset.body || null

  if (hasYears && selectedYear && dataset.years_data[selectedYear]) {
    const yearEntry = dataset.years_data[selectedYear]
    try {
      activeChartData = typeof yearEntry.chart_data === 'string'
        ? JSON.parse(yearEntry.chart_data)
        : yearEntry.chart_data
    } catch { activeChartData = null }
    // Each year can have its own body; fall back to main body
    if (yearEntry.body) activeBody = yearEntry.body
    // Optionally prefix title with year
    activeTitle = `${dataset.title} — ${selectedYear}`
  } else {
    try {
      activeChartData = typeof dataset.chart_data === 'string'
        ? JSON.parse(dataset.chart_data)
        : dataset.chart_data
    } catch { activeChartData = null }
  }

  return (
    <>
      <SEO
        title={activeTitle}
        description={dataset.description}
        url={`/dataset/${dataset.slug}`}
        type="article"
      />
      <div className={styles.page}>

        <Link to="/datasets" className={styles.back}>
          <ArrowLeft size={14} /> Back to Datasets
        </Link>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <Database size={12} />
              <span>Dataset</span>
              {hasYears && selectedYear && (
                <span className={styles.yearLabel}>{selectedYear}</span>
              )}
            </div>
            <h1 className={styles.title}>{dataset.title}</h1>
            <p className={styles.desc}>{dataset.description}</p>
            <div className={styles.tags}>
              {(dataset.tags || []).map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          </div>

          <div className={styles.headerRight}>
            <LikeButton
              type="dataset"
              targetId={dataset.id}
              initialCount={dataset.likes_count || 0}
              size="lg"
            />
            <div className={styles.metaGroup}>
              <span className={styles.meta}>
                <Calendar size={11} />
                {format(new Date(dataset.created_at), 'MMM d, yyyy')}
              </span>
              <span className={styles.meta}>
                <Eye size={11} />
                {(dataset.views_count || 0).toLocaleString()} views
              </span>
            </div>
          </div>
        </header>

        {/* Chart section */}
        <section className={styles.chartSection}>
          {/* Controls row: year dropdown (left) + chart type switcher (right) */}
          <div className={styles.chartControls}>
            <div className={styles.chartControlsLeft}>
              <h2 className={styles.sectionLabel}>Visualization</h2>
              {hasYears && (
                <YearDropdown
                  years={years}
                  selectedYear={selectedYear}
                  onChange={setSelectedYear}
                />
              )}
            </div>
            <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          </div>

          <div className={styles.chartCard}>
            <ChartRenderer data={activeChartData} chartType={chartType} />
          </div>
        </section>

        {/* Description below chart — updates with year */}
        {activeBody && (
          <section className={styles.bodySection}>
            <h2 className={styles.sectionLabel}>
              About this Dataset
              {hasYears && selectedYear && (
                <span className={styles.yearBadge}>{selectedYear}</span>
              )}
            </h2>
            <div className={styles.bodyCard}>
              <RichTextDisplay html={activeBody} />
            </div>
          </section>
        )}

        {/* Comments */}
        <Comments type="dataset" targetId={dataset.id} />

        {/* Related */}
        {related.length > 0 && (
          <RelatedContent items={related} type="dataset" title="More Datasets" />
        )}

        <div className={styles.bottomNav}>
          <Link to="/datasets" className={styles.back}>
            <ArrowLeft size={14} /> Back to Datasets
          </Link>
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
        <Link to="/datasets" className={styles.back}>
          <ArrowLeft size={14} /> Back to Datasets
        </Link>
      </div>
    </div>
  )
}