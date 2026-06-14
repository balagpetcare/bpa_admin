'use client'

import dynamic from 'next/dynamic'
import { Card } from 'react-bootstrap'
import type { ApexOptions } from 'apexcharts'
import type { TrafficPoint } from '@/lib/api/analytics.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function TrafficChart({ data, loading }: { data: TrafficPoint[]; loading: boolean }) {
  const categories = data.map((d) => d.date)
  const pageViews = data.map((d) => d.pageViews)
  const uniqueVisitors = data.map((d) => d.uniqueVisitors)

  const options: ApexOptions = {
    chart: { type: 'area', height: 280, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.45, opacityTo: 0.05 },
    },
    xaxis: {
      categories,
      labels: { rotate: -45, style: { fontSize: '11px' } },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { min: 0, axisBorder: { show: false } },
    grid: { strokeDashArray: 3, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    legend: { show: true, horizontalAlign: 'center' },
    colors: ['#1a6b3c', '#4ecac2'],
    tooltip: { shared: true },
    dataLabels: { enabled: false },
  }

  const series = [
    { name: 'Page Views', data: pageViews },
    { name: 'Unique Visitors', data: uniqueVisitors },
  ]

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Traffic Overview</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 280 }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 280 }}>
            No traffic data available for this period.
          </div>
        ) : (
          <ReactApexChart options={options} series={series} type="area" height={280} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  )
}
