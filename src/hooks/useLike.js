import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toggleLike, getLikeStatus } from '../lib/api'
import { isLiked } from '../lib/fingerprint'
import toast from 'react-hot-toast'

export function useLike(type, targetId, initialCount = 0) {
  const [liked, setLiked]     = useState(() => isLiked(type, targetId))
  const [count, setCount]     = useState(initialCount)
  const [loading, setLoading] = useState(false)

  // Sync count when parent prop changes (e.g. card re-renders)
  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  // Verify like status from DB on mount (localStorage may be stale)
  useEffect(() => {
    if (!targetId) return
    getLikeStatus(type, targetId).then(status => {
      setLiked(status)
    })
  }, [type, targetId])

  // Poll for live count updates every 6 seconds
  useEffect(() => {
    if (!targetId) return
    const table = type === 'dataset' ? 'datasets' : 'articles'

    const poll = async () => {
      const { data } = await supabase
        .from(table)
        .select('likes_count')
        .eq('id', targetId)
        .maybeSingle()
      if (data?.likes_count !== undefined) {
        setCount(data.likes_count)
      }
    }

    const interval = setInterval(poll, 6000)
    return () => clearInterval(interval)
  }, [type, targetId])

  const handleLike = useCallback(async () => {
    if (loading || !targetId) return
    setLoading(true)

    // Optimistic toggle immediately
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount(c => wasLiked ? Math.max(0, c - 1) : c + 1)

    try {
      const result = await toggleLike(type, targetId)
      // Sync with actual DB result in case optimistic was wrong
      setLiked(result.liked)
    } catch (err) {
      // Revert on failure
      setLiked(wasLiked)
      setCount(c => wasLiked ? c + 1 : Math.max(0, c - 1))
      toast.error('Could not update like. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [type, targetId, liked, loading])

  return { liked, count, loading, handleLike }
}
