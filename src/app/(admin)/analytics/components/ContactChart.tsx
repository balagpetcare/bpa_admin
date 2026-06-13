'use client'

import dynamic from 'next/dynamic'
import { Card } from 'react-bootstrap'
import type { ApexOptions } from 'apexcharts'
import type { FormStats } from '@/lib/api/analytics.api'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function ContactChart({ data, loading }: { data: FormStats | null; loading: boolean }) {
  const options: ApexOptions = {
    chart: { type: 'bar', height: 220, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 4, distributed: true } },
    xaxis: {
      categories: ['Volunteers', 'Contacts', 'Memberships'],
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { min: 0, axisBorder: { show: false } },
    grid: { strokeDashArray: 3, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    colors: ['#f9b931', '#ef5f5f', '#1a6b3c'],
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `${v} submissions` } },
  }

  const series = [{ name: 'Submissions', data: data ? [data.volunteers, data.contacts, data.memberships] : [0, 0, 0] }]

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Form Submissions</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 220 }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <ReactApexChart options={options} series={series} type="bar" height={220} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  )
}
