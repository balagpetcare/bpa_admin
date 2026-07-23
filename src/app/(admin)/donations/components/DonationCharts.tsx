'use client'

import dynamic from 'next/dynamic'
import { Row, Col, Card, Table } from 'react-bootstrap'
import type { ApexOptions } from 'apexcharts'
import type { DonationDashboardStats } from '@/lib/api/donations.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

function MonthlyTrendChart({ data }: { data: { month: string; total: number; count: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'area', height: 280, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05 } },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { fontSize: '11px', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { min: 0, axisBorder: { show: false }, labels: { formatter: (v) => `৳${(v / 1000).toFixed(0)}k` } },
    grid: { strokeDashArray: 3, borderColor: '#f1f1f1' },
    colors: ['#1a6b3c', '#4ecac2'],
    tooltip: { shared: true, y: { formatter: (v) => `৳${v.toLocaleString()}` } },
    dataLabels: { enabled: false },
    legend: { show: true, horizontalAlign: 'center', position: 'top' },
  }
  const series = [
    { name: 'Amount (BDT)', data: data.map((d) => d.total) },
    { name: 'Donations Count', data: data.map((d) => d.count) },
  ]
  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Monthly Donation Trend</h5>
      </Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">No monthly data yet.</div>
        ) : (
          <ReactApexChart options={options} series={series} type="area" height={280} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  )
}

function PurposeChart({ data }: { data: { titleEn: string; total: number; count: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'donut', height: 260 },
    labels: data.map((d) => d.titleEn),
    colors: ['#1a6b3c', '#4ecac2', '#f4a261', '#e76f51', '#2a9d8f', '#6c757d'],
    legend: { position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `৳${v.toLocaleString()}` } },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Purpose Allocation</h5>
      </Card.Header>
      <Card.Body className="d-flex align-items-center justify-content-center">
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">No data yet.</div>
        ) : (
          <ReactApexChart options={options} series={data.map((d) => d.total)} type="donut" height={260} className="apex-charts w-100" />
        )}
      </Card.Body>
    </Card>
  )
}

function StatusBreakdownChart({ data }: { data: { status: string; count: number; amount: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'donut', height: 260 },
    labels: data.map((d) => d.status.toUpperCase().replace('_', ' ')),
    colors: ['#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6c757d', '#17a2b8'],
    legend: { position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `${v} txns` } },
    plotOptions: { pie: { donut: { size: '65%' } } },
  }
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Donation Statuses</h5>
      </Card.Header>
      <Card.Body className="d-flex align-items-center justify-content-center">
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">No status breakdown data.</div>
        ) : (
          <ReactApexChart options={options} series={data.map((d) => d.count)} type="donut" height={260} className="apex-charts w-100" />
        )}
      </Card.Body>
    </Card>
  )
}

function PaymentMethodChart({ data }: { data: { method: string; count: number; amount: number }[] }) {
  const options: ApexOptions = {
    chart: { type: 'bar', height: 260, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 4,
      },
    },
    colors: ['#4ecac2'],
    dataLabels: { enabled: true, formatter: (val) => `৳${Number(val).toLocaleString()}` },
    xaxis: {
      categories: data.map((d) => d.method),
      labels: { show: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontWeight: 600 } },
    },
    grid: { strokeDashArray: 3, borderColor: '#f1f1f1' },
    tooltip: { y: { formatter: (v) => `৳${v.toLocaleString()}` } },
  }
  const series = [
    {
      name: 'Amount Raised',
      data: data.map((d) => d.amount),
    },
  ]
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Payment Methods</h5>
      </Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">No method statistics yet.</div>
        ) : (
          <ReactApexChart options={options} series={series} type="bar" height={260} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  )
}

function CampaignTable({ data }: { data: { titleEn: string; total: number; count: number }[] }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Campaign Allocation</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {data.length === 0 ? (
          <p className="text-muted text-center py-5 mb-0">No active campaigns data.</p>
        ) : (
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-3">Campaign</th>
                  <th className="text-end">Donations</th>
                  <th className="text-end pe-3">Total Raised</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.titleEn} className="border-bottom border-light">
                    <td className="ps-3 fw-semibold text-dark small">{r.titleEn}</td>
                    <td className="text-end text-muted small">{r.count}</td>
                    <td className="text-end text-success fw-bold pe-3">৳{r.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

function CountryTable({ data }: { data: { country: string; count: number }[] }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-transparent border-light py-3">
        <h5 className="mb-0 fw-bold text-dark">Geographic Donors</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {data.length === 0 ? (
          <p className="text-muted text-center py-5 mb-0">No country statistics.</p>
        ) : (
          <div className="table-responsive">
            <Table hover className="table-centered align-middle mb-0 text-nowrap table-borderless">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-3">Country</th>
                  <th className="text-end pe-3">Total Donors</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((r) => (
                  <tr key={r.country} className="border-bottom border-light">
                    <td className="ps-3 fw-semibold text-dark small">{r.country || 'Unknown'}</td>
                    <td className="text-end fw-bold text-dark pe-3">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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
  const methods = stats.paymentMethodBreakdown ?? []
  const statuses = stats.donationStatusBreakdown ?? []

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
          <PaymentMethodChart data={methods} />
        </Col>
        <Col xs={12} md={6}>
          <StatusBreakdownChart data={statuses} />
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
