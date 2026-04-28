import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Database, FileText, ArrowRight, Flame } from 'lucide-react'
import { getTrendingDatasets, getTrendingArticles } from '../lib/api'
import DatasetCard from '../components/ui/DatasetCard'
import ArticleCard from '../components/ui/ArticleCard'
import SEO from '../components/ui/SEO'
import { SkeletonGrid } from '../components/ui/Skeleton'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [datasets, setDatasets]     = useState([])
  const [articles, setArticles]     = useState([])
  const [search, setSearch]         = useState('')
  const [loadingDs, setLoadingDs]   = useState(true)
  const [loadingArt, setLoadingArt] = useState(true)

  useEffect(() => {
    getTrendingDatasets(4).then(setDatasets).finally(() => setLoadingDs(false))
  }, [])

  useEffect(() => {
    getTrendingArticles(4).then(setArticles).finally(() => setLoadingArt(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) window.location.href = `/datasets?search=${encodeURIComponent(search.trim())}`
  }

  return (
    <>
      <SEO />
      <div className={styles.page}>
        <section className={`${styles.hero} grid-bg`}>
          <div className={styles.heroInner}>
            <div className={styles.heroEyebrow}>
              <TrendingUp size={12} />
              <span>Data Made Beautiful</span>
            </div>
            <h1 className={styles.heroTitle}>
              Analyze. Visualize<br />
              <span className={styles.heroAccent}>Understand</span>
            </h1>
            <p className={styles.heroDesc}>
              Explore curated datasets and insightful articles.
              Interactive visualizations, real insights, All in one place.
            </p>
            <form className={styles.searchWrap} onSubmit={handleSearch}>
              <Search size={16} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search datasets and articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>
            <div className={styles.heroStats}>
              <div className={styles.statPill}><Database size={12} /><span>Datasets</span></div>
              <div className={styles.statPill}><FileText size={12} /><span>Articles</span></div>
              <div className={styles.statPill}><Flame size={12} /><span>Trending</span></div>
            </div>
          </div>
        </section>

        {/* Trending Datasets */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <div className={styles.sectionIcon} style={{ '--icon-color': '#4dabf7' }}>
                <Database size={16} strokeWidth={1.5} />
              </div>
              <div>
                <div className={styles.sectionTitleRow}>
                  <h2 className={styles.sectionTitle}>Trending Datasets</h2>
                  <span className={styles.trendingBadge}><Flame size={10} /> Most Viewed</span>
                </div>
                <p className={styles.sectionSub}>Most-viewed datasets right now</p>
              </div>
            </div>
            <Link to="/datasets" className={styles.viewMoreBtn}>View all datasets <ArrowRight size={14} /></Link>
          </div>
          {loadingDs ? <SkeletonGrid count={4} /> : datasets.length === 0
            ? <div className={styles.empty}><p>No datasets published yet.</p></div>
            : <div className={styles.grid}>{datasets.map((d, i) => <DatasetCard key={d.id} dataset={d} index={i} />)}</div>
          }
          <div className={styles.viewMoreRow}>
            <Link to="/datasets" className={styles.viewMoreInline}>Explore all datasets <ArrowRight size={13} /></Link>
          </div>
        </section>

        <div className={styles.divider} />

        {/* Trending Articles */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <div className={styles.sectionIcon} style={{ '--icon-color': '#e8ff47' }}>
                <FileText size={16} strokeWidth={1.5} />
              </div>
              <div>
                <div className={styles.sectionTitleRow}>
                  <h2 className={styles.sectionTitle}>Trending Articles</h2>
                  <span className={styles.trendingBadge}><Flame size={10} /> Most Viewed</span>
                </div>
                <p className={styles.sectionSub}>Most-read articles right now</p>
              </div>
            </div>
            <Link to="/articles" className={styles.viewMoreBtn}>View all articles <ArrowRight size={14} /></Link>
          </div>
          {loadingArt ? <SkeletonGrid count={4} /> : articles.length === 0
            ? <div className={styles.empty}><p>No articles published yet.</p></div>
            : <div className={styles.grid}>{articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}</div>
          }
          <div className={styles.viewMoreRow}>
            <Link to="/articles" className={styles.viewMoreInline}>Read all articles <ArrowRight size={13} /></Link>
          </div>
        </section>
      </div>
    </>
  )
}