'use client'
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'react-bootstrap'
import type { OffcanvasControlType } from '@/types/context'
import SimplebarReactClient from './SimplebarReactClient'

const ActivityStream = ({ open, toggle }: OffcanvasControlType) => {
  return (
    <div>
      <Offcanvas
        show={open}
        onHide={toggle}
        placement="end"
        className="border-0"
        tabIndex={-1}
        id="theme-activity-offcanvas"
        style={{ maxWidth: 450, width: '100%' }}>
        <OffcanvasHeader closeVariant="white" closeButton className="d-flex align-items-center bg-primary p-3">
          <h5 className="text-white m-0 fw-semibold">Activity Stream</h5>
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimplebarReactClient className="h-100 p-4">
            <h4 className="text-center text-muted mb-3">No Recent Activity</h4>
          </SimplebarReactClient>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  )
}

export default ActivityStream
