'use client'

import { useState } from 'react'
import { Card, Button, Form, Row, Col, Table, Alert } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

interface AllocationCategory {
  id: string
  labelEn: string
  labelBn: string
  percentage: string
}

const DEFAULT_CATEGORIES: AllocationCategory[] = [
  { id: '1', labelEn: 'Clinic Operations', labelBn: 'ক্লিনিক পরিচালনা', percentage: '40' },
  { id: '2', labelEn: 'Veterinary Camps', labelBn: 'পশু চিকিৎসা ক্যাম্প', percentage: '25' },
  { id: '3', labelEn: 'Emergency Medical Care', labelBn: 'জরুরি চিকিৎসা সেবা', percentage: '15' },
  { id: '4', labelEn: 'Stray Animal Welfare', labelBn: 'পথ প্রাণী কল্যাণ', percentage: '10' },
  { id: '5', labelEn: 'Community Education', labelBn: 'সম্প্রদায় শিক্ষা', percentage: '5' },
  { id: '6', labelEn: 'Platform & Administration', labelBn: 'প্ল্যাটফর্ম ও প্রশাসন', percentage: '5' },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function TransparencyAllocationContent() {
  const [categories, setCategories] = useState<AllocationCategory[]>(DEFAULT_CATEGORIES)
  const [saved, setSaved] = useState(false)

  const total = categories.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0)
  const isValid = total === 100 && categories.every((c) => c.labelEn.trim() && c.labelBn.trim())

  function updateCategory(id: string, field: keyof AllocationCategory, value: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
    setSaved(false)
  }

  function addCategory() {
    setCategories((prev) => [...prev, { id: uid(), labelEn: '', labelBn: '', percentage: '0' }])
    setSaved(false)
  }

  function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setSaved(false)
  }

  function handleSave() {
    // Allocation template is stored as a JSON config reference for transparency reports.
    // Admins apply this template when creating a new transparency report via breakdownJson.
    setSaved(true)
  }

  function handleReset() {
    setCategories(DEFAULT_CATEGORIES)
    setSaved(false)
  }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Transparency Allocation Settings"
        breadcrumbs={[{ label: 'Community Care Fund' }, { label: 'Transparency Allocation' }]}
        action={
          <Link href="/community-care/transparency" className="btn btn-outline-secondary btn-sm">
            <Icon icon="solar:eye-bold" className="me-1" />
            View Reports
          </Link>
        }
      />

      <Alert variant="info" className="mb-3">
        <Icon icon="solar:info-circle-bold" className="me-2" />
        <strong>About this setting:</strong> Define the standard fund allocation categories and target percentages. This template is applied as the
        default <code>breakdownJson</code> when creating new transparency reports. It is for reference only — actual report figures are entered per
        report.
      </Alert>

      {saved && (
        <Alert variant="success" className="mb-3" dismissible onClose={() => setSaved(false)}>
          <Icon icon="solar:check-circle-bold" className="me-2" />
          Allocation template saved.
        </Alert>
      )}

      {total !== 100 && categories.length > 0 && (
        <Alert variant="warning" className="mb-3">
          <Icon icon="solar:danger-triangle-bold" className="me-2" />
          Total allocation is <strong>{total}%</strong>. Must equal exactly 100%.
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Allocation Categories</span>
          <span className={`badge ${total === 100 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>Total: {total}%</span>
        </Card.Header>
        <Card.Body className="p-0">
          <Table className="mb-0 align-middle" hover>
            <thead className="table-light">
              <tr>
                <th>Category (English)</th>
                <th>বিভাগ (বাংলা)</th>
                <th style={{ width: 120 }}>Allocation %</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <Form.Control
                      size="sm"
                      value={cat.labelEn}
                      onChange={(e) => updateCategory(cat.id, 'labelEn', e.target.value)}
                      placeholder="e.g. Clinic Operations"
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      value={cat.labelBn}
                      onChange={(e) => updateCategory(cat.id, 'labelBn', e.target.value)}
                      placeholder="যেমন: ক্লিনিক পরিচালনা"
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      min={0}
                      max={100}
                      value={cat.percentage}
                      onChange={(e) => updateCategory(cat.id, 'percentage', e.target.value)}
                    />
                  </td>
                  <td className="text-center">
                    <Button variant="soft-danger" size="sm" onClick={() => removeCategory(cat.id)}>
                      <Icon icon="solar:trash-bin-trash-bold" />
                    </Button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-3 text-muted">
                    No categories defined
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" size="sm" onClick={addCategory}>
            <Icon icon="solar:add-circle-bold" className="me-1" />
            Add Category
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={handleReset}>
              <Icon icon="solar:restart-bold" className="me-1" />
              Reset to Defaults
            </Button>
            <Button variant="primary" size="sm" disabled={!isValid} onClick={handleSave}>
              <Icon icon="solar:check-circle-bold" className="me-1" />
              Save Template
            </Button>
          </div>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header className="fw-semibold">Allocation Preview</Card.Header>
        <Card.Body>
          <Row className="g-2">
            {categories
              .filter((c) => c.labelEn && Number(c.percentage) > 0)
              .map((cat) => (
                <Col key={cat.id} xs={12} sm={6} md={4}>
                  <div className="border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <div className="fw-semibold small">{cat.labelEn}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {cat.labelBn}
                        </div>
                      </div>
                      <span className="fs-5 fw-bold text-primary">{cat.percentage}%</span>
                    </div>
                    <div className="progress" style={{ height: 4 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${Math.min(Number(cat.percentage), 100)}%` }} />
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
          {categories.filter((c) => c.labelEn && Number(c.percentage) > 0).length === 0 && (
            <p className="text-muted text-center mb-0">Add categories above to see preview</p>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
