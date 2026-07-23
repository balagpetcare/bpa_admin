'use client'

import { Form } from 'react-bootstrap'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
}

const formats = ['header', 'bold', 'italic', 'underline', 'list', 'blockquote', 'link']

export default function MembershipHtmlEditor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} style={{ minHeight: 220 }} />
    </Form.Group>
  )
}
