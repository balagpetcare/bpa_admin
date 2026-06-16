import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardBody, CardTitle, Col } from 'react-bootstrap'

const Orders = () => {
  return (
    <Col>
      <Card>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <CardTitle as={'h4'} className="mb-0">Recent Payments</CardTitle>
            <Link href="/payments" className="btn btn-soft-primary btn-sm">
              View All
            </Link>
          </div>
          <div className="text-center py-5 text-muted">
            <IconifyIcon icon="solar:wallet-bold-duotone" className="fs-48 mb-2" />
            <p className="mb-0">Payment history will appear here.</p>
            <small>Connect the payments API to show recent transactions.</small>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default Orders
