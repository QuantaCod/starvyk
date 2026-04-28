import { useNavigate } from 'react-router-dom'
import styles from './TagBadge.module.css'

export default function TagBadge({ tag, onClick, active }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) return onClick(tag)
    navigate(`/?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <button
      className={`${styles.tag} ${active ? styles.active : ''}`}
      onClick={handleClick}
    >
      {tag}
    </button>
  )
}
