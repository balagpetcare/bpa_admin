import { Badge } from 'react-bootstrap'
import type { DiagnosticServiceCategory } from '@/types/bpa.types'

const MAP: Record<DiagnosticServiceCategory, { bg: string; label: string }> = {
  LAB: { bg: 'primary', label: 'Lab' },
  IMAGING: { bg: 'info', label: 'Imaging' },
  SPECIALIST: { bg: 'success', label: 'Specialist' },
  EMERGENCY: { bg: 'danger', label: 'Emergency' },
  FUTURE_TECH: { bg: 'dark', label: 'Future Tech' },
}

export default function DiagnosticServiceCategoryBadge({ category }: { category: DiagnosticServiceCategory }) {
  const { bg, label } = MAP[category] ?? { bg: 'secondary', label: category }
  return <Badge bg={`${bg}-subtle`} text={bg}>{label}</Badge>
}
