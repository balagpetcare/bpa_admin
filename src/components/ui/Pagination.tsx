import { Button, Form } from 'react-bootstrap'

export interface PaginationProps {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  label?: string
}

export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  hasPrev,
  hasNext,
  onPageChange,
  onLimitChange,
  label = 'items',
}: PaginationProps) {
  if (total === 0) return null

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-3">
      <div className="d-flex align-items-center gap-2">
        <small className="text-muted text-nowrap">
          {total} {label} - Page {page} of {totalPages || 1}
        </small>
        <Form.Select
          size="sm"
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value))
            onPageChange(1)
          }}
          style={{ width: 'auto' }}
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </Form.Select>
      </div>
      <div className="d-flex gap-1">
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={!hasPrev || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={!hasNext || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
