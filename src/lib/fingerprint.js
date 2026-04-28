import { v4 as uuidv4 } from 'uuid'

const FINGERPRINT_KEY = 'dvp_uid'

/**
 * Gets or creates a persistent browser fingerprint UUID
 */
export function getFingerprint() {
  let uid = localStorage.getItem(FINGERPRINT_KEY)
  if (!uid) {
    uid = uuidv4()
    localStorage.setItem(FINGERPRINT_KEY, uid)
  }
  return uid
}

/**
 * Returns the localStorage key tracking whether this item was liked
 */
function getLikeKey(type, id) {
  return `dvp_liked_${type}_${id}`
}

/**
 * Check if user has already liked this item (true = liked, false = not liked)
 */
export function isLiked(type, id) {
  return localStorage.getItem(getLikeKey(type, id)) === 'true'
}

/**
 * Mark item as liked in localStorage
 */
export function markLiked(type, id) {
  localStorage.setItem(getLikeKey(type, id), 'true')
}

/**
 * Mark item as unliked in localStorage
 */
export function markUnliked(type, id) {
  localStorage.removeItem(getLikeKey(type, id))
}