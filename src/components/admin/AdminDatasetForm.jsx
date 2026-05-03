import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { createDataset, updateDataset, slugify } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../ui/RichTextEditorTinyMCE'
import styles from './AdminForm.module.css'

const CHART_TYPES = ['bar', 'line', 'pie', 'table']

const SAMPLE_JSON = `{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
  "datasets": [{
    "label": "Revenue",
    "data": [4200, 3800, 5100, 4700, 6200]
  }]
}`

const CURRENT_YEAR = new Date().getFullYear()

function parseChartData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    return {
      labels: Array.isArray(parsed.labels) ? parsed.labels.map(String) : [],
      datasets: Array.isArray(parsed.datasets)
        ? parsed.datasets.map(ds => ({
            label: String(ds.label || ''),
            data: Array.isArray(ds.data)
              ? ds.data.map(value => Number(value) || 0)
              : [],
          }))
        : [],
    }
  } catch {
    return { labels: [], datasets: [] }
  }
}

function formatNumberArray(values) {
  return values.map(v => (v === null || v === undefined ? '' : String(v))).join(', ')
}

// One year entry in the multi-year editor
function YearEntry({ entry, index, onUpdate, onRemove, isOnly }) {
  const set = (key, val) => onUpdate(index, { ...entry, [key]: val })
  const [chartData, setChartData] = useState(parseChartData(entry.chart_data))

  useEffect(() => {
    setChartData(parseChartData(entry.chart_data))
  }, [entry.chart_data])

  const updateChartData = (nextData) => {
    setChartData(nextData)
    set('chart_data', JSON.stringify(nextData, null, 2))
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rows     = results.data.filter(r => Object.values(r).some(Boolean))
        const headers  = results.meta.fields || []
        const labelKey = headers[0]
        const dataKeys = headers.slice(1)
        const chartData = {
          labels: rows.map(r => r[labelKey]),
          datasets: dataKeys.map(key => ({
            label: key,
            data:  rows.map(r => parseFloat(r[key]) || 0),
          })),
        }
        updateChartData(chartData)
        toast.success('CSV imported')
      },
      error: () => toast.error('Failed to parse CSV'),
    })
  }

  return (
    <div className={styles.yearEntry}>
      <div className={styles.yearEntryHeader}>
        <div className={styles.yearEntryTitle}>
          <span className={styles.yearBadge}>{entry.year || 'Year'}</span>
          <span className={styles.yearEntryLabel}>Data Entry</span>
        </div>
        {!isOnly && (
          <button
            type="button"
            className={styles.removeYearBtn}
            onClick={() => onRemove(index)}
            title="Remove this year"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Year number */}
      <div className={styles.field}>
        <label className={styles.label}>Year *</label>
        <input
          className={styles.input}
          type="number"
          min="1900"
          max="2100"
          value={entry.year}
          onChange={e => set('year', e.target.value)}
          placeholder={CURRENT_YEAR.toString()}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Entry Title</label>
          <input
            className={styles.input}
            value={entry.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Optional year-specific title"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Chart Type</label>
          <select
            className={styles.select}
            value={entry.chart_type}
            onChange={e => set('chart_type', e.target.value)}
          >
            {CHART_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)} Chart</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Short Description <span className={styles.labelHint}>(optional)</span></label>
        <textarea
          className={styles.textarea}
          value={entry.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Optional short description for this year"
        />
      </div>

      {/* CSV import for this year */}
      <div className={styles.field}>
        <label className={styles.label}>Import CSV <span className={styles.labelHint}>(optional)</span></label>
        <label className={styles.fileZone}>
          <Upload size={16} style={{ color: 'var(--text-muted)' }} />
          <p className={styles.fileZoneText}>Click to upload CSV — auto-converts to JSON</p>
          <input type="file" accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Structured chart data editor */}
      <div className={styles.field}>
        <label className={styles.label}>Chart Table</label>
        <div className={styles.chartTableWrap}>
          <table className={styles.chartTable}>
            <thead>
              <tr>
                <th>Series</th>
                {chartData.labels.map((label, labelIndex) => (
                  <th key={labelIndex}>
                    <input
                      className={styles.chartHeaderInput}
                      value={label}
                      onChange={e => updateChartData({
                        ...chartData,
                        labels: chartData.labels.map((lbl, idx) => idx === labelIndex ? e.target.value : lbl),
                      })}
                      placeholder={`Label ${labelIndex + 1}`}
                    />
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chartData.datasets.map((dataset, datasetIndex) => (
                <tr key={datasetIndex}>
                  <td>
                    <input
                      className={styles.chartTableInput}
                      value={dataset.label}
                      onChange={e => updateChartData({
                        ...chartData,
                        datasets: chartData.datasets.map((ds, idx) => idx === datasetIndex ? { ...ds, label: e.target.value } : ds),
                      })}
                      placeholder={`Series ${datasetIndex + 1}`}
                    />
                  </td>
                  {chartData.labels.map((_, labelIndex) => (
                    <td key={labelIndex}>
                      <input
                        className={styles.chartTableInput}
                        type="number"
                        value={dataset.data[labelIndex] ?? ''}
                        onChange={e => updateChartData({
                          ...chartData,
                          datasets: chartData.datasets.map((ds, idx) => idx === datasetIndex ? {
                            ...ds,
                            data: ds.data.map((value, dataIndex) => dataIndex === labelIndex ? Number(e.target.value) || 0 : value),
                          } : ds),
                        })}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className={styles.removeDatasetBtn}
                      onClick={() => updateChartData({
                        ...chartData,
                        datasets: chartData.datasets.filter((_, idx) => idx !== datasetIndex),
                      })}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.chartActions}>
          <button
            type="button"
            className={styles.addDatasetBtn}
            onClick={() => updateChartData({
              ...chartData,
              datasets: [...chartData.datasets, { label: `Series ${chartData.datasets.length + 1}`, data: Array(chartData.labels.length).fill(0) }],
            })}
          >
            Add series
          </button>
          <button
            type="button"
            className={styles.addDatasetBtn}
            onClick={() => updateChartData({
              ...chartData,
              labels: [...chartData.labels, `Label ${chartData.labels.length + 1}`],
              datasets: chartData.datasets.map(ds => ({ ...ds, data: [...ds.data, 0] })),
            })}
          >
            Add label
          </button>
        </div>
      </div>

      {/* Chart data JSON */}
      <div className={styles.field}>
        <label className={styles.label}>Chart Data JSON *</label>
        <textarea
          className={`${styles.textarea} ${styles.codeArea}`}
          value={entry.chart_data}
          onChange={e => set('chart_data', e.target.value)}
          spellCheck={false}
          placeholder={SAMPLE_JSON}
          required
        />
        <p className={styles.jsonHelper}>
          Format: <code>{"{ labels: [...], datasets: [{ label, data: [...] }] }"}</code>
        </p>
      </div>

      {/* Rich text description for this year */}
      <div className={styles.field}>
        <label className={styles.label}>
          Description for {entry.year || 'this year'}
          <span className={styles.labelHint}> (rich text — shown below the chart when this year is selected)</span>
        </label>
        <RichTextEditor
          value={entry.body}
          onChange={val => set('body', val)}
          placeholder={`Write analysis, key findings, or notes for ${entry.year || 'this year'}...`}
        />
      </div>
    </div>
  )
}

export default function AdminDatasetForm() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const isEdit      = !!id

  const [loading, setLoading]           = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(isEdit)
  const [tagInput, setTagInput]         = useState('')

  const [form, setForm] = useState({
    title:       '',
    description: '',
    slug:        '',
    chart_type:  'bar',
    tags:        [],
  })

  // Multi-year entries: [{ year, chart_data, body }, ...]
  const [yearEntries, setYearEntries] = useState([
    {
      year: CURRENT_YEAR.toString(),
      title: '',
      description: '',
      chart_type: 'bar',
      chart_data: SAMPLE_JSON,
      body: '',
    }
  ])

  useEffect(() => {
    if (!isEdit) return
    supabase.from('datasets').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          title:      data.title || '',
          description: data.description || '',
          slug:       data.slug || '',
          chart_type: data.chart_type || 'bar',
          tags:       data.tags || [],
        })

        // Load year entries from years_data
        if (data.years_data && Object.keys(data.years_data).length > 0) {
          const entries = Object.entries(data.years_data)
            .sort(([a], [b]) => b - a)
            .map(([year, val]) => ({
              year,
              title: val.title || '',
              description: val.description || '',
              chart_type: val.chart_type || data.chart_type || 'bar',
              chart_data: typeof val.chart_data === 'string'
                ? val.chart_data
                : JSON.stringify(val.chart_data, null, 2),
              body: val.body || '',
            }))
          setYearEntries(entries)
        } else if (data.chart_data) {
          // Legacy single dataset — migrate to year entry
          setYearEntries([{
            year: data.year?.toString() || CURRENT_YEAR.toString(),
            title: '',
            description: '',
            chart_type: data.chart_type || 'bar',
            chart_data: typeof data.chart_data === 'string'
              ? data.chart_data
              : JSON.stringify(data.chart_data, null, 2),
            body: data.body || '',
          }])
        }
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

  const addYearEntry = () => {
    const existingYears = yearEntries.map(e => parseInt(e.year)).filter(Boolean)
    const latestYear    = existingYears.length > 0 ? Math.max(...existingYears) : CURRENT_YEAR
    setYearEntries(prev => [
      { year: (latestYear + 1).toString(), chart_data: SAMPLE_JSON, body: '' },
      ...prev,
    ])
  }

  const updateYearEntry = (index, updated) => {
    setYearEntries(prev => prev.map((e, i) => i === index ? updated : e))
  }

  const removeYearEntry = (index) => {
    setYearEntries(prev => prev.filter((_, i) => i !== index))
  }

  const validateEntries = () => {
    for (const entry of yearEntries) {
      if (!entry.year) { toast.error('Each year entry needs a year number'); return false }
      try { JSON.parse(entry.chart_data) }
      catch { toast.error(`Invalid JSON in ${entry.year} chart data`); return false }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateEntries()) return
    setLoading(true)

    try {
      // Build years_data object
      const years_data = {}
      yearEntries.forEach(entry => {
        if (entry.year) {
          years_data[entry.year] = {
            title: entry.title || null,
            description: entry.description || null,
            chart_type: entry.chart_type || form.chart_type,
            chart_data: JSON.parse(entry.chart_data),
            body: entry.body || '',
          }
        }
      })

      // Default chart_data = latest year's data
      const sortedYears   = Object.keys(years_data).sort((a, b) => b - a)
      const latestYear    = sortedYears[0]
      const defaultChartData = latestYear ? years_data[latestYear].chart_data : {}
      const defaultBody      = latestYear ? years_data[latestYear].body : ''
      const defaultYear      = latestYear ? parseInt(latestYear) : null

      const payload = {
        ...form,
        slug:       form.slug || slugify(form.title),
        chart_data: defaultChartData,
        body:       defaultBody,
        year:       defaultYear,
        years_data,
      }

      if (isEdit) { await updateDataset(id, payload); toast.success('Dataset updated!') }
      else        { await createDataset(payload);      toast.success('Dataset created!') }
      navigate('/admin/datasets')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingEdit) return (
    <div className={styles.page}>
      <div className="skeleton" style={{ height: 400, borderRadius: 10 }} />
    </div>
  )

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
              placeholder="e.g. Global CO₂ Emissions"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Short Description <span className={styles.labelHint}>(shown in cards)</span></label>
            <RichTextEditor
              value={form.description}
              onChange={val => set('description', val)}
              placeholder="Brief summary shown on listing cards..."
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

        {/* Year data entries */}
        <div className={styles.formCard}>
          <div className={styles.yearsHeader}>
            <div>
              <p className={styles.formSection} style={{ margin: 0 }}>Data by Year</p>
              <p className={styles.yearsSub}>
                Each year has its own chart data and description.
                The latest year is shown by default on the public page.
              </p>
            </div>
            <button
              type="button"
              className={styles.addYearBtn}
              onClick={addYearEntry}
            >
              <Plus size={13} /> Add Year
            </button>
          </div>

          <div className={styles.yearEntriesList}>
            {yearEntries.map((entry, index) => (
              <YearEntry
                key={index}
                entry={entry}
                index={index}
                onUpdate={updateYearEntry}
                onRemove={removeYearEntry}
                isOnly={yearEntries.length === 1}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin/datasets" className={styles.cancelBtn}>Cancel</Link>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? <span className={styles.btnSpinner} />
              : isEdit ? 'Save Changes' : 'Create Dataset'
            }
          </button>
        </div>

      </form>
    </div>
  )
}