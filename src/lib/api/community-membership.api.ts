import { api } from '../api'

export const communityMembershipApi = {
  // Dashboard
  getDashboard: () => api.get<any>('/admin/community-membership/dashboard'),

  // Program
  getProgram: () => api.get<any>('/admin/community-membership/program'),
  updateProgram: (data: any) => api.put<any>('/admin/community-membership/program', data),

  // Tiers
  listTiers: (params?: any) => api.get<any>('/admin/community-membership/tiers', { params }),
  getTier: (id: string) => api.get<any>(`/admin/community-membership/tiers/${id}`),
  createTier: (data: any) => api.post<any>('/admin/community-membership/tiers', data),
  updateTier: (id: string, data: any) => api.put<any>(`/admin/community-membership/tiers/${id}`, data),
  deleteTier: (id: string) => api.delete<any>(`/admin/community-membership/tiers/${id}`),

  // Services
  listServices: () => api.get<any>('/admin/community-membership/services'),
  createService: (data: any) => api.post<any>('/admin/community-membership/services', data),
  updateService: (id: string, data: any) => api.put<any>(`/admin/community-membership/services/${id}`, data),
  deleteService: (id: string) => api.delete<any>(`/admin/community-membership/services/${id}`),

  // Discounts
  listDiscounts: () => api.get<any>('/admin/community-membership/discounts'),
  upsertDiscount: (data: any) => api.post<any>('/admin/community-membership/discounts', data),
  deleteDiscount: (id: string) => api.delete<any>(`/admin/community-membership/discounts/${id}`),

  // Benefits
  listBenefits: () => api.get<any>('/admin/community-membership/benefits'),
  getBenefit: (id: string) => api.get<any>(`/admin/community-membership/benefits/${id}`),
  createBenefit: (data: any) => api.post<any>('/admin/community-membership/benefits', data),
  updateBenefit: (id: string, data: any) => api.put<any>(`/admin/community-membership/benefits/${id}`, data),
  deleteBenefit: (id: string) => api.delete<any>(`/admin/community-membership/benefits/${id}`),

  // Purchases
  listPurchases: (params?: any) => api.get<any>('/admin/community-membership/purchases', { params }),
  getPurchase: (id: string) => api.get<any>(`/admin/community-membership/purchases/${id}`),
  updatePurchaseStatus: (id: string, status: string) =>
    api.put<any>(`/admin/community-membership/purchases/${id}/status`, { status }),
  getPurchaseCard: (id: string) => api.get<any>(`/admin/community-membership/purchases/${id}/card`),
  settlePurchase: (id: string, note?: string) =>
    api.post<any>(`/admin/community-membership/purchases/${id}/settle`, { note }),
  rejectPurchase: (id: string, reason?: string) =>
    api.post<any>(`/admin/community-membership/purchases/${id}/reject`, { reason }),
  regeneratePdf: (id: string) =>
    api.post<any>(`/admin/community-membership/purchases/${id}/regenerate-pdf`),

  // Upgrades
  listUpgrades: (params?: any) => api.get<any>('/admin/community-membership/upgrades', { params }),
  getUpgrade: (id: string) => api.get<any>(`/admin/community-membership/upgrades/${id}`),
  settleUpgrade: (id: string, note?: string) =>
    api.post<any>(`/admin/community-membership/upgrades/${id}/settle`, { note }),

  // Documents
  listDocuments: () => api.get<any>('/admin/community-membership/documents'),
  getDocument: (id: string) => api.get<any>(`/admin/community-membership/documents/${id}`),
  createDocument: (data: any) => api.post<any>('/admin/community-membership/documents', data),
  updateDocument: (id: string, data: any) =>
    api.put<any>(`/admin/community-membership/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete<any>(`/admin/community-membership/documents/${id}`),
}
