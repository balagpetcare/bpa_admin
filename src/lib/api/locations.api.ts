import { api } from '../api'
import type {
  Country,
  Division,
  District,
  CityCorporation,
  Zone,
  Venue,
  PublicLocationCountry,
  LocationNode,
  LocationNodeType,
} from '@/types/bpa.types'

export interface VenueLocationFilters {
  divisionId?: string
  districtId?: string
  upazilaId?: string
  unionId?: string
  cityCorporationId?: string
  cityZoneId?: string
  wardId?: string
  locationId?: string
}

export interface CreateVenueDto {
  name: string
  address: string
  locationId: string
  googleMapsUrl?: string
  latitude?: number
  longitude?: number
  contactPerson?: string
  contactPhone?: string
  capacity?: number
  isActive?: boolean
}

export type UpdateVenueDto = Partial<CreateVenueDto>

// Bangladesh administrative location tree (Division -> District ->
// Upazila/City Corporation -> Union/City Zone -> Ward), backed by the fully
// seeded location_nodes table. Browse via parentId + type; admins only
// attach venues to existing nodes here — never create districts/upazilas.
export const locationTreeApi = {
  listChildren: (params: { type?: LocationNodeType; parentId?: string | null; activeOnly?: boolean } = {}) =>
    api.get<LocationNode[]>('/admin/location-tree', {
      ...(params.type ? { type: params.type } : {}),
      ...(params.parentId === null ? { parentId: 'null' } : params.parentId ? { parentId: params.parentId } : {}),
      ...(params.activeOnly === false ? { activeOnly: 'false' } : {}),
    }),
  search: (q: string, type?: LocationNodeType) => api.get<LocationNode[]>('/admin/location-tree/search', { q, ...(type ? { type } : {}) }),
  getById: (id: string) => api.get<LocationNode>(`/admin/location-tree/${id}`),
  getPath: (id: string) => api.get<LocationNode[]>(`/admin/location-tree/${id}/path`),
}

export const locationsApi = {
  // Countries
  listCountries: () => api.get<Country[]>('/admin/locations/countries'),
  createCountry: (dto: { name: string; code: string }) => api.post<Country>('/admin/locations/countries', dto),
  updateCountry: (id: string, dto: { name?: string; code?: string; isActive?: boolean }) =>
    api.patch<Country>(`/admin/locations/countries/${id}`, dto),
  deleteCountry: (id: string) => api.delete<void>(`/admin/locations/countries/${id}`),

  // Divisions
  listDivisions: (countryId?: string) => api.get<Division[]>('/admin/locations/divisions', countryId ? { countryId } : undefined),
  createDivision: (dto: { name: string; countryId: string }) => api.post<Division>('/admin/locations/divisions', dto),
  updateDivision: (id: string, dto: { name?: string }) => api.patch<Division>(`/admin/locations/divisions/${id}`, dto),
  deleteDivision: (id: string) => api.delete<void>(`/admin/locations/divisions/${id}`),

  // Districts
  listDistricts: (divisionId?: string) => api.get<District[]>('/admin/locations/districts', divisionId ? { divisionId } : undefined),
  createDistrict: (dto: { name: string; divisionId: string }) => api.post<District>('/admin/locations/districts', dto),
  updateDistrict: (id: string, dto: { name?: string }) => api.patch<District>(`/admin/locations/districts/${id}`, dto),
  deleteDistrict: (id: string) => api.delete<void>(`/admin/locations/districts/${id}`),

  // City Corporations
  listCityCorporations: (districtId?: string) =>
    api.get<CityCorporation[]>('/admin/locations/city-corporations', districtId ? { districtId } : undefined),
  createCityCorporation: (dto: { name: string; districtId: string }) => api.post<CityCorporation>('/admin/locations/city-corporations', dto),
  updateCityCorporation: (id: string, dto: { name?: string }) => api.patch<CityCorporation>(`/admin/locations/city-corporations/${id}`, dto),
  deleteCityCorporation: (id: string) => api.delete<void>(`/admin/locations/city-corporations/${id}`),

  // Zones
  listZones: (cityCorporationId?: string) => api.get<Zone[]>('/admin/locations/zones', cityCorporationId ? { cityCorporationId } : undefined),
  createZone: (dto: { name: string; cityCorporationId: string }) => api.post<Zone>('/admin/locations/zones', dto),
  updateZone: (id: string, dto: { name?: string }) => api.patch<Zone>(`/admin/locations/zones/${id}`, dto),
  deleteZone: (id: string) => api.delete<void>(`/admin/locations/zones/${id}`),

  // Venues — created only under an existing location-tree node (locationId)
  listVenues: (filters?: VenueLocationFilters & { isActive?: boolean; search?: string }) =>
    api.get<Venue[]>('/admin/locations/venues', {
      ...(filters?.divisionId ? { divisionId: filters.divisionId } : {}),
      ...(filters?.districtId ? { districtId: filters.districtId } : {}),
      ...(filters?.upazilaId ? { upazilaId: filters.upazilaId } : {}),
      ...(filters?.unionId ? { unionId: filters.unionId } : {}),
      ...(filters?.cityCorporationId ? { cityCorporationId: filters.cityCorporationId } : {}),
      ...(filters?.cityZoneId ? { cityZoneId: filters.cityZoneId } : {}),
      ...(filters?.wardId ? { wardId: filters.wardId } : {}),
      ...(filters?.locationId ? { locationId: filters.locationId } : {}),
      ...(filters?.search ? { search: filters.search } : {}),
      ...(filters?.isActive !== undefined ? { isActive: String(filters.isActive) } : {}),
    }),
  createVenue: (dto: CreateVenueDto) => api.post<Venue>('/admin/locations/venues', dto),
  updateVenue: (id: string, dto: UpdateVenueDto) => api.patch<Venue>(`/admin/locations/venues/${id}`, dto),
  deleteVenue: (id: string) => api.delete<void>(`/admin/locations/venues/${id}`),

  // Public
  getPublicHierarchy: () => api.get<PublicLocationCountry[]>('/locations/public/hierarchy'),
}
