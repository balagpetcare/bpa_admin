'use client'

import dynamic from 'next/dynamic'
import { Card } from 'react-bootstrap'
import type { ApexOptions } from 'apexcharts'
import type { AnalyticsSummary } from '@/types/bpa.types'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function VolunteerChart({ summary, loading }: { summary: AnalyticsSummary | null; loading: boolean }) {
  const total = summary?.totalVolunteers ?? 0
  const pending = summary?.pendingVolunteers ?? 0
  const approved = total > pending ? total - pending : 0

  const options: ApexOptions = {
    chart: { type: 'donut', height: 220 },
    labels: ['Approved/Other', 'Pending'],
    colors: ['#22c55e', '#f9b931'],
    legend: { show: true, position: 'bottom' },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: { show: true, label: 'Total', formatter: () => String(total) },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `${v} volunteers` } },
  }

  const series = [approved, pending]

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Volunteer Status</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 220 }}>
            <div className="spinner-border text-primary" />
          </div>
        ) : total === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 220 }}>
            No volunteer data yet.
          </div>
        ) : (
          <ReactApexChart options={options} series={series} type="donut" height={220} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  )
}
