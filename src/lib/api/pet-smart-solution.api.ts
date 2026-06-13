import { api } from '../api'
import type {
  PaginationQuery,
  PetSmartConnectionTestResult,
  PetSmartIntegrationSettings,
  PetSmartIntegrationSettingsUpdatePayload,
  PetSmartSyncLog,
} from '@/types/bpa.types'

export const petSmartSolutionApi = {
  getSettings: () => api.get<PetSmartIntegrationSettings>('/admin/pet-smart-solution/settings'),
  updateSettings: (data: PetSmartIntegrationSettingsUpdatePayload) =>
    api.patch<PetSmartIntegrationSettings>('/admin/pet-smart-solution/settings', data),
  testConnection: () =>
    api.post<PetSmartConnectionTestResult>('/admin/pet-smart-solution/test-connection', {}),
  listSyncLogs: (params?: PaginationQuery & { status?: string; entityType?: string; syncType?: string }) =>
    api.getPaginated<PetSmartSyncLog>('/admin/pet-smart-solution/sync-logs', params),
  getSyncLog: (id: string) =>
    api.get<PetSmartSyncLog>(`/admin/pet-smart-solution/sync-logs/${id}`),
}
