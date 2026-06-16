import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'

const Notifications = () => {
  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button position-relative content-none"
        id="page-header-notifications-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <IconifyIcon icon="solar:bell-bing-bold-duotone" className="fs-24 align-middle" />
      </DropdownToggle>
      <DropdownMenu className="py-0 dropdown-lg dropdown-menu-end" aria-labelledby="page-header-notifications-dropdown">
        <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
          <Row className="align-items-center">
            <div className="col">
              <h6 className="m-0 fs-16 fw-semibold">Notifications</h6>
            </div>
          </Row>
        </div>
        <div className="text-center py-4 text-muted">
          <IconifyIcon icon="solar:bell-off-bold-duotone" className="fs-36 mb-2" />
          <p className="mb-0 small">No notifications</p>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default Notifications
