import { useState, useEffect } from 'react'
import { MessageCircle, Send, User, Trash2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { getComments, addComment, deleteComment } from '../../lib/api'
import styles from './Comments.module.css'

export default function Comments({ type, targetId }) {
  const [comments, setComments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername]     = useState('')
  const [content, setContent]       = useState('')

  useEffect(() => {
    if (!targetId) return
    setLoading(true)
    getComments(type, targetId)
      .then(setComments)
      .catch(() => toast.error('Failed to load comments'))
      .finally(() => setLoading(false))
  }, [type, targetId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const newComment = await addComment({
        type, targetId,
        username: username.trim() || 'Anonymous',
        content: content.trim(),
      })
      setComments(prev => [newComment, ...prev])
      setContent('')
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <MessageCircle size={18} strokeWidth={1.5} />
        <h3 className={styles.title}>Comments</h3>
        <span className={styles.count}>{comments.length}</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}><User size={10} /> Name <span className={styles.optional}>(optional)</span></label>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your name"
            maxLength={60}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}><MessageCircle size={10} /> Comment <span className={styles.required}>*</span></label>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={1000}
            required
          />
          <span className={styles.charCount}>{content.length}/1000</span>
        </div>
        <div className={styles.formFooter}>
          <button type="submit" className={styles.submitBtn} disabled={submitting || !content.trim()}>
            {submitting ? <span className={styles.spinner} /> : <><Send size={13} /> Post Comment</>}
          </button>
        </div>
      </form>

      <div className={styles.list}>
        {loading ? (
          [1, 2].map(i => <div key={i} className={`skeleton ${styles.skeleton}`} />)
        ) : comments.length === 0 ? (
          <div className={styles.empty}>
            <MessageCircle size={28} strokeWidth={1} />
            <p>No comments yet. Be the first!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.avatar}>
                  {(comment.username || 'A')[0].toUpperCase()}
                </div>
                <div className={styles.commentMeta}>
                  <span className={styles.commentUser}>{comment.username || 'Anonymous'}</span>
                  <span className={styles.commentTime}>
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDelete(comment.id)} title="Delete comment">
                  <Trash2 size={12} />
                </button>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}