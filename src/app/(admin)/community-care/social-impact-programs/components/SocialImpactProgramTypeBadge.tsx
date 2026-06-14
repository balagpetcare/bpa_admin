import { Badge } from 'react-bootstrap'
import type { SocialImpactProgramType } from '@/types/bpa.types'

const MAP: Record<SocialImpactProgramType, { bg: string; label: string }> = {
  STRAY_TREATMENT: { bg: 'danger', label: 'Stray Treatment' },
  FEEDING: { bg: 'warning', label: 'Feeding' },
  VACCINATION: { bg: 'success', label: 'Vaccination' },
  RESCUE: { bg: 'primary', label: 'Rescue' },
  SHELTER: { bg: 'info', label: 'Shelter' },
  LOW_INCOME_SUPPORT: { bg: 'secondary', label: 'Low-Income Support' },
  EDUCATION: { bg: 'dark', label: 'Education' },
}

export default function SocialImpactProgramTypeBadge({ impactType }: { impactType: SocialImpactProgramType }) {
  const { bg, label } = MAP[impactType] ?? { bg: 'secondary', label: impactType }
  return <Badge bg={`${bg}-subtle`} text={bg}>{label}</Badge>
}
