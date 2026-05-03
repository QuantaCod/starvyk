import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createArticle, updateArticle, slugify } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import styles from './AdminForm.module.css'
import articleStyles from '../../pages/ArticlePage.module.css'
import RichTextDisplay from '../ui/RichTextDisplay'
import RichTextEditor from '../ui/RichTextEditorTinyMCE'

export default function AdminArticleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(isEdit)
  const [tagInput, setTagInput] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: '',
    content: '## Introduction\n\nStart writing your article here...\n\n## Key Points\n\n- Point one\n- Point two\n- Point three\n\n## Conclusion\n\nWrap up your thoughts here.',
    tags: [],
    read_time: '',
  })

  useEffect(() => {
    if (!isEdit) return
    supabase.from('articles').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          slug: data.slug || '',
          content: data.content || '',
          tags: data.tags || [],
          read_time: data.read_time?.toString() || '',
        })
      }
      setFetchingEdit(false)
    })
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleTitleChange = (title) => {
    set('title', title)
    if (!isEdit) set('slug', slugify(title))
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
    setTagInput('')
  }

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag))

  const estimateReadTime = (html) => {
    const text = html.replace(/<[^>]+>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const handleContentChange = (val) => {
    set('content', val)
    set('read_time', estimateReadTime(val).toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        read_time: parseInt(form.read_time) || null,
      }
      if (isEdit) {
        await updateArticle(id, payload)
        toast.success('Article updated!')
      } else {
        await createArticle(payload)
        toast.success('Article created!')
      }
      navigate('/admin/articles')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingEdit) return <div className={styles.page}><div className={`skeleton`} style={{ height: 400, borderRadius: 10 }} /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/articles" className={styles.backBtn}>
          <ArrowLeft size={13} /> Articles
        </Link>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{isEdit ? 'Edit Article' : 'New Article'}</h1>
          <p className={styles.sub}>{isEdit ? `Editing: ${form.title}` : 'Write a new article in Markdown'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic info */}
        <div className={styles.formCard}>
          <p className={styles.formSection}>Article Info</p>

          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Understanding Climate Data Trends"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description / Excerpt</label>
            <RichTextEditor
              value={form.description}
              onChange={val => set('description', val)}
              placeholder="A brief summary shown in cards and SEO meta..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Slug <span className={styles.labelHint}>(auto-generated)</span></label>
              <input
                className={styles.input}
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="url-friendly-slug"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Read Time <span className={styles.labelHint}>(minutes, auto-estimated)</span></label>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={form.read_time}
                onChange={e => set('read_time', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className={styles.formCard}>
          <p className={styles.formSection}>Tags</p>
          <div className={styles.field}>
            <label className={styles.label}>Add Tags</label>
            <div className={styles.tagInput}>
              <input
                className={`${styles.input} ${styles.tagInputField}`}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Type a tag and press Enter"
              />
              <button type="button" className={styles.addTagBtn} onClick={addTag}>Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className={styles.tagList}>
                {form.tags.map(tag => (
                  <span key={tag} className={styles.tagChip}>
                    {tag}
                    <button type="button" className={styles.removeTagBtn} onClick={() => removeTag(tag)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.formCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p className={styles.formSection} style={{ margin: 0, border: 'none', paddingBottom: 0 }}>
              Content <span className={styles.labelHint}>(Markdown supported)</span>
            </p>
            <button
              type="button"
              onClick={() => setPreviewMode(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: previewMode ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {previewMode ? <Edit3 size={12} /> : <Eye size={12} />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>

          {previewMode ? (
            <div style={{
              minHeight: 320, padding: '20px',
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <RichTextDisplay html={form.content} />
            </div>
          ) : (
            <div className={styles.formCard}>
              <p className={styles.formSection}>
                Content
                <span className={styles.labelHint}> — rich text with formatting and links</span>
              </p>
              <div className={styles.field}>
                <label className={styles.label}>Article Body *</label>
                <RichTextEditor
                  value={form.content}
                  onChange={html => { set('content', html); set('read_time', estimateReadTime(html).toString()) }}
                  placeholder="Write your article here. Use the toolbar for headings, bold, links, lists..."
                />
                {form.read_time && (
                  <p className={styles.jsonHelper}>
                    Estimated read time: <strong style={{ color: 'var(--text-secondary)' }}>{form.read_time} min</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Link to="/admin/articles" className={styles.cancelBtn}>Cancel</Link>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.btnSpinner} /> : isEdit ? 'Save Changes' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  )
}
