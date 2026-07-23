import { Badge } from 'react-bootstrap'
import type { CarePartnerBenefitCategory } from '@/types/bpa.types'

const MAP: Record<CarePartnerBenefitCategory, { bg: string; label: string }> = {
  SERVICE: { bg: 'primary', label: 'Service' },
  DISCOUNT: { bg: 'success', label: 'Discount' },
  MEMBERSHIP: { bg: 'info', label: 'Membership' },
  WELFARE: { bg: 'warning', label: 'Welfare' },
  DIAGNOSTIC: { bg: 'danger', label: 'Diagnostic' },
  DIGITAL: { bg: 'secondary', label: 'Digital' },
  FUTURE: { bg: 'dark', label: 'Future' },
}

export default function CarePartnerBenefitCategoryBadge({ category }: { category: CarePartnerBenefitCategory }) {
  const { bg, label } = MAP[category] ?? { bg: 'secondary', label: category }
  return (
    <Badge bg={`${bg}-subtle`} text={bg}>
      {label}
    </Badge>
  )
}
