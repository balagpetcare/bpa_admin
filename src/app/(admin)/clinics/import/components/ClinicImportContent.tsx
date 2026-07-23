'use client'

import { useState } from 'react'
import { Card, Button, Table, Badge, Alert, Form, Row } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { clinicsApi, type ClinicImportReport } from '@/lib/api/clinics.api'
import type { ApiError } from '@/lib/api'

const STATUS_BADGE: Record<ClinicImportReport['rows'][number]['status'], { bg: string; text: string }> = {
  inserted: { bg: 'success-subtle', text: 'success' },
  updated: { bg: 'info-subtle', text: 'info' },
  unchanged: { bg: 'secondary-subtle', text: 'secondary' },
  skipped: { bg: 'warning-subtle', text: 'warning' },
  invalid: { bg: 'danger-subtle', text: 'danger' },
}

export default function ClinicImportContent() {
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<ClinicImportReport | null>(null)
  const { mutate, loading, error } = useApiMutation<ClinicImportReport, void>()

  async function runImport(commit: boolean) {
    if (!file) return
    const result = await mutate(() => clinicsApi.import.run(file, commit), undefined)
    if (result) setReport(result)
  }

  return (
    <div className="container-fluid">
      <PageHeader title="Import Clinic Directory" breadcrumbs={[{ label: 'Clinic Directory' }, { label: 'Import' }]} />
      <ApiErrorAlert error={error as ApiError | null} />

      <Card className="mb-3">
        <Card.Body>
          <Form.Group>
            <input
              type="file"
              accept=".xlsx"
              className="form-control"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setReport(null)
              }}
            />
          </Form.Group>
          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-primary" disabled={!file || loading} onClick={() => runImport(false)}>
              <Icon icon="solar:eye-bold" className="me-1" />
              Preview (dry run)
            </Button>
            <Button variant="danger" disabled={!file || loading || !report} onClick={() => runImport(true)}>
              <Icon icon="solar:check-circle-bold" className="me-1" />
              Commit import
            </Button>
          </div>
          <div className="small text-muted mt-2">
            Preview first — nothing is written until you click &ldquo;Commit import&rdquo;. Re-running the same workbook is safe: rows already
            imported show as &ldquo;unchanged&rdquo; rather than being duplicated.
          </div>
        </Card.Body>
      </Card>

      {report && (
        <>
          <Alert variant={report.committed ? 'success' : 'info'}>
            {report.committed ? 'Import committed.' : 'Preview only — no data was written.'} {report.totalRows} rows read.
          </Alert>
          <Row>
            <SummaryCard label="Inserted" value={report.inserted} variant="success" />
            <SummaryCard label="Updated" value={report.updated} variant="info" />
            <SummaryCard label="Unchanged" value={report.unchanged} variant="secondary" />
            <SummaryCard label="Skipped" value={report.skipped} variant="warning" />
            <SummaryCard label="Invalid" value={report.invalid} variant="danger" />
          </Row>

          {report.rows.some((r) => r.status === 'invalid' || r.status === 'skipped') && (
            <Card className="mt-3">
              <Card.Header className="fw-semibold">Rows needing attention</Card.Header>
              <Card.Body>
                <Table size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Clinic</th>
                      <th>Area</th>
                      <th>Status</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows
                      .filter((r) => r.status === 'invalid' || r.status === 'skipped')
                      .map((r) => (
                        <tr key={`${r.rowNumber}-${r.importKey}`}>
                          <td>{r.rowNumber}</td>
                          <td>{r.clinicName ?? '—'}</td>
                          <td>{r.branchArea ?? '—'}</td>
                          <td>
                            <Badge bg={STATUS_BADGE[r.status].bg} text={STATUS_BADGE[r.status].text}>
                              {r.status}
                            </Badge>
                          </td>
                          <td className="small text-muted">{r.reason ?? ''}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, variant }: { label: string; value: number; variant: string }) {
  return (
    <div className="col">
      <Card className={`border-${variant}`}>
        <Card.Body className="text-center py-3">
          <div className={`fs-3 fw-bold text-${variant}`}>{value}</div>
          <div className="small text-muted">{label}</div>
        </Card.Body>
      </Card>
    </div>
  )
}

