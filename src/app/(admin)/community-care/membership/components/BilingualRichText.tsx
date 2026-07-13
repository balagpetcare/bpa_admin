'use client'

import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

const formats = ['bold', 'italic', 'underline', 'list', 'link']

interface Props {
  labelEn: string
  labelBn: string
  valueEn: string
  valueBn: string
  onChangeEn: (val: string) => void
  onChangeBn: (val: string) => void
}

export default function BilingualRichText({
  labelEn,
  labelBn,
  valueEn,
  valueBn,
  onChangeEn,
  onChangeBn,
}: Props) {
  return (
    <Row className="g-3 mb-4">
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold">{labelEn}</Form.Label>
          <ReactQuill
            theme="snow"
            value={valueEn}
            onChange={onChangeEn}
            modules={modules}
            formats={formats}
            style={{ minHeight: '160px' }}
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold">{labelBn}</Form.Label>
          <ReactQuill
            theme="snow"
            value={valueBn}
            onChange={onChangeBn}
            modules={modules}
            formats={formats}
            style={{ minHeight: '160px' }}
          />
        </Form.Group>
      </Col>
    </Row>
  )
}
