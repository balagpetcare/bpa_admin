'use client'

import { useEffect, useRef } from 'react'
import { Form } from 'react-bootstrap'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// SSR=false required: Quill accesses `document` at module load
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
}

const FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'indent', 'blockquote', 'code-block',
  'link', 'image', 'align',
]

interface NewsBodyEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
  label?: string
}

export default function NewsBodyEditor({ value, onChange, error, label = 'Body' }: NewsBodyEditorProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <div className={error ? 'is-invalid' : ''}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={TOOLBAR_MODULES}
          formats={FORMATS}
          style={{ minHeight: 320 }}
        />
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  )
}
