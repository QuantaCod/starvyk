import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link as LinkIcon, Link2Off,
  Minus, Undo, Redo, AlignLeft, AlignCenter,
  AlignRight, Type, Table as TableIcon,
  Plus, Minus as MinusIcon, Columns, Rows
} from 'lucide-react'
import { useCallback } from 'react'
import styles from './RichTextEditor.module.css'

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList:   { keepMarks: true },
        orderedList:  { keepMarks: true },
        heading:      { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'rte-link',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'rte-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    // Accept pasted HTML — critical for HTML support
    editorProps: {
      attributes: { class: styles.editorBody },
      handlePaste: (view, event) => {
        // Allow normal HTML paste — tiptap handles it
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url  = window.prompt('Enter link URL:', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const href = url.startsWith('http') ? url : `https://${url}`
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }, [editor])

  if (!editor) return null

  const Btn = ({ onClick, active, disabled, title, children }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`${styles.toolBtn} ${active ? styles.active : ''}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )

  const Divider = () => <div className={styles.divider} />

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>

        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={13} /></Btn>

        <Divider />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <span className={styles.textBtn}>H1</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <span className={styles.textBtn}>H2</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <span className={styles.textBtn}>H3</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">
          <Type size={13} />
        </Btn>

        <Divider />

        {/* Inline formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={13} /></Btn>

        <Divider />

        {/* Lists & blocks */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={13} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <span className={styles.textBtn}>{ }</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table"><TableIcon size={13} /></Btn>

        {/* Table manipulation buttons - only show when table is active */}
        {editor.isActive('table') && (
          <>
            <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column before"><Columns size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after"><Plus size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column"><MinusIcon size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row before"><Rows size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after"><Plus size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row"><MinusIcon size={13} /></Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table"><MinusIcon size={13} /></Btn>
          </>
        )}

        <Divider />

        {/* Link */}
        <Btn onClick={setLink} active={editor.isActive('link')} title="Add / edit link"><LinkIcon size={13} /></Btn>
        {editor.isActive('link') && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link"><Link2Off size={13} /></Btn>
        )}

        <Divider />

        {/* Horizontal rule */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal divider"><Minus size={13} /></Btn>

        {/* Clear formatting */}
        <Btn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear all formatting"
        >
          <span className={styles.textBtn}>Tx</span>
        </Btn>

      </div>

      <EditorContent editor={editor} className={styles.editorWrap} />

      <div className={styles.footer}>
        <span className={styles.hint}>
          Tip: Paste formatted content from Word or web pages — formatting is preserved
        </span>
        <span className={styles.wordCount}>
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  )
}