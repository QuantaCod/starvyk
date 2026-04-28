import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, Database } from 'lucide-react'
import { getDatasets, getAllTags } from '../lib/api'
import DatasetCard from '../components/ui/DatasetCard'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import { SkeletonGrid } from '../components/ui/Skeleton'
import styles from './ListingPage.module.css'

const PAGE_SIZE = 12

export default function DatasetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [datasets, setDatasets]         = useState([])
  const [tags, setTags]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(0)

  const search = searchParams.get('search') || ''
  const tag    = searchParams.get('tag')    || ''

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    setPage(0)
    setSearchParams(p)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [data, allTags] = await Promise.all([
        getDatasets({ search, tag, limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
        getAllTags(),
      ])
      setDatasets(data)
      setTags(allTags)
      setTotal(data.length < PAGE_SIZE ? page * PAGE_SIZE + data.length : (page + 1) * PAGE_SIZE + 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, tag, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <SEO title="Datasets" description="Explore all datasets with interactive charts and visualizations." url="/datasets" />
      <div className={styles.page}>

        {/* Back */}
        <Link to="/" className={styles.backBtn}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon} style={{ '--icon-color': '#4dabf7' }}>
              <Database size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Datasets</h1>
              <p className={styles.pageSub}>
                {loading ? 'Loading…' : `${datasets.length} result${datasets.length !== 1 ? 's' : ''}${search ? ` for "${search}"` : ''}${tag ? ` tagged "${tag}"` : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Search + Tags */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search datasets…"
              value={search}
              onChange={e => setParam('search', e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setParam('search', '')}>✕</button>
            )}
          </div>
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map(t => (
                <TagBadge key={t} tag={t} active={tag === t} onClick={v => setParam('tag', tag === v ? '' : v)} />
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : datasets.length === 0 ? (
          <div className={styles.empty}>
            <p>No datasets found.</p>
            <button className={styles.clearFilters} onClick={() => { setParam('search',''); setParam('tag','') }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {datasets.map((d, i) => <DatasetCard key={d.id} dataset={d} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {!loading && datasets.length === PAGE_SIZE && (
          <div className={styles.pagination}>
            {page > 0 && (
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)}>← Previous</button>
            )}
            <span className={styles.pageInfo}>Page {page + 1}</span>
            <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
        {!loading && page > 0 && datasets.length < PAGE_SIZE && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <span className={styles.pageInfo}>Page {page + 1}</span>
          </div>
        )}

      </div>
    </>
  )
}
