import { api } from '../api'

export interface Category {
  id: string
  nameEn: string
  nameBn: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type ContentPostType = 'VIDEO' | 'COMMUNITY_POST' | 'ANNOUNCEMENT' | 'DONATION_STORY' | 'CAMPAIGN_UPDATE' | 'PET_CARE_TIP'

export interface ContentPost {
  id: string
  type: ContentPostType
  titleEn: string
  titleBn: string
  slug: string
  summaryEn: string | null
  summaryBn: string | null
  bodyEn: string | null
  bodyBn: string | null
  coverImageUrl: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  videoProvider: string | null
  videoSourceType?: 'youtube' | 'vimeo' | 'upload'
  videoFileUrl?: string | null
  videoFileKey?: string | null
  videoPosterUrl?: string | null
  durationSeconds?: number | null
  status: 'draft' | 'published' | 'archived'
  categoryId: string | null
  tags: string[]
  allowComments: boolean
  showOnHomepage: boolean
  isFeatured: boolean
  isPinned: boolean
  homepagePriority: number
  ctaLabelEn: string | null
  ctaLabelBn: string | null
  ctaUrl: string | null
  ctaType: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category?: Category | null
  createdBy?: { id: string; name: string; avatarUrl: string | null } | null
}

export interface ContentComment {
  id: string
  postId: string
  userId: string
  body: string
  status: 'approved' | 'pending' | 'hidden' | 'spam'
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string; email: string; avatarUrl: string | null } | null
  post?: { id: string; titleEn: string; type: string; slug: string } | null
}

export interface ContentReport {
  id: string
  postId: string | null
  commentId: string | null
  reportedById: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
  reportedBy?: { id: string; name: string; email: string } | null
  post?: { id: string; titleEn: string; type: string; slug: string } | null
  comment?: { id: string; body: string; user?: { id: string; name: string } | null } | null
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const contentApi = {
  // Posts CRUD
  listPosts: (params?: {
    page?: number
    limit?: number
    type?: ContentPostType
    status?: string
    categoryId?: string
    q?: string
    showOnHomepage?: boolean
    isFeatured?: boolean
    isPinned?: boolean
  }) => api.get<ContentPost[]>('/admin/content/posts', params as any),

  getPostById: (id: string) => api.get<ContentPost>(`/admin/content/posts/${id}`),

  createPost: (dto: Partial<ContentPost>) => api.post<ContentPost>('/admin/content/posts', dto),

  updatePost: (id: string, dto: Partial<ContentPost>) => api.patch<ContentPost>(`/admin/content/posts/${id}`, dto),

  deletePost: (id: string) => api.delete<void>(`/admin/content/posts/${id}`),

  // Categories CRUD
  listCategories: () => api.get<Category[]>('/admin/content/categories'),

  createCategory: (dto: { nameEn: string; nameBn: string; slug: string; description?: string | null }) =>
    api.post<Category>('/admin/content/categories', dto),

  updateCategory: (id: string, dto: { nameEn?: string; nameBn?: string; slug?: string; description?: string | null }) =>
    api.patch<Category>(`/admin/content/categories/${id}`, dto),

  deleteCategory: (id: string) => api.delete<void>(`/admin/content/categories/${id}`),

  // Comments Moderation
  listComments: (params?: { page?: number; limit?: number; status?: string; reported?: boolean; postId?: string }) =>
    api.get<ContentComment[]>('/admin/content/comments', params as any),

  moderateComment: (commentId: string, status: string) => api.patch<ContentComment>(`/admin/content/comments/${commentId}/status`, { status }),

  deleteComment: (commentId: string) => api.delete<void>(`/content/comments/${commentId}`),

  // Reports Management
  listReports: (params?: { page?: number; limit?: number; status?: string }) => api.get<ContentReport[]>('/admin/content/reports', params as any),

  resolveReport: (id: string, status: string) => api.patch<ContentReport>(`/admin/content/reports/${id}/status`, { status }),
}
