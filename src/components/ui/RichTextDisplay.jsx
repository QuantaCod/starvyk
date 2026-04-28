import styles from './RichTextDisplay.module.css'

export default function RichTextDisplay({ html, className = '' }) {
  if (!html) return null
  return (
    <div
      className={`${styles.content} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}