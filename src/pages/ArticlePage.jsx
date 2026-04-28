import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, FileText, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { getArticleBySlug, getRelatedArticles, incrementArticleViews } from '../lib/api'
import LikeButton from '../components/ui/LikeButton'
import TagBadge from '../components/ui/TagBadge'
import SEO from '../components/ui/SEO'
import RichTextDisplay from '../components/ui/RichTextDisplay'
import Comments from '../components/ui/Comments'
import RelatedContent from '../components/ui/RelatedContent'
import styles from './ArticlePage.module.css'

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getArticleBySlug(slug)
      .then(async data => {
        setArticle(data)
        incrementArticleViews(data.id)
        const rel = await getRelatedArticles(data.id, data.tags || [])
        setRelated(rel)
      })
      .catch(() => setError('Article not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className={styles.page}>
      <div className={`skeleton ${styles.skBack}`} />
      <div className={`skeleton ${styles.skTitle}`} />
      <div className={`skeleton ${styles.skDesc}`} />
      <div className={`skeleton ${styles.skContent}`} />
    </div>
  )

  if (error || !article) return (
    <div className={styles.page}>
      <div className={styles.notFound}>
        <h2>Article not found</h2>
        <Link to="/articles" className={styles.back}><ArrowLeft size={14} /> Back to Articles</Link>
      </div>
    </div>
  )

  const isHTML = article.content?.trim().startsWith('<')

  return (
    <>
      <SEO title={article.title} description={article.description} url={`/article/${article.slug}`} type="article" />
      <div className={styles.page}>
        <Link to="/articles" className={styles.back}><ArrowLeft size={14} /> Back to Articles</Link>

        <header className={styles.header}>
          <div className={styles.eyebrow}><FileText size={12} /><span>Article</span></div>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.desc}>{article.description}</p>
          <div className={styles.metaRow}>
            <span className={styles.meta}><Calendar size={12} />{format(new Date(article.created_at), 'MMMM d, yyyy')}</span>
            {article.read_time && <span className={styles.meta}><Clock size={12} />{article.read_time} min read</span>}
            <span className={styles.meta}><Eye size={12} />{(article.views_count || 0).toLocaleString()} views</span>
            <LikeButton type="article" targetId={article.id} initialCount={article.likes_count || 0} />
          </div>
          {(article.tags || []).length > 0 && (
            <div className={styles.tags}>{article.tags.map(tag => <TagBadge key={tag} tag={tag} />)}</div>
          )}
        </header>

        <hr className={styles.divider} />

        <div className={styles.content}>
          {isHTML
            ? <RichTextDisplay html={article.content} />
            : <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{article.content}</p>
          }
        </div>

        <div className={styles.likeFooter}>
          <p>Enjoyed this article?</p>
          <LikeButton type="article" targetId={article.id} initialCount={article.likes_count || 0} size="lg" />
        </div>

        <Comments type="article" targetId={article.id} />

        {related.length > 0 && <RelatedContent items={related} type="article" title="More Articles" />}

        <div className={styles.bottomNav}>
          <Link to="/articles" className={styles.back}><ArrowLeft size={14} /> Back to Articles</Link>
        </div>
      </div>
    </>
  )
}