import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'
import styles from './RichTextEditorTinyMCE.module.css'

export default function RichTextEditorTinyMCE({ value, onChange, placeholder = 'Start writing...' }) {
  const editorRef = useRef(null)

  const handleEditorChange = (content, editor) => {
    onChange(content)
  }

  return (
    <div className={styles.editorContainer}>
      <Editor
        apiKey="no-api-key" // Using TinyMCE free version
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'paste',
            'directionality', 'visualchars', 'template', 'codesample', 'hr',
            'pagebreak', 'nonbreaking', 'toc', 'imagetools', 'textpattern',
            'noneditable', 'charmap', 'quickbars', 'emoticons', 'advtable'
          ],
          toolbar1: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
          toolbar2: 'table | link image media | code codesample | preview fullscreen | help',
          table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
          table_appearance_options: true,
          table_grid: true,
          table_tab_navigation: true,
          table_default_attributes: {
            border: '1',
            cellpadding: '0',
            cellspacing: '0',
            role: 'presentation',
            style: 'border-collapse: collapse; width: 100%;'
          },
          table_default_styles: {
            width: '100%',
            'border-collapse': 'collapse'
          },
          table_responsive_width: true,
          table_sizing_mode: 'responsive',
          paste_data_images: true,
          paste_word_valid_elements: "b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a[href],span,color,font-size,font-color,font-family,mark,table,tr,td,th,tbody,thead,tfoot",
          paste_retain_style_properties: "all",
          paste_merge_formats: true,
          smart_paste: true,
          paste_postprocess: (plugin, args) => {
            // Clean up pasted content
            args.node.innerHTML = args.node.innerHTML.replace(/mso-[^;]+;?/gi, '')
          },
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: var(--text-primary, #333);
              margin: 8px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 18px 0;
            }
            th, td {
              border: 1px solid var(--border, #ddd);
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: var(--bg-elevated, #f8f9fa);
              font-weight: 700;
              color: var(--text-primary, #333);
            }
            td {
              background: var(--bg-primary, #fff);
              color: var(--text-secondary, #666);
            }
            tr:nth-child(even) td {
              background: var(--bg-card, #f8f9fa);
            }
            .mce-content-body table td,
            .mce-content-body table th {
              border: 1px solid var(--border, #ddd);
            }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          contextmenu: 'link image table configurepermanentpen',
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
          quickbars_insert_toolbar: 'quickimage quicktable',
          toolbar_mode: 'sliding',
          resize: false,
          statusbar: false,
          elementpath: false,
          browser_spellcheck: true,
          contextmenu_never_use_native: true,
          table_clone_elements: false,
          table_header_type: 'sectionCells',
          table_resize_bars: true,
          object_resizing: 'table',
          table_advtab: true,
          table_cell_advtab: true,
          table_row_advtab: true,
          advtable_value_series: true,
          table_use_colgroups: false
        }}
      />

      <div className={styles.footer}>
        <span className={styles.hint}>
          Tip: Use the table button to create tables. Right-click cells for advanced options. Paste from Word/Excel supported.
        </span>
        <span className={styles.wordCount}>
          {value ? value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0} words
        </span>
      </div>
    </div>
  )
}