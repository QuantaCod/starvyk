import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, FileText } from 'lucide-react'
import { getArticles, getAllTags } from '../lib/api'
import ArticleCard from '../components/ui/ArticleCard'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import { SkeletonGrid } from '../components/ui/Skeleton'
import styles from './ListingPage.module.css'

const PAGE_SIZE = 12

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles]         = useState([])
  const [tags, setTags]                 = useState([])
  const [loading, setLoading]           = useState(true)
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
        getArticles({ search, tag, limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
        getAllTags(),
      ])
      setArticles(data)
      setTags(allTags)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, tag, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <SEO title="Articles" description="Read insightful articles on data, visualization, and analysis." url="/articles" />
      <div className={styles.page}>

        <Link to="/" className={styles.backBtn}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon} style={{ '--icon-color': '#e8ff47' }}>
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>Articles</h1>
              <p className={styles.pageSub}>
                {loading ? 'Loading…' : `${articles.length} result${articles.length !== 1 ? 's' : ''}${search ? ` for "${search}"` : ''}${tag ? ` tagged "${tag}"` : ''}`}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search articles…"
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

        {loading ? (
          <SkeletonGrid count={8} />
        ) : articles.length === 0 ? (
          <div className={styles.empty}>
            <p>No articles found.</p>
            <button className={styles.clearFilters} onClick={() => { setParam('search',''); setParam('tag','') }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
          </div>
        )}

        {!loading && articles.length === PAGE_SIZE && (
          <div className={styles.pagination}>
            {page > 0 && (
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)}>← Previous</button>
            )}
            <span className={styles.pageInfo}>Page {page + 1}</span>
            <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
        {!loading && page > 0 && articles.length < PAGE_SIZE && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <span className={styles.pageInfo}>Page {page + 1}</span>
          </div>
        )}

      </div>
    </>
  )
}
