'use client'

import { useState, useCallback } from 'react'
import { Row, Col, ButtonGroup, Button, Card, Form, InputGroup } from 'react-bootstrap'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import AnalyticsKpiCards from './AnalyticsKpiCards'
import TrafficChart from './TrafficChart'
import ContactChart from './ContactChart'
import VolunteerChart from './VolunteerChart'
import TopPagesTable from './TopPagesTable'
import { useApi } from '@/hooks/useApi'
import { analyticsApi, type AnalyticsPeriod } from '@/lib/api/analytics.api'
import type { ApiError } from '@/lib/api'

const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year',  value: '1y' },
]

export default function AnalyticsOverview() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const summaryFn = useCallback(() => analyticsApi.summary(), [])
  const trafficFn = useCallback(
    () => analyticsApi.traffic(useCustom && customFrom && customTo ? { from: customFrom, to: customTo } : { period }),
    [period, useCustom, customFrom, customTo],
  )
  const formsFn = useCallback(
    () => analyticsApi.forms(useCustom && customFrom && customTo ? { from: customFrom, to: customTo } : { period }),
    [period, useCustom, customFrom, customTo],
  )

  const deps = [period, useCustom, customFrom, customTo] as const

  const { data: summary, loading: sumLoading, error: sumError } = useApi(summaryFn, [])
  const { data: traffic, loading: trafficLoading } = useApi(trafficFn, [...deps])
  const { data: forms, loading: formsLoading } = useApi(formsFn, [...deps])

  const emptyAnalyticsSummary = {
    totalUsers: 0, totalNews: 0, totalEvents: 0, totalVolunteers: 0,
    totalContacts: 0, totalMedia: 0, pendingVolunteers: 0, unreadContacts: 0, totalPayments: 0,
  }

  const applyCustomRange = () => {
    if (customFrom && customTo) setUseCustom(true)
  }
  const clearCustom = () => { setUseCustom(false); setCustomFrom(''); setCustomTo('') }

  return (
    <div className="container-fluid">
      <PageHeader
        title="Analytics"
        breadcrumbs={[{ label: 'Analytics' }]}
      />

      <ApiErrorAlert error={sumError as ApiError | null} />

      <AnalyticsKpiCards summary={sumLoading ? emptyAnalyticsSummary : (summary ?? emptyAnalyticsSummary)} />

      {/* Period Selector */}
      <Card className="mb-4">
        <Card.Body className="py-2">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <ButtonGroup size="sm">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={!useCustom && period === p.value ? 'primary' : 'outline-secondary'}
                  onClick={() => { setPeriod(p.value); setUseCustom(false) }}
                >
                  {p.label}
                </Button>
              ))}
            </ButtonGroup>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <InputGroup size="sm">
                <InputGroup.Text>From</InputGroup.Text>
                <Form.Control type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </InputGroup>
              <InputGroup size="sm">
                <InputGroup.Text>To</InputGroup.Text>
                <Form.Control type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </InputGroup>
              <Button size="sm" variant={useCustom ? 'primary' : 'outline-primary'} onClick={applyCustomRange} disabled={!customFrom || !customTo}>
                Apply
              </Button>
              {useCustom && (
                <Button size="sm" variant="outline-secondary" onClick={clearCustom}>Clear</Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col xs={12}>
          <TrafficChart data={traffic ?? []} loading={trafficLoading} />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xl={6}>
          <ContactChart data={forms ?? null} loading={formsLoading} />
        </Col>
        <Col xl={6}>
          <VolunteerChart summary={summary ?? null} loading={sumLoading} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12}>
          <TopPagesTable data={traffic ?? []} loading={trafficLoading} />
        </Col>
      </Row>
    </div>
  )
}
