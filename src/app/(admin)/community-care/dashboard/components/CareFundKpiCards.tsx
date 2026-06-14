import { Row, Col, Card } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import type { CareFundDashboard } from '@/types/bpa.types'

interface Props {
  data: CareFundDashboard
}

function KpiCard({ icon, label, value, variant }: { icon: string; label: string; value: string | number; variant: string }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex align-items-center gap-3">
          <div className={`avatar-md bg-soft-${variant} rounded d-flex align-items-center justify-content-center`}>
            <Icon icon={icon} width={28} className={`text-${variant}`} />
          </div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="fw-bold fs-4">{value}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default function CareFundKpiCards({ data }: Props) {
  const amountFormatted = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(data.totalAmountBdt)

  return (
    <Row className="g-3">
      <Col sm={6} xl={3}>
        <KpiCard icon="solar:users-group-rounded-bold-duotone" label="Total Contributors" value={data.totalContributors} variant="primary" />
      </Col>
      <Col sm={6} xl={3}>
        <KpiCard icon="solar:hand-money-bold-duotone" label="Total Collected" value={amountFormatted} variant="success" />
      </Col>
      <Col sm={6} xl={3}>
        <KpiCard icon="solar:card-2-bold-duotone" label="Active Cards" value={`${data.totalActiveCards} / ${data.totalCards}`} variant="info" />
      </Col>
      <Col sm={6} xl={3}>
        <KpiCard icon="solar:cat-bold-duotone" label="Census Submissions" value={data.totalCensusSubmissions} variant="warning" />
      </Col>
    </Row>
  )
}
