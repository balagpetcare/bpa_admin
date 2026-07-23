'use client'

import { useMemo } from 'react'
import { Table, FormCheck } from 'react-bootstrap'
import type { Permission } from '@/types/bpa.types'

interface PermissionMatrixProps {
  permissions: Permission[]
  selected: string[]
  onChange: (ids: string[]) => void
  readOnly?: boolean
}

export default function PermissionMatrix({ permissions, selected, onChange, readOnly }: PermissionMatrixProps) {
  const { resources, actionsByResource } = useMemo(() => {
    const resourceMap = new Map<string, Permission[]>()
    for (const p of permissions) {
      const list = resourceMap.get(p.resource) ?? []
      list.push(p)
      resourceMap.set(p.resource, list)
    }
    const resources = Array.from(resourceMap.keys()).sort()
    const allActions = Array.from(new Set(permissions.map((p) => p.action))).sort()
    return { resources, allActions, actionsByResource: resourceMap }
  }, [permissions])

  const allActions = useMemo(() => Array.from(new Set(permissions.map((p) => p.action))).sort(), [permissions])

  const toggle = (id: string) => {
    if (readOnly) return
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const toggleResource = (resource: string) => {
    if (readOnly) return
    const perms = actionsByResource.get(resource) ?? []
    const ids = perms.map((p) => p.id)
    const allSelected = ids.every((id) => selected.includes(id))
    onChange(allSelected ? selected.filter((s) => !ids.includes(s)) : Array.from(new Set([...selected, ...ids])))
  }

  const toggleAction = (action: string) => {
    if (readOnly) return
    const ids = permissions.filter((p) => p.action === action).map((p) => p.id)
    const allSelected = ids.every((id) => selected.includes(id))
    onChange(allSelected ? selected.filter((s) => !ids.includes(s)) : Array.from(new Set([...selected, ...ids])))
  }

  if (permissions.length === 0) {
    return <p className="text-muted small">No permissions available.</p>
  }

  return (
    <div className="table-responsive">
      <Table bordered size="sm" className="align-middle mb-0" style={{ fontSize: '0.8rem' }}>
        <thead className="table-light">
          <tr>
            <th style={{ minWidth: 120 }}>Resource</th>
            {allActions.map((action) => (
              <th key={action} className="text-center text-capitalize" style={{ minWidth: 80 }}>
                {!readOnly ? (
                  <div
                    role="button"
                    className="d-flex flex-column align-items-center gap-1 cursor-pointer"
                    onClick={() => toggleAction(action)}
                    title={`Toggle all ${action}`}>
                    <FormCheck
                      readOnly
                      checked={permissions.filter((p) => p.action === action).every((p) => selected.includes(p.id))}
                      tabIndex={-1}
                    />
                    <span>{action}</span>
                  </div>
                ) : (
                  <span>{action}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const perms = actionsByResource.get(resource) ?? []
            return (
              <tr key={resource}>
                <td>
                  {!readOnly ? (
                    <span
                      role="button"
                      className="text-capitalize fw-semibold"
                      onClick={() => toggleResource(resource)}
                      title={`Toggle all ${resource}`}
                      style={{ cursor: 'pointer' }}>
                      {resource}
                    </span>
                  ) : (
                    <span className="text-capitalize fw-semibold">{resource}</span>
                  )}
                </td>
                {allActions.map((action) => {
                  const perm = perms.find((p) => p.action === action)
                  return (
                    <td key={action} className="text-center">
                      {perm ? (
                        <FormCheck
                          checked={selected.includes(perm.id)}
                          onChange={() => toggle(perm.id)}
                          disabled={readOnly}
                          title={`${resource}:${action}`}
                        />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}
