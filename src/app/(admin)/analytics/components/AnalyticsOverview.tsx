'use client'

import { useState, useCallback, useEffect } from 'react'
import { Row, Col, ButtonGroup, Button, Card, Form, InputGroup, Nav, Spinner } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApi } from '@/hooks/useApi'
import { analyticsApi, type AnalyticsPeriod } from '@/lib/api/analytics.api'
import type { ApiError } from '@/lib/api'

import OverviewTrafficTab from './OverviewTrafficTab'
import OperationsTab from './OperationsTab'
import FinancialsSupportTab from './FinancialsSupportTab'
import ConversionFunnelTab from './ConversionFunnelTab'
import LiveControlTab from './LiveControlTab'

const PERIODS: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7 Days', value: 'last7d' },
  { label: '30 Days', value: 'last30d' },
  { label: 'This Month', value: 'thisMonth' },
]

type ActiveTab = 'overview' | 'operations' | 'financials' | 'conversions' | 'live'

export default function AnalyticsOverview() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [period, setPeriod] = useState<AnalyticsPeriod>('last30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  // Params helper
  const getParams = useCallback(() => {
    return useCustom && customFrom && customTo
      ? { range: 'custom' as const, from: customFrom, to: customTo }
      : { range: period }
  }, [period, useCustom, customFrom, customTo])

  // Endpoints getters
  const overviewFn = useCallback(() => analyticsApi.overview(getParams()), [getParams])
  const trafficFn = useCallback(() => analyticsApi.traffic(getParams()), [getParams])
  const revenueFn = useCallback(() => analyticsApi.revenue(getParams()), [getParams])
  const membershipFn = useCallback(() => analyticsApi.membership(getParams()), [getParams])
  const campaignsFn = useCallback(() => analyticsApi.campaigns(getParams()), [getParams])
  const donationsFn = useCallback(() => analyticsApi.donations(getParams()), [getParams])
  const petCensusFn = useCallback(() => analyticsApi.petCensus(getParams()), [getParams])
  const supportFn = useCallback(() => analyticsApi.support(getParams()), [getParams])
  const conversionsFn = useCallback(() => analyticsApi.conversions(getParams()), [getParams])
  const liveFn = useCallback(() => analyticsApi.live(), [])

  // Hook dependencies
  const paramsDeps = [period, useCustom, customFrom, customTo] as const

  // Hooks (conditionally fetched depending on current active tab to optimize load)
  const isOverview = activeTab === 'overview'
  const isOps = activeTab === 'operations'
  const isFinancials = activeTab === 'financials'
  const isConversions = activeTab === 'conversions'
  const isLive = activeTab === 'live'

  const { data: overview, loading: overviewLoading, error: overviewErr, refetch: refetchOverview } = useApi(
    isOverview ? overviewFn : null,
    [isOverview, ...paramsDeps],
  )
  const { data: traffic, loading: trafficLoading, error: trafficErr, refetch: refetchTraffic } = useApi(
    isOverview ? trafficFn : null,
    [isOverview, ...paramsDeps],
  )

  const { data: membership, loading: memLoading, refetch: refetchMem } = useApi(
    isOps ? membershipFn : null,
    [isOps, ...paramsDeps],
  )
  const { data: campaigns, loading: campLoading, refetch: refetchCamp } = useApi(
    isOps ? campaignsFn : null,
    [isOps, ...paramsDeps],
  )
  const { data: petCensus, loading: censusLoading, refetch: refetchCensus } = useApi(
    isOps ? petCensusFn : null,
    [isOps, ...paramsDeps],
  )

  const { data: revenue, loading: revLoading, refetch: refetchRev } = useApi(
    isFinancials ? revenueFn : null,
    [isFinancials, ...paramsDeps],
  )
  const { data: support, loading: supLoading, refetch: refetchSup } = useApi(
    isFinancials ? supportFn : null,
    [isFinancials, ...paramsDeps],
  )

  const { data: conversions, loading: convLoading, refetch: refetchConv } = useApi(
    isConversions ? conversionsFn : null,
    [isConversions, ...paramsDeps],
  )

  const { data: live, loading: liveLoading, refetch: refetchLive } = useApi(
    isLive ? liveFn : null,
    [isLive],
  )

  // Real-time automatic polling loop for Live tab (30s)
  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(() => {
      refetchLive()
    }, 30000)
    return () => clearInterval(timer)
  }, [isLive, refetchLive])

  const applyCustomRange = () => {
    if (customFrom && customTo) setUseCustom(true)
  }
  const clearCustom = () => {
    setUseCustom(false)
    setCustomFrom('')
    setCustomTo('')
  }

  const handleRefresh = () => {
    if (isOverview) {
      refetchOverview()
      refetchTraffic()
    } else if (isOps) {
      refetchMem()
      refetchCamp()
      refetchCensus()
    } else if (isFinancials) {
      refetchRev()
      refetchSup()
    } else if (isConversions) {
      refetchConv()
    } else if (isLive) {
      refetchLive()
    }
  }

  const handleExport = () => {
    let headers: string[] = []
    let rows: string[][] = []
    const filename = `bpa_analytics_${activeTab}_${useCustom ? 'custom' : period}.csv`

    if (activeTab === 'overview' && traffic) {
      headers = ['Date', 'Page Views', 'Unique Visitors']
      rows = traffic.trafficPoints.map((p) => [p.date, String(p.pageViews), String(p.uniqueVisitors)])
    } else if (activeTab === 'operations' && membership) {
      headers = ['Date', 'Membership Count']
      rows = membership.membershipPoints.map((p) => [p.date, String(p.count)])
    } else if (activeTab === 'financials' && revenue) {
      headers = ['Date', 'Settled Revenue Amount BDT']
      rows = revenue.revenuePoints.map((p) => [p.date, String(p.amount)])
    } else {
      headers = ['Report Timestamp', 'Category Tab']
      rows = [[new Date().toISOString(), activeTab]]
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const errorObj = (overviewErr || trafficErr) as ApiError | null
  const isLoading = overviewLoading || trafficLoading || memLoading || campLoading || censusLoading || revLoading || supLoading || convLoading || liveLoading

  return (
    <div className="container-fluid py-3">
      {/* Title Header Section */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">BPA Analytics</h4>
          <p className="text-muted small mb-0">Enterprise-level operations command metrics and visitor traffic dashboard.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1" onClick={handleExport} disabled={isLoading}>
            <Icon icon="solar:download-minimalistic-bold-duotone" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" className="d-flex align-items-center gap-1" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : <Icon icon="solar:refresh-bold-duotone" />}
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <ApiErrorAlert error={errorObj} />

      {/* Date Picker / Range Controller */}
      {!isLive && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="py-2">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <ButtonGroup size="sm">
                {PERIODS.map((p) => (
                  <Button
                    key={p.value}
                    variant={!useCustom && period === p.value ? 'primary' : 'outline-secondary'}
                    onClick={() => {
                      setPeriod(p.value)
                      setUseCustom(false)
                    }}
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
                <Button
                  size="sm"
                  variant={useCustom ? 'primary' : 'outline-primary'}
                  onClick={applyCustomRange}
                  disabled={!customFrom || !customTo}
                >
                  Apply Custom Range
                </Button>
                {useCustom && (
                  <Button size="sm" variant="outline-secondary" onClick={clearCustom}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Tabs Navigation Bar */}
      <Nav variant="tabs" className="mb-4 border-bottom border-light">
        <Nav.Item>
          <Nav.Link active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 cursor-pointer">
            <Icon icon="solar:chart-square-bold-duotone" />
            <span>Overview & Traffic</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 cursor-pointer">
            <Icon icon="solar:cup-bold-duotone" />
            <span>Operations Hub</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 cursor-pointer">
            <Icon icon="solar:banknote-bold-duotone" />
            <span>Financials & Support</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'conversions'} onClick={() => setActiveTab('conversions')} className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 cursor-pointer">
            <Icon icon="solar:filter-bold-duotone" />
            <span>Conversion Funnels</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'live'} onClick={() => setActiveTab('live')} className="d-flex align-items-center gap-2 fw-semibold px-3 py-2 cursor-pointer">
            <span className="live-dot bg-success rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block' }} />
            <span>Live Control Room</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Panels content wrapper */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTrafficTab overview={overview} traffic={traffic} loading={isLoading} />
        )}
        {activeTab === 'operations' && (
          <OperationsTab membership={membership} campaigns={campaigns} petCensus={petCensus} loading={isLoading} />
        )}
        {activeTab === 'financials' && (
          <FinancialsSupportTab revenue={revenue} support={support} loading={isLoading} />
        )}
        {activeTab === 'conversions' && (
          <ConversionFunnelTab conversions={conversions} loading={isLoading} />
        )}
        {activeTab === 'live' && (
          <LiveControlTab liveData={live} loading={isLoading} />
        )}
      </div>

      <style jsx global>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .live-dot {
          animation: blink-dot 1.5s infinite;
        }
        @keyframes blink-dot {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
