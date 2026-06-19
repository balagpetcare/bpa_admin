import { api, apiClient } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationPurpose {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon?: string;
  imageMediaId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  suggestedAmounts?: number[];
  impactTextEn?: string;
  impactTextBn?: string;
  createdAt: string;
}

export interface DonationCampaign {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  coverImageId?: string;
  featuredImageUrl?: string;
  goalAmount: string;
  raisedAmount: string;
  currentAmount: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isActive: boolean;
  isFeatured: boolean;
  allowCustomAmount: boolean;
  defaultAmount?: string;
  sortOrder: number;
  purposeId?: string;
  purpose?: { id: string; titleEn: string };
  videoUrl?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  referenceNo: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  amount: string;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'pending_review';
  isAnonymous: boolean;
  donorType?: string;
  organizationName?: string;
  message?: string;
  source?: string;
  qrSlug?: string;
  gatewayTransactionId?: string;
  paidAt?: string;
  createdAt: string;
  campaign?: { id: string; titleEn: string };
  purpose?: { id: string; titleEn: string };
  payment?: { id: string; merchantTxnId?: string; epsTxnId?: string };
}

export interface DonationQrCode {
  id: string;
  slug: string;
  label: string;
  type: 'general' | 'purpose' | 'campaign' | 'source';
  purposeId?: string;
  campaignId?: string;
  sourceTag?: string;
  isActive: boolean;
  scanCount: number;
  donationCount: number;
  totalRaised: string;
  qrImageUrl?: string;
  createdAt: string;
  purpose?: { titleEn: string };
  campaign?: { titleEn: string };
}

export interface DonationImpactStory {
  id: string;
  titleEn: string;
  titleBn?: string;
  slug: string;
  storyType: string;
  location?: string;
  animalType?: string;
  animalName?: string;
  shortDescriptionEn?: string;
  shortDescriptionBn?: string;
  fullStoryEn: string;
  fullStoryBn?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  costUsed?: string;
  storyDate?: string;
  isPublished: boolean;
  isFeatured: boolean;
  campaignId?: string;
  purposeId?: string;
  campaign?: { id: string; titleEn: string };
  purpose?: { id: string; titleEn: string };
  createdAt: string;
}

export interface TransparencyReport {
  id: string;
  reportMonth: string;
  titleEn: string;
  titleBn?: string;
  totalReceived: string;
  totalUsed: string;
  vaccinationExpense: string;
  foodExpense: string;
  treatmentExpense: string;
  rescueExpense?: string;
  administrationExpense?: string;
  summaryEn?: string;
  summaryBn?: string;
  pdfUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface DonationPageSettings {
  id?: string;
  heroTitleEn: string;
  heroTitleBn?: string;
  heroSubtitleEn?: string;
  heroSubtitleBn?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  goalAmount?: number;
  goalLabelEn?: string;
  showImpactCounters: boolean;
  showPurposeCards: boolean;
  showCampaigns: boolean;
  showImpactStories: boolean;
  showDonorWall: boolean;
  showTransparency: boolean;
  showQrSection: boolean;
  primaryCtaTextEn?: string;
  secondaryCtaTextEn?: string;
  faqJson?: unknown;
  transparencyTextEn?: string;
  seoTitleEn?: string;
  seoDescriptionEn?: string;
}

export interface DonationDashboardStats {
  totalDonations: number;
  successfulDonations: number;
  totalRaised: number;
  activeCampaigns: number;
  todayRaised: number;
  monthRaised: number;
  thisWeekAmount?: number;
  pendingDonations: number;
  failedDonations: number;
  qrDonations: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  refundedAmount: number;
  donorCount: number;
  recurringDonorCount: number;
  averageDonationAmount: number;
  purposeBreakdown: { titleEn: string; total: number; count: number }[];
  campaignBreakdown: { titleEn: string; total: number; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  donationStatusBreakdown?: { status: string; count: number; amount: number }[];
  paymentMethodBreakdown?: { method: string; count: number; amount: number }[];
  monthlyTrend: { month: string; total: number; count: number }[];
  recentDonations?: Donation[];
  transparencySummary?: {
    impactStoriesCount: number;
    transparencyReportsCount: number;
    totalReceived: number;
    totalUsed: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  return apiClient<DonationDashboardStats>('/admin/donations/dashboard-stats');
}

// ─── Donations ────────────────────────────────────────────────────────────────

export async function listDonations(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  purposeId?: string;
  campaignId?: string;
  country?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const res = await apiClient<{ data: Donation[]; meta: PaginationMeta }>('/admin/donations', {
    method: 'GET',
    params: params as any,
  });
  return res as { data: Donation[]; meta: PaginationMeta };
}

export async function getDonation(id: string) {
  const res = await apiClient<{ data: Donation }>(`/admin/donations/${id}`);
  return (res as any).data as Donation;
}

export async function updateDonationStatus(id: string, status: string) {
  return api.patch(`/admin/donations/${id}/status`, { status });
}

// ─── Purposes ─────────────────────────────────────────────────────────────────

export async function listPurposes() {
  const res = await apiClient<{ data: DonationPurpose[] }>('/admin/donations/purposes');
  return (res as any).data as DonationPurpose[];
}

export async function createPurpose(data: Partial<DonationPurpose>) {
  return api.post<DonationPurpose>('/admin/donations/purposes', data);
}

export async function updatePurpose(id: string, data: Partial<DonationPurpose>) {
  return api.patch<DonationPurpose>(`/admin/donations/purposes/${id}`, data);
}

export async function deletePurpose(id: string) {
  return api.delete(`/admin/donations/purposes/${id}`);
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(params?: { status?: string; search?: string }) {
  const res = await apiClient<{ data: DonationCampaign[] }>('/admin/donations/campaigns', {
    method: 'GET',
    params: params as any,
  });
  return (res as any).data as DonationCampaign[];
}

export async function getCampaign(id: string) {
  const res = await apiClient<{ data: DonationCampaign }>(`/admin/donations/campaigns/${id}`);
  return (res as any).data as DonationCampaign;
}

export async function createCampaign(data: Partial<DonationCampaign>) {
  return api.post<DonationCampaign>('/admin/donations/campaigns', data);
}

export async function updateCampaign(id: string, data: Partial<DonationCampaign>) {
  return api.patch<DonationCampaign>(`/admin/donations/campaigns/${id}`, data);
}

export async function deleteCampaign(id: string) {
  return api.delete(`/admin/donations/campaigns/${id}`);
}

// ─── QR Codes ─────────────────────────────────────────────────────────────────

export async function listQrCodes() {
  const res = await apiClient<{ data: DonationQrCode[] }>('/admin/donations/qr-codes');
  return (res as any).data as DonationQrCode[];
}

export async function createQrCode(data: Partial<DonationQrCode>) {
  return api.post<DonationQrCode>('/admin/donations/qr-codes', data);
}

export async function updateQrCode(id: string, data: Partial<DonationQrCode>) {
  return api.patch<DonationQrCode>(`/admin/donations/qr-codes/${id}`, data);
}

export async function deleteQrCode(id: string) {
  return api.delete(`/admin/donations/qr-codes/${id}`);
}

export function qrCodePublicUrl(slug: string) {
  return `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://bpa.org.bd'}/donate?qr=${slug}`;
}

// ─── Impact Stories ───────────────────────────────────────────────────────────

export async function listImpactStories(params?: { isPublished?: boolean; search?: string }) {
  const res = await apiClient<{ data: DonationImpactStory[] }>('/admin/donations/impact-stories', {
    method: 'GET',
    params: params as any,
  });
  return (res as any).data as DonationImpactStory[];
}

export async function getImpactStory(id: string) {
  const res = await apiClient<{ data: DonationImpactStory }>(`/admin/donations/impact-stories/${id}`);
  return (res as any).data as DonationImpactStory;
}

export async function createImpactStory(data: Partial<DonationImpactStory>) {
  return api.post<DonationImpactStory>('/admin/donations/impact-stories', data);
}

export async function updateImpactStory(id: string, data: Partial<DonationImpactStory>) {
  return api.patch<DonationImpactStory>(`/admin/donations/impact-stories/${id}`, data);
}

export async function deleteImpactStory(id: string) {
  return api.delete(`/admin/donations/impact-stories/${id}`);
}

// ─── Transparency Reports ─────────────────────────────────────────────────────

export async function listTransparencyReports() {
  const res = await apiClient<{ data: TransparencyReport[] }>('/admin/donations/transparency-reports');
  return (res as any).data as TransparencyReport[];
}

export async function createTransparencyReport(data: Partial<TransparencyReport>) {
  return api.post<TransparencyReport>('/admin/donations/transparency-reports', data);
}

export async function updateTransparencyReport(id: string, data: Partial<TransparencyReport>) {
  return api.patch<TransparencyReport>(`/admin/donations/transparency-reports/${id}`, data);
}

export async function deleteTransparencyReport(id: string) {
  return api.delete(`/admin/donations/transparency-reports/${id}`);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportDonationsCsv(params?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { getApiBase } = await import('@/lib/utils/api-url');
  const url = new URL(`${getApiBase()}/admin/donations/export/csv`);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.dateFrom) url.searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) url.searchParams.set('dateTo', params.dateTo);

  const { getSession } = await import('next-auth/react');
  const session = await getSession();
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error('Failed to export CSV');

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `donations_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// ─── Page CMS Settings ────────────────────────────────────────────────────────

export async function getPageSettings() {
  const res = await apiClient<{ data: DonationPageSettings }>('/admin/donations/page-settings');
  return (res as any).data as DonationPageSettings;
}

export async function updatePageSettings(data: Partial<DonationPageSettings>) {
  return api.patch<DonationPageSettings>('/admin/donations/page-settings', data);
}
