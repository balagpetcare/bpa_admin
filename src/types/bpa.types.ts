// ─── BPA Domain Types ─────────────────────────────────────────────

export interface PaginationQuery {
  [key: string]: string | number | boolean | undefined
  page?: number
  limit?: number
  search?: string
}


export interface BpaUser {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

// ─── News ─────────────────────────────────────────────────────────

export type NewsStatus = 'draft' | 'published' | 'archived'

export interface NewsCategory {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface NewsTag {
  id: string
  name: string
  slug: string
}

export interface NewsListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: NewsStatus
  isFeatured: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  coverImageUrl: string | null
  author: { id: string; name: string }
  category: NewsCategory | null
}

export interface NewsDetail extends NewsListItem {
  body: string
  tags: NewsTag[]
}

// ─── Events ───────────────────────────────────────────────────────

export type EventStatus = 'draft' | 'published' | 'cancelled'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface EventListItem {
  id: string
  title: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  location: string | null
  startsAt: string
  endsAt: string | null
  capacity: number | null
  isPaid: boolean
  fee: string | null
  status: EventStatus
  registrationCount: number
  createdAt: string
  updatedAt: string
}

export interface EventRegistration {
  id: string
  eventId: string
  eventTitle: string
  name: string
  email: string
  phone: string | null
  status: RegistrationStatus
  paymentId: string | null
  createdAt: string
}

// ─── Committee ────────────────────────────────────────────────────

export interface CommitteeMember {
  id: string
  name: string
  designation: string
  bio: string | null
  photoUrl: string | null
  email: string | null
  phone: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Media ────────────────────────────────────────────────────────

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: string
  url: string
  altText: string | null
  uploadedById: string | null
  createdAt: string
  updatedAt: string
}

// ─── SEO ──────────────────────────────────────────────────────────

export interface SeoMetadata {
  id: string
  route: string
  title: string | null
  description: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImageUrl: string | null
  schemaJson: Record<string, unknown> | null
  updatedAt: string
}

// ─── Users ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  roles: { id: string; name: string }[]
}

// ─── Roles ────────────────────────────────────────────────────────

export interface Permission {
  id: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  createdAt: string
  permissions: Permission[]
}

// ─── Volunteers ───────────────────────────────────────────────────

export type VolunteerStatus = 'pending' | 'approved' | 'rejected'

export interface Volunteer {
  id: string
  name: string
  email: string
  phone: string | null
  areaOfInterest: string | null
  availability: string | null
  message: string | null
  status: VolunteerStatus
  createdAt: string
  updatedAt: string
}

// ─── Contacts ─────────────────────────────────────────────────────

export type ContactStatus = 'unread' | 'read' | 'replied'

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: ContactStatus
  repliedAt: string | null
  createdAt: string
}

// ─── Analytics ────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalUsers: number
  totalNews: number
  totalEvents: number
  totalVolunteers: number
  totalContacts: number
  totalMedia: number
  pendingVolunteers: number
  unreadContacts: number
  totalPayments: number
  // legacy compat — some backends still send this
  totalMembers?: number
}

// ─── Payments ─────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentGateway = 'eps'

export interface Payment {
  id: string
  gateway: PaymentGateway
  gatewayRef: string | null
  merchantTxnId: string | null
  epsTxnId: string | null
  amount: string
  currency: string
  status: PaymentStatus
  purpose: string
  payload?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// ─── SMS Logs ──────────────────────────────────────────────────────

export type SmsStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'

export interface SmsLog {
  id: string
  to: string
  body: string
  status: SmsStatus
  provider: string
  providerRef: string | null
  failureReason: string | null
  payload?: Record<string, unknown> | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Email Logs ─────────────────────────────────────────────────────

export type EmailStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'spam'

export interface EmailLog {
  id: string
  to: string
  subject: string
  body: string | null
  status: EmailStatus
  provider: string
  providerRef: string | null
  failureReason: string | null
  payload?: Record<string, unknown> | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Locations ────────────────────────────────────────────────────

export interface Country { id: string; name: string; code: string; isActive: boolean; createdAt: string }
export interface Division { id: string; name: string; countryId: string; isActive: boolean; createdAt: string }
export interface District { id: string; name: string; divisionId: string; isActive: boolean; createdAt: string }
export interface CityCorporation { id: string; name: string; districtId: string; isActive: boolean; createdAt: string }
export interface Zone { id: string; name: string; cityCorporationId: string; isActive: boolean; createdAt: string }
export interface Venue {
  id: string; name: string; address: string | null; zoneId: string; capacity: number | null
  latitude: number | null; longitude: number | null; isActive: boolean; createdAt: string
}

export interface PublicLocationZone {
  id: string
  name: string
}

export interface PublicLocationCityCorporation {
  id: string
  name: string
  zones: PublicLocationZone[]
}

export interface PublicLocationDistrict {
  id: string
  name: string
  cityCorporations: PublicLocationCityCorporation[]
}

export interface PublicLocationDivision {
  id: string
  name: string
  districts: PublicLocationDistrict[]
}

export interface PublicLocationCountry extends Country {
  divisions: PublicLocationDivision[]
}

// ─── Vaccine Catalog ──────────────────────────────────────────────

export interface VaccineCatalog {
  id: string; name: string; species: string | null; standardIntervalDays: number | null
  manufacturer: string | null; description: string | null; isActive: boolean; createdAt: string
}

export interface CertificateTemplate {
  id: string; name: string; htmlTemplate: string; isActive: boolean; createdAt: string
}

// ─── Pets ─────────────────────────────────────────────────────────

export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
export type PetGender = 'male' | 'female' | 'unknown'

export interface PetOwner {
  id: string; userId: string | null; name: string; email: string | null; phone: string | null
  address: string | null; createdAt: string; _count?: { pets: number }
}

export interface Pet {
  id: string; petOwnerId: string; name: string; species: PetType; breed: string | null
  gender: PetGender; dateOfBirth: string | null; weightKg: string | null
  microchipNumber: string | null; notes: string | null; isActive: boolean; createdAt: string
  owner?: PetOwner; photoUrl?: string | null
}

// ─── Doctors ──────────────────────────────────────────────────────

export interface Doctor {
  id: string; userId: string | null; name: string; email: string | null; phone: string | null
  licenseNumber: string | null; specialization: string | null; bio: string | null
  isActive: boolean; createdAt: string
}

// ─── Campaigns ────────────────────────────────────────────────────

export type CampaignType = 'vaccination' | 'deworming' | 'microchip' | 'health_camp' | 'spay_neuter'
export type CampaignStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed' | 'cancelled'
export type CampaignMediaRole = 'hero' | 'thumbnail' | 'mobile_banner' | 'gallery'

export interface CampaignMedia {
  id: string
  campaignId: string
  mediaFileId: string
  role: CampaignMediaRole
  sortOrder: number
  altText: string | null
  createdAt: string
  mediaFile: MediaFile
}

export interface CampaignListItem {
  id: string; slug: string; title: string; description: string | null
  campaignType: CampaignType; status: CampaignStatus; startDate: string; endDate: string
  registrationOpenAt: string | null; registrationCloseAt: string | null
  basePriceBdt: string; maxPetsPerBooking: number; isFeatured: boolean; allowedPetTypes: string[]; createdAt: string; updatedAt: string
  createdBy: { id: string; name: string; email: string }
  coverImage: { id: string; url: string; altText: string | null } | null
  _count: { sessions: number; services: number; doctors: number; volunteers: number; registrations: number }
}

export interface CampaignSession {
  id: string; campaignId: string; sessionDate: string; startTime: string; endTime: string
  capacity: number; bookedCount: number; notes: string | null; createdAt: string
  venue: { id: string; name: string; address: string | null; zone: { id: string; name: string; cityCorporation: { id: string; name: string } } } | null
}

export interface CampaignService {
  id: string; campaignId: string; name: string; description: string | null
  sortOrder: number; priceBdt: number | null; vaccineCatalogId: string | null
  vaccineCatalog: { id: string; name: string } | null; createdAt: string
}

export interface CampaignDoctor {
  id: string; campaignId: string; doctorId: string; sessionId: string | null
  doctor: { id: string; name: string; licenseNumber: string | null; specialization: string | null }
}

export interface CampaignVolunteer {
  id: string; campaignId: string; userId: string; sessionId: string | null
  user: { id: string; name: string; email: string }
}

export interface CampaignDetail extends CampaignListItem {
  certificateTemplate: { id: string; name: string } | null
  sessions: CampaignSession[]
  services: CampaignService[]
  doctors: CampaignDoctor[]
  volunteers: CampaignVolunteer[]
  media: CampaignMedia[]
}

// ─── Phase 2: Campaign Registrations ─────────────────────────────

export type CampaignRegistrationStatus =
  | 'pending_payment' | 'paid' | 'checked_in' | 'vaccinated'
  | 'certificate_issued' | 'completed' | 'no_show' | 'cancelled'

export type WaitlistStatus = 'waiting' | 'promoted' | 'expired' | 'cancelled'

export interface PetBookingService {
  id: string
  petBookingId: string
  campaignServiceId: string
  administered: boolean
  administeredAt: string | null
  campaignService: { id: string; name: string }
}

export interface PetBooking {
  id: string
  registrationId: string
  petId: string
  sessionId: string
  status: CampaignRegistrationStatus
  checkedInAt: string | null
  vaccinatedAt: string | null
  pet: { id: string; name: string; petType: string; breed: string | null }
  services: PetBookingService[]
}

export interface CampaignRegistration {
  id: string
  bookingNumber: string
  campaignId: string
  sessionId: string
  ownerId: string
  status: CampaignRegistrationStatus
  totalAmountBdt: string
  paymentId: string | null
  isGuest: boolean
  notes: string | null
  createdAt: string
  campaign: { id: string; title: string; basePriceBdt: string }
  session: {
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    venue: { name: string } | null
  }
  owner: { id: string; ownerName: string; mobile: string; email: string | null }
  payment: { id: string; status: string; merchantTxnId: string | null; amount: string } | null
  petBookings: PetBooking[]
  _count?: { petBookings: number }
}

export interface CampaignWaitlistEntry {
  id: string
  campaignId: string
  sessionId: string
  ownerId: string
  petCount: number
  status: WaitlistStatus
  position: number
  notifiedAt: string | null
  expiresAt: string | null
  createdAt: string
  owner: { id: string; ownerName: string; mobile: string; email: string | null }
  session: {
    id: string
    sessionDate: string
    startTime: string
    venue: { name: string } | null
  }
}

export interface CampaignAnalytics {
  id: string
  campaignId: string
  totalRegistrations: number
  totalPaid: number
  totalPets: number
  totalVaccinated: number
  totalCertificates: number
  totalSmsSent: number
  totalSmsFailed: number
  totalRevenueBdt: string
  updatedAt: string
}

// ─── Phase 3: QR + Vaccination ────────────────────────────────────

export interface VaccinationRecord {
  id: string
  petId: string
  petBookingId: string | null
  campaignServiceId: string | null
  campaignId: string | null
  vaccineName: string
  batchNumber: string | null
  administeredAt: string
  nextDueDate: string | null
  doctorId: string | null
  notes: string | null
  createdAt: string
  campaignService: { id: string; name: string } | null
  campaign: { id: string; title: string } | null
  doctor: { id: string; name: string } | null
}

export interface PetBookingDetail {
  id: string
  registrationId: string
  petId: string
  sessionId: string
  status: CampaignRegistrationStatus
  qrToken: string | null
  checkedInAt: string | null
  vaccinatedAt: string | null
  pet: {
    id: string
    name: string
    petType: string
    breed: string | null
    gender: string
    owner: { id: string; ownerName: string; mobile: string; email: string | null }
  }
  session: {
    id: string
    sessionDate: string
    startTime: string
    endTime: string
    venue: { name: string; address: string } | null
  }
  registration: {
    id: string
    bookingNumber: string
    status: CampaignRegistrationStatus
    campaignId: string
    campaign: { id: string; title: string }
  }
  services: Array<{
    id: string
    petBookingId: string
    campaignServiceId: string
    administered: boolean
    administeredAt: string | null
    campaignService: { id: string; name: string; isRequired: boolean; vaccineCatalogId: string | null }
  }>
}

// ─── Phase 4: Certificates + Analytics ───────────────────────────

export interface Certificate {
  id: string
  certificateNumber: string
  petBookingId: string
  verifyToken: string
  issuedById: string
  issuedAt: string
  supersededAt: string | null
  createdAt: string
  petBooking: {
    pet: {
      id: string
      name: string
      petType: string
      breed: string | null
      gender: string
      approxAge: number | null
      owner: { id: string; ownerName: string; mobile: string; email: string | null }
    }
    session: {
      id: string
      sessionDate: string
      startTime: string
      endTime: string
      venue: { name: string; address: string } | null
    }
    registration: {
      id: string
      bookingNumber: string
      campaignId: string
      campaign: { id: string; title: string; campaignType: string }
    }
    vaccinationRecords: Array<{
      id: string
      vaccineName: string
      batchNumber: string | null
      administeredAt: string
      nextDueDate: string | null
      doctor: { name: string } | null
    }>
  }
  issuedBy: { id: string; name: string }
}

export interface QRScanLog {
  id: string
  qrToken: string
  petBookingId: string | null
  scannedById: string
  scanResult: string
  ipAddress: string | null
  createdAt: string
  scannedBy: { id: string; name: string }
  petBooking: {
    id: string
    status: string
    pet: { name: string; petType: string }
  } | null
}

export interface CampaignAnalyticsSummary {
  campaign: { id: string; title: string; status: string; campaignType: string; startDate: string; endDate: string }
  counters: {
    totalRegistrations: number
    totalPaid: number
    totalPets: number
    totalVaccinated: number
    totalCertificates: number
    totalSmsSent: number
    totalSmsFailed: number
    totalRevenueBdt: number | string
  }
  noShow: number
  cancelled: number
  completed: number
}

export interface GlobalCampaignAnalytics {
  totalCampaigns: number
  activeCampaigns: number
  totals: {
    totalRegistrations: number | null
    totalPaid: number | null
    totalPets: number | null
    totalVaccinated: number | null
    totalCertificates: number | null
    totalRevenueBdt: string | null
  }
  recentCampaigns: Array<{
    id: string
    title: string
    status: string
    startDate: string
    analytics: {
      totalRegistrations: number
      totalPaid: number
      totalVaccinated: number
      totalRevenueBdt: string
    } | null
  }>
}

// â”€â”€â”€ Hero Slider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type HeroSlideStatus = 'draft' | 'published' | 'archived'
export type HeroSlideMediaType = 'image' | 'video'
export type HeroSlideOverlayPosition = 'left' | 'center' | 'right'
export type HeroSlideCtaType = 'none' | 'internal' | 'external'
export type HeroSlideLocale = 'en' | 'bn'

export interface HeroSlideMediaRef {
  id: string
  url: string
  mimeType: string
  altText: string | null
}

export interface HeroSlideStat {
  id: string
  label: string
  value: string
}

export interface HeroSlide {
  id: string
  locale: HeroSlideLocale
  title: string
  badgeText: string | null
  eyebrow: string | null
  headline: string
  body: string | null
  campaignTag: string | null
  status: HeroSlideStatus
  isActive: boolean
  mediaType: HeroSlideMediaType
  overlayPosition: HeroSlideOverlayPosition
  ctaType: HeroSlideCtaType
  ctaLabel: string | null
  ctaHref: string | null
  ctaTarget: '_self' | '_blank'
  secondaryCtaType: HeroSlideCtaType
  secondaryCtaLabel: string | null
  secondaryCtaHref: string | null
  secondaryCtaTarget: '_self' | '_blank'
  desktopImage: HeroSlideMediaRef | null
  mobileImage: HeroSlideMediaRef | null
  video: HeroSlideMediaRef | null
  stats: HeroSlideStat[]
  countdownLabel: string | null
  countdownTargetAt: string | null
  startAt: string | null
  endAt: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface HeroSlideListItem extends HeroSlide {
  isScheduledNow: boolean
}

// Homepage CMS
export type HomepageSectionType =
  | 'hero'
  | 'stats'
  | 'mission'
  | 'campaigns'
  | 'news'
  | 'events'
  | 'vision'
  | 'committee'
  | 'cta'
  | 'partners'
  | 'custom'

export type HomepageSectionSource = 'manual' | 'automatic' | 'static'

export interface HomepageSectionItem {
  id: string
  sectionId: string
  entityType: string | null
  entityId: string | null
  title: string | null
  subtitle: string | null
  body: string | null
  href: string | null
  media: HeroSlideMediaRef | null
  metadata: Record<string, unknown> | null
  isVisible: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface HomepageSection {
  id: string
  homepageId: string
  type: HomepageSectionType
  source: HomepageSectionSource
  title: string | null
  eyebrow: string | null
  subtitle: string | null
  body: string | null
  ctaType: HeroSlideCtaType
  ctaLabel: string | null
  ctaHref: string | null
  ctaTarget: '_self' | '_blank'
  itemLimit: number
  content: Record<string, unknown> | null
  isVisible: boolean
  sortOrder: number
  startAt: string | null
  endAt: string | null
  items: HomepageSectionItem[]
  dynamicItems?: unknown
  createdAt: string
  updatedAt: string
}

export interface Homepage {
  id: string
  locale: string
  title: string | null
  description: string | null
  status: 'draft' | 'published' | 'archived'
  settings: Record<string, unknown> | null
  publishedAt: string | null
  sections: HomepageSection[]
  updatedAt: string
}

export interface Partner {
  id: string
  name: string
  description: string | null
  logo: HeroSlideMediaRef | null
  url: string | null
  tier: string | null
  isActive: boolean
  sortOrder: number
  startAt: string | null
  endAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FooterLink {
  id?: string
  label: string
  href: string
  target: '_self' | '_blank'
  sortOrder: number
  isVisible: boolean
}

export interface FooterLinkGroup {
  id?: string
  title: string
  sortOrder: number
  isVisible: boolean
  links: FooterLink[]
}

export interface FooterConfig {
  id: string
  locale: string
  brandName: string | null
  brandText: string | null
  logo: HeroSlideMediaRef | null
  email: string | null
  phone: string | null
  address: string | null
  copyrightText: string | null
  socialLinks: Array<{ label: string; href: string }> | null
  isActive: boolean
  groups: FooterLinkGroup[]
  createdAt: string
  updatedAt: string
}

export interface PublicHomepagePayload {
  homepage: Omit<Homepage, 'sections'> | null
  sections: HomepageSection[]
  heroSlides: HeroSlideListItem[]
  partners: Partner[]
  footer: FooterConfig | null
}

// ─── Community Pet Care (Phase 4) ─────────────────────────────────

export type CommunityZoneStatus = 'active' | 'inactive' | 'coming_soon'

export interface CommunityZone {
  id: string
  name: string
  slug: string
  description: string | null
  city: string
  district: string
  division: string
  targetContributors: number
  currentContributors: number
  targetAmountBdt: string
  currentAmountBdt: string
  clinicAddress: string | null
  clinicPhone: string | null
  mapEmbedUrl: string | null
  latitude: string | null
  longitude: string | null
  coverImage: { id: string; url: string; altText: string | null } | null
  sortOrder: number
  status: CommunityZoneStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ContributionType = 'care_partner'

export interface ContributionPlan {
  id: string
  title: string
  slug: string
  contributionType: ContributionType
  amountBdt: string
  currency: string
  description: string | null
  benefitsSummaryJson: string[] | null
  legalDisclaimerText: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ContributionStatus = 'pending_payment' | 'paid' | 'refunded' | 'cancelled'

export interface CareContribution {
  id: string
  contributionNumber: string
  planId: string
  zoneId: string
  paymentId: string | null
  contributorName: string
  contributorMobile: string
  contributorEmail: string | null
  contributorAddress: string | null
  amountBdt: string
  currency: string
  status: ContributionStatus
  isAnonymous: boolean
  plan: { id: string; title: string; amountBdt: string; legalDisclaimerText: string | null }
  zone: { id: string; name: string; slug: string }
  carePartnerCard: { id: string; cardNumber: string; status: string } | null
  createdAt: string
  updatedAt: string
}

export type CarePartnerCardStatus = 'pending' | 'active' | 'expired' | 'revoked'

export interface CarePartnerCard {
  id: string
  cardNumber: string
  contributionId: string
  zoneId: string
  qrToken: string
  status: CarePartnerCardStatus
  issuedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  revocationReason: string | null
  legalDisclaimerSnapshot: string | null
  contribution: {
    id: string
    contributionNumber: string
    contributorName: string
    contributorMobile: string
    contributorEmail: string | null
    amountBdt: string
    plan: { id: string; title: string; legalDisclaimerText: string | null }
  }
  zone: { id: string; name: string; slug: string }
  createdAt: string
  updatedAt: string
}

export interface CardVerificationLog {
  id: string
  cardId: string
  qrToken: string
  scanResult: string
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  card: { id: string; cardNumber: string }
  createdAt: string
}

export type PetCensusStatus = 'new' | 'contacted' | 'converted' | 'archived' | 'submitted' | 'verified' | 'duplicate'
export type PetCensusPetType = 'cat' | 'dog' | 'bird' | 'rabbit' | 'other'
export type PetCensusPetGender = 'male' | 'female' | 'unknown'
export type PetCensusVaccinationStatus = 'up_to_date' | 'due' | 'not_vaccinated' | 'unknown'
export type PetCensusNeuteredStatus = 'yes' | 'no' | 'planned' | 'unknown'

export interface PetCensusSubmission {
  id: string
  userId: string | null
  ownerName: string
  ownerMobile: string
  ownerEmail: string | null
  division: string | null
  district: string | null
  cityUpazila: string | null
  ownerAddress: string | null
  zoneId: string | null
  areaText: string | null
  isBpaMember: boolean
  petName: string | null
  petType: PetCensusPetType | null
  petGender: PetCensusPetGender | null
  approxAge: string | null
  petCount: number
  householdPetCount: number
  breed: string | null
  vaccinationStatus: PetCensusVaccinationStatus | null
  neuteredStatus: PetCensusNeuteredStatus | null
  healthIssue: string | null
  photoMediaId: string | null
  photoUrl: string | null
  petCountDog: number
  petCountCat: number
  petCountOther: number
  petsJson: unknown | null
  isVaccinationInterested: boolean
  isClinicInterested: boolean
  isPetShopInterested: boolean
  isCarePartnerInterested: boolean
  hasConsented: boolean
  notes: string | null
  adminNote: string | null
  source: string
  sourceRoute: string | null
  status: PetCensusStatus
  ipAddress: string | null
  userAgent: string | null
  user: { id: string; name: string; email: string | null } | null
  photoMedia: { id: string; url: string; originalName: string; mimeType: string } | null
  zone: { id: string; name: string } | null
  submittedAt: string
  updatedAt: string
}

export interface PetCensusPublicSubmitDto {
  ownerName: string
  mobile: string
  email?: string
  division: string
  district: string
  cityUpazila: string
  address: string
  area?: string
  isBpaMember: boolean
  petName: string
  petType: PetCensusPetType
  petGender: PetCensusPetGender
  approxAge: string
  breed?: string
  vaccinationStatus: PetCensusVaccinationStatus
  neuteredStatus: PetCensusNeuteredStatus
  healthIssue?: string
  householdPetCount: number
  photoMediaId?: string
  photoUrl?: string
  consent: boolean
  petCount?: number
  source?: string
  sourceRoute?: string
}

export interface PetCensusPublicSubmitResult {
  id: string
  duplicateHint: {
    possibleDuplicate: boolean
    existingSubmissionId?: string
    petName?: string | null
    submittedAt?: string
    status?: PetCensusStatus
  }
  message: string
}

export interface PetCensusStatusLookupItem {
  id: string
  petName: string | null
  petType: PetCensusPetType | null
  division: string | null
  district: string | null
  cityUpazila: string | null
  vaccinationStatus: PetCensusVaccinationStatus | null
  status: PetCensusStatus
  submittedAt: string
}

export interface PetCensusStatusLookupResult {
  mobile: string
  total: number
  submissions: PetCensusStatusLookupItem[]
}

export interface PetCensusCampaign {
  id: string
  title: string
  description: string | null
  status: CampaignStatus
  registrationStartAt: string
  registrationEndAt: string
  countdownTargetAt: string | null
  targetSubmissions: number
  currentSubmissions: number
  settings: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PetCensusAnalyticsSummary {
  totals: {
    owners: number
    pets: number
    vaccinationNeeded: number
  }
  districtWise: Array<{
    division: string
    district: string
    ownerCount: number
    petCount: number
  }>
  speciesWise: Array<{
    petType: string
    count: number
  }>
  memberBreakdown: {
    member: number
    nonMember: number
  }
  vaccinationBreakdown: {
    up_to_date: number
    due: number
    not_vaccinated: number
    unknown: number
  }
}

export type TransparencyReportStatus = 'draft' | 'published' | 'archived'

export interface TransparencyReport {
  id: string
  title: string
  slug: string
  reportType: string
  periodStart: string
  periodEnd: string
  totalCollectedBdt: string
  totalSpentBdt: string
  balanceBdt: string
  breakdownJson: Record<string, unknown> | null
  summaryMd: string | null
  bodyMd: string | null
  attachmentUrl: string | null
  coverImageId: string | null
  coverImage: { id: string; url: string; altText: string | null } | null
  status: TransparencyReportStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PetSmartIntegrationSettings {
  enabled: boolean
  baseUrl: string | null
  apiKeyConfigured: boolean
  apiKeyMasked: string | null
  apiKeyReference: string | null
  syncEnabled: {
    contributors: boolean
    carePartnerCards: boolean
    petCensusLeads: boolean
    zones: boolean
  }
  lastSyncAt: string | null
  status: string
}

export interface PetSmartIntegrationSettingsUpdatePayload {
  enabled?: boolean
  baseUrl?: string | null
  apiKey?: string | null
  syncEnabled?: {
    contributors: boolean
    carePartnerCards: boolean
    petCensusLeads: boolean
    zones: boolean
  }
}

export interface PetSmartConnectionTestResult {
  connected: boolean
  status: string
  baseUrl: string | null
  checkedAt: string
  message: string
}

export type PetSmartSyncStatus = 'pending' | 'success' | 'failed' | 'skipped'

export interface PetSmartSyncLog {
  id: string
  settingId: string | null
  entityType: string
  entityId: string
  syncType: string
  status: PetSmartSyncStatus
  requestSummary: string | null
  responseSummary: string | null
  errorMessage: string | null
  metadata: Record<string, unknown> | null
  startedAt: string
  finishedAt: string | null
  setting?: { id: string; settingKey: string } | null
}

export interface CareFundZoneStat {
  id: string
  name: string
  slug: string
  targetContributors: number
  currentContributors: number
  targetAmountBdt: number
  currentAmountBdt: number
  progressPercent: number
  carePartnerMembers?: number
}

export interface RecentContributionItem {
  id: string
  contributionNumber: string
  contributorName: string | null
  zoneName: string
  amountBdt: number
  status: ContributionStatus
  createdAt: string
}

export interface CareFundDashboard {
  totalContributors: number
  totalAmountBdt: number
  totalCards: number
  totalActiveCards: number
  totalCensusSubmissions: number
  zones: CareFundZoneStat[]
  recentContributions: RecentContributionItem[]
}

// ─── Community Pet Care — Enterprise Content (Phase 4) ───────────

export type CarePartnerBenefitCategory =
  | 'SERVICE'
  | 'DISCOUNT'
  | 'MEMBERSHIP'
  | 'WELFARE'
  | 'DIAGNOSTIC'
  | 'DIGITAL'
  | 'FUTURE'

export interface CarePartnerBenefit {
  id: string
  titleEn: string
  titleBn: string
  descriptionEn: string | null
  descriptionBn: string | null
  icon: string | null
  category: CarePartnerBenefitCategory
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SocialImpactProgramType =
  | 'STRAY_TREATMENT'
  | 'FEEDING'
  | 'VACCINATION'
  | 'RESCUE'
  | 'SHELTER'
  | 'LOW_INCOME_SUPPORT'
  | 'EDUCATION'

export interface SocialImpactProgram {
  id: string
  titleEn: string
  titleBn: string
  descriptionEn: string | null
  descriptionBn: string | null
  impactType: SocialImpactProgramType
  icon: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RoadmapItemStatus = 'PLANNED' | 'IN_PROGRESS' | 'LIVE'

export interface RoadmapItem {
  id: string
  phase: string
  year: number
  titleEn: string
  titleBn: string
  descriptionEn: string | null
  descriptionBn: string | null
  status: RoadmapItemStatus
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type DiagnosticServiceCategory =
  | 'LAB'
  | 'IMAGING'
  | 'SPECIALIST'
  | 'EMERGENCY'
  | 'FUTURE_TECH'

export interface DiagnosticCenterService {
  id: string
  titleEn: string
  titleBn: string
  descriptionEn: string | null
  descriptionBn: string | null
  category: DiagnosticServiceCategory
  icon: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
