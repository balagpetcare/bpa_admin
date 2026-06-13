import { api } from '../api'
import type { CareFundDashboard } from '@/types/bpa.types'

export const communityFundApi = {
  getDashboard: () => api.get<CareFundDashboard>('/admin/community-fund/dashboard'),
}
