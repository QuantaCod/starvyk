import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { createDataset, updateDataset, slugify } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import styles from './AdminForm.module.css'
import RichTextEditor from '../ui/RichTextEditor'

const CHART_TYPES = ['bar', 'line', 'pie', 'table']

const SAMPLE_JSON = `{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
  "datasets": [{
    "label": "Revenue",
    "data": [4200, 3800, 5100, 4700, 6200]
  }]
}`

export default function AdminDatasetForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(isEdit)
  const [tagInput, setTagInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    slug: '',
    chart_type: 'bar',
    chart_data: SAMPLE_JSON,
    tags: [],
  })

  useEffect(() => {
    if (!isEdit) return
    supabase.from('datasets').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          slug: data.slug || '',
          chart_type: data.chart_type || 'bar',
          chart_data: typeof data.chart_data === 'string'
            ? data.chart_data
            : JSON.stringify(data.chart_data, null, 2),
          tags: data.tags || [],
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
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag))

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rows = results.data.filter(r => Object.values(r).some(Boolean))
        const headers = results.meta.fields || []
        const labelKey = headers[0]
        const dataKeys = headers.slice(1)
        const chartData = {
          labels: rows.map(r => r[labelKey]),
          datasets: dataKeys.map(key => ({
            label: key,
            data: rows.map(r => parseFloat(r[key]) || 0),
          })),
        }
        set('chart_data', JSON.stringify(chartData, null, 2))
        toast.success('CSV imported successfully')
      },
      error: () => toast.error('Failed to parse CSV'),
    })
  }

  const validateJSON = () => {
    try {
      JSON.parse(form.chart_data)
      return true
    } catch {
      toast.error('Invalid JSON in chart data')
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateJSON()) return
    setLoading(true)
    try {
      const payload = {
        body: form.body,
        ...form,
        chart_data: JSON.parse(form.chart_data),
        slug: form.slug || slugify(form.title),
      }
      if (isEdit) {
        await updateDataset(id, payload)
        toast.success('Dataset updated!')
      } else {
        await createDataset(payload)
        toast.success('Dataset created!')
      }
      navigate('/admin/datasets')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingEdit) return <div className={styles.page}><div className={`skeleton ${styles.pageSkeleton}`} style={{ height: 400 }} /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/datasets" className={styles.backBtn}>
          <ArrowLeft size={13} /> Datasets
        </Link>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{isEdit ? 'Edit Dataset' : 'New Dataset'}</h1>
          <p className={styles.sub}>{isEdit ? `Editing: ${form.title}` : 'Add a new data visualization'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic info */}
        <div className={styles.formCard}>
          <p className={styles.formSection}>Basic Information</p>

          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Global CO₂ Emissions 2020–2024"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of what this dataset shows..."
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
              <label className={styles.label}>Default Chart Type</label>
              <select
                className={styles.select}
                value={form.chart_type}
                onChange={e => set('chart_type', e.target.value)}
              >
                {CHART_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Chart</option>
                ))}
              </select>
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
              <button type="button" className={styles.addTagBtn} onClick={addTag}>
                Add
              </button>
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

        {/* Chart data */}
        <div className={styles.formCard}>
          <p className={styles.formSection}>Chart Data</p>

          <div className={styles.field}>
            <label className={styles.label}>Import from CSV <span className={styles.labelHint}>(optional — auto-converts to JSON)</span></label>
            <label className={styles.fileZone}>
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
              <p className={styles.fileZoneText}>Click to upload a CSV file</p>
              <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Chart Data JSON *</label>
            <textarea
              className={`${styles.textarea} ${styles.codeArea}`}
              value={form.chart_data}
              onChange={e => set('chart_data', e.target.value)}
              spellCheck={false}
              required
            />
            <p className={styles.jsonHelper}>
              Must follow Chart.js format: <code>{"{ labels: [...], datasets: [{ label, data: [...] }] }"}</code>
            </p>
          </div>
        </div>
        <div className={styles.formCard}>
          <p className={styles.formSection}>
            Detailed Description
            <span className={styles.labelHint}> — shown below the chart on the dataset page</span>
          </p>
          <div className={styles.field}>
            <label className={styles.label}>
              Body Content
              <span className={styles.labelHint}>(rich text, supports formatting + links)</span>
              </label>
              <RichTextEditor
                value={form.body}                
                onChange={val => set('body', val)}     placeholder="Write a detailed description, methodology, data sources, key findings..."
              />
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/datasets" className={styles.cancelBtn}>Cancel</Link>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.btnSpinner} /> : isEdit ? 'Save Changes' : 'Create Dataset'}
          </button>
        </div>
      </form>
    </div>
  )
}
