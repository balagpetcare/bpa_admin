'use client'

import dynamic from 'next/dynamic'
import { Row, Col, Card, Table } from 'react-bootstrap'
import type { ApexOptions } from 'apexcharts'
import type { DonationDashboardStats } from '@/lib/api/donations.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

function MonthlyTrendChart({ data }: { data: { month: string; total: number; count: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'area', height: 260, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: { categories: data.map((d) => d.month), labels: { rotate: -30, style: { fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, axisBorder: { show: false }, labels: { formatter: (v) => `৳${(v / 1000).toFixed(0)}k` } },
    grid: { strokeDashArray: 3 },
    colors: ['#1a6b3c', '#4ecac2'],
    tooltip: { shared: true, y: { formatter: (v) => `৳${v.toLocaleString()}` } },
    dataLabels: { enabled: false },
    legend: { show: true, horizontalAlign: 'center' },
  }
  const series = [
    { name: 'Amount (BDT)', data: data.map((d) => d.total) },
    { name: 'Donations', data: data.map((d) => d.count) },
  ]
  return (
    <Card>
      <Card.Header><h5 className="mb-0">Monthly Trend</h5></Card.Header>
      <Card.Body>
        {data.length === 0
          ? <div className="text-center text-muted py-5">No monthly data yet.</div>
          : <ReactApexChart options={options} series={series} type="area" height={260} className="apex-charts" />
        }
      </Card.Body>
    </Card>
  )
}

function PurposeChart({ data }: { data: { titleEn: string; total: number; count: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'donut', height: 260 },
    labels: data.map((d) => d.titleEn),
    colors: ['#1a6b3c', '#2a9d5c', '#4ecac2', '#1a2540', '#6c757d', '#f4a261'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `৳${v.toLocaleString()}` } },
    plotOptions: { pie: { donut: { size: '60%' } } },
  }
  return (
    <Card className="h-100">
      <Card.Header><h5 className="mb-0">Purpose-wise Raised</h5></Card.Header>
      <Card.Body>
        {data.length === 0
          ? <div className="text-center text-muted py-5">No data yet.</div>
          : <ReactApexChart options={options} series={data.map((d) => d.total)} type="donut" height={260} className="apex-charts" />
        }
      </Card.Body>
    </Card>
  )
}

function CampaignTable({ data }: { data: { titleEn: string; total: number; count: number }[] }) {
  return (
    <Card className="h-100">
      <Card.Header><h5 className="mb-0">Campaign-wise Raised</h5></Card.Header>
      <Card.Body className="p-0">
        {data.length === 0 ? (
          <p className="text-muted text-center py-5 mb-0">No campaign data yet.</p>
        ) : (
          <Table hover className="table-centered align-middle mb-0 small">
            <thead className="table-light">
              <tr><th>Campaign</th><th className="text-end">Donations</th><th className="text-end">Raised</th></tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.titleEn}>
                  <td className="fw-semibold">{r.titleEn}</td>
                  <td className="text-end">{r.count}</td>
                  <td className="text-end text-success fw-bold">৳{r.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

function CountryTable({ data }: { data: { country: string; count: number }[] }) {
  return (
    <Card className="h-100">
      <Card.Header><h5 className="mb-0">Country-wise Donors</h5></Card.Header>
      <Card.Body className="p-0">
        {data.length === 0 ? (
          <p className="text-muted text-center py-5 mb-0">No country data yet.</p>
        ) : (
          <Table hover className="table-centered align-middle mb-0 small">
            <thead className="table-light">
              <tr><th>Country</th><th className="text-end">Donors</th></tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((r) => (
                <tr key={r.country}>
                  <td>{r.country || 'Unknown'}</td>
                  <td className="text-end fw-bold">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}

export default function DonationCharts({ stats }: { stats: DonationDashboardStats }) {
  const monthly = stats.monthlyTrend ?? []
  const purposes = stats.purposeBreakdown ?? []
  const campaigns = stats.campaignBreakdown ?? []
  const countries = stats.countryBreakdown ?? []

  return (
    <>
      <Row className="g-3 mb-4">
        <Col xs={12}>
          <MonthlyTrendChart data={monthly} />
        </Col>
      </Row>
      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <PurposeChart data={purposes} />
        </Col>
        <Col xs={12} md={6}>
          <CampaignTable data={campaigns} />
        </Col>
      </Row>
      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <CountryTable data={countries} />
        </Col>
      </Row>
    </>
  )
}
