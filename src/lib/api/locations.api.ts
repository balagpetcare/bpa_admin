import { api } from '../api'
import type { Country, Division, District, CityCorporation, Zone, Venue, PublicLocationCountry } from '@/types/bpa.types'

export const locationsApi = {
  // Countries
  listCountries: () => api.get<Country[]>('/admin/locations/countries'),
  createCountry: (dto: { name: string; code: string }) => api.post<Country>('/admin/locations/countries', dto),
  updateCountry: (id: string, dto: { name?: string; code?: string; isActive?: boolean }) => api.patch<Country>(`/admin/locations/countries/${id}`, dto),
  deleteCountry: (id: string) => api.delete<void>(`/admin/locations/countries/${id}`),

  // Divisions
  listDivisions: (countryId?: string) =>
    api.get<Division[]>('/admin/locations/divisions', countryId ? { countryId } : undefined),
  createDivision: (dto: { name: string; countryId: string }) => api.post<Division>('/admin/locations/divisions', dto),
  updateDivision: (id: string, dto: { name?: string }) => api.patch<Division>(`/admin/locations/divisions/${id}`, dto),
  deleteDivision: (id: string) => api.delete<void>(`/admin/locations/divisions/${id}`),

  // Districts
  listDistricts: (divisionId?: string) =>
    api.get<District[]>('/admin/locations/districts', divisionId ? { divisionId } : undefined),
  createDistrict: (dto: { name: string; divisionId: string }) => api.post<District>('/admin/locations/districts', dto),
  updateDistrict: (id: string, dto: { name?: string }) => api.patch<District>(`/admin/locations/districts/${id}`, dto),
  deleteDistrict: (id: string) => api.delete<void>(`/admin/locations/districts/${id}`),

  // City Corporations
  listCityCorporations: (districtId?: string) =>
    api.get<CityCorporation[]>('/admin/locations/city-corporations', districtId ? { districtId } : undefined),
  createCityCorporation: (dto: { name: string; districtId: string }) =>
    api.post<CityCorporation>('/admin/locations/city-corporations', dto),
  updateCityCorporation: (id: string, dto: { name?: string }) =>
    api.patch<CityCorporation>(`/admin/locations/city-corporations/${id}`, dto),
  deleteCityCorporation: (id: string) => api.delete<void>(`/admin/locations/city-corporations/${id}`),

  // Zones
  listZones: (cityCorporationId?: string) =>
    api.get<Zone[]>('/admin/locations/zones', cityCorporationId ? { cityCorporationId } : undefined),
  createZone: (dto: { name: string; cityCorporationId: string }) => api.post<Zone>('/admin/locations/zones', dto),
  updateZone: (id: string, dto: { name?: string }) => api.patch<Zone>(`/admin/locations/zones/${id}`, dto),
  deleteZone: (id: string) => api.delete<void>(`/admin/locations/zones/${id}`),

  // Venues
  listVenues: (zoneId?: string, opts?: { isActive?: boolean }) =>
    api.get<Venue[]>('/admin/locations/venues', {
      ...(zoneId ? { zoneId } : {}),
      ...(opts?.isActive !== undefined ? { isActive: String(opts.isActive) } : {}),
    }),
  createVenue: (dto: { name: string; zoneId: string; address: string; latitude?: number; longitude?: number; googleMapsUrl?: string }) =>
    api.post<Venue>('/admin/locations/venues', dto),
  updateVenue: (id: string, dto: Partial<{ name: string; address: string; googleMapsUrl: string; latitude: number; longitude: number; isActive: boolean }>) =>
    api.patch<Venue>(`/admin/locations/venues/${id}`, dto),
  deleteVenue: (id: string) => api.delete<void>(`/admin/locations/venues/${id}`),

  // Public
  getPublicHierarchy: () => api.get<PublicLocationCountry[]>('/locations/public/hierarchy'),
}
