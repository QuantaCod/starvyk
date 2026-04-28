import { supabase } from './supabase'
import { getFingerprint, markLiked, markUnliked } from './fingerprint'

// ─── Datasets ────────────────────────────────────────────────

export async function getDatasets({ search = '', tag = '', limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('datasets')
    .select('id, title, slug, description, tags, chart_type, created_at, likes_count, views_count')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (tag)    query = query.contains('tags', [tag])
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTrendingDatasets(limit = 4) {
  const { data, error } = await supabase
    .from('datasets')
    .select('id, title, slug, description, tags, chart_type, created_at, likes_count, views_count')
    .order('views_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getDatasetBySlug(slug) {
  const { data, error } = await supabase
    .from('datasets').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}

export async function getRelatedDatasets(currentId, tags = [], limit = 3) {
  let { data } = await supabase
    .from('datasets')
    .select('id, title, slug, description, tags, chart_type, created_at, likes_count, views_count')
    .neq('id', currentId)
    .overlaps('tags', tags.length ? tags : ['__none__'])
    .order('views_count', { ascending: false })
    .limit(limit)
  if (!data || data.length < limit) {
    const { data: popular } = await supabase
      .from('datasets')
      .select('id, title, slug, description, tags, chart_type, created_at, likes_count, views_count')
      .neq('id', currentId)
      .order('views_count', { ascending: false })
      .limit(limit)
    return popular || []
  }
  return data
}

export async function createDataset(payload) {
  const { data, error } = await supabase.from('datasets').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function updateDataset(id, payload) {
  const { data, error } = await supabase.from('datasets').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteDataset(id) {
  const { error } = await supabase.from('datasets').delete().eq('id', id)
  if (error) throw error
}

export async function incrementDatasetViews(id) {
  await supabase.rpc('increment_views', { table_name: 'datasets', row_id: id })
}

// ─── Articles ────────────────────────────────────────────────

export async function getArticles({ search = '', tag = '', limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('articles')
    .select('id, title, slug, description, tags, created_at, likes_count, read_time, views_count')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (tag)    query = query.contains('tags', [tag])
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTrendingArticles(limit = 4) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, description, tags, created_at, likes_count, read_time, views_count')
    .order('views_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}

export async function getRelatedArticles(currentId, tags = [], limit = 3) {
  let { data } = await supabase
    .from('articles')
    .select('id, title, slug, description, tags, created_at, likes_count, read_time, views_count')
    .neq('id', currentId)
    .overlaps('tags', tags.length ? tags : ['__none__'])
    .order('views_count', { ascending: false })
    .limit(limit)
  if (!data || data.length < limit) {
    const { data: popular } = await supabase
      .from('articles')
      .select('id, title, slug, description, tags, created_at, likes_count, read_time, views_count')
      .neq('id', currentId)
      .order('views_count', { ascending: false })
      .limit(limit)
    return popular || []
  }
  return data
}

export async function createArticle(payload) {
  const { data, error } = await supabase.from('articles').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function updateArticle(id, payload) {
  const { data, error } = await supabase.from('articles').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteArticle(id) {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw error
}

export async function incrementArticleViews(id) {
  await supabase.rpc('increment_views', { table_name: 'articles', row_id: id })
}

// ─── Comments ────────────────────────────────────────────────

export async function getComments(type, targetId) {
  const { data, error } = await supabase
    .from('comments').select('*')
    .eq('target_type', type).eq('target_id', targetId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addComment({ type, targetId, username, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      target_type: type,
      target_id:   targetId,
      username:    username?.trim() || 'Anonymous',
      content:     content.trim(),
    }])
    .select().single()
  if (error) throw error
  return data
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}

// ─── Likes ───────────────────────────────────────────────────

export async function toggleLike(type, targetId) {
  const fingerprint = getFingerprint()
  const table = type === 'dataset' ? 'datasets' : 'articles'
  const { data: existing } = await supabase
    .from('likes').select('id')
    .eq('target_type', type).eq('target_id', targetId).eq('fingerprint', fingerprint)
    .maybeSingle()
  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('id', existing.id)
    if (error) throw error
    await supabase.rpc('decrement_likes', { table_name: table, row_id: targetId })
    markUnliked(type, targetId)
    return { success: true, liked: false }
  } else {
    const { error } = await supabase.from('likes')
      .insert([{ target_type: type, target_id: targetId, fingerprint }])
    if (error && error.code !== '23505') throw error
    if (!error) {
      await supabase.rpc('increment_likes', { table_name: table, row_id: targetId })
      markLiked(type, targetId)
    }
    return { success: true, liked: true }
  }
}

export async function getLikeStatus(type, targetId) {
  const fingerprint = getFingerprint()
  const { data } = await supabase
    .from('likes').select('id')
    .eq('target_type', type).eq('target_id', targetId).eq('fingerprint', fingerprint)
    .maybeSingle()
  return data !== null
}

// ─── Tags ────────────────────────────────────────────────────

export async function getAllTags() {
  const [{ data: datasets }, { data: articles }] = await Promise.all([
    supabase.from('datasets').select('tags'),
    supabase.from('articles').select('tags'),
  ])
  const tagSet = new Set()
  ;[...(datasets || []), ...(articles || [])].forEach(item => {
    (item.tags || []).forEach(tag => tagSet.add(tag))
  })
  return [...tagSet].sort()
}

export function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}