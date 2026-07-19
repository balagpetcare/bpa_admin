'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { signOut, useSession } from 'next-auth/react'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'

const AdminAvatar = ({ name }: { name?: string | null }) => {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'
  return (
    <span
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
      style={{ width: 32, height: 32, background: '#1a6e38', fontSize: 12, flexShrink: 0 }}>
      {initials}
    </span>
  )
}

const ProfileDropdown = () => {
  const { data: session } = useSession()
  const displayName = session?.user?.name ?? 'Admin'

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <AdminAvatar name={displayName} />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={'h6'} className="dropdown-header">
          {displayName}
        </DropdownHeader>
        <div className="dropdown-divider my-1" />
        <DropdownItem className="text-danger" onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
