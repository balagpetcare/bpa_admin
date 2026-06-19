import { api } from '../api'
import type { NewsListItem, NewsDetail, NewsCategory, NewsTag, PaginatedResult, NewsStatus } from '@/types/bpa.types'

export interface NewsListParams {
  page?: number
  limit?: number
  search?: string
  status?: NewsStatus
  categoryId?: string
}

export interface CreateNewsDto {
  title: string
  slug?: string
  excerpt?: string
  body: string
  coverImageId?: string | null
  categoryId?: string | null
  tagIds?: string[]
  isFeatured?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateNewsDto extends Partial<CreateNewsDto> {}

export interface PublishNewsDto {
  status: NewsStatus
}

export const newsApi = {
  // Categories
  listCategories: () => api.get<NewsCategory[]>('/news/categories'),
  createCategory: (dto: { name: string }) => api.post<NewsCategory>('/news/categories', dto),
  updateCategory: (id: string, dto: { name: string }) => api.put<NewsCategory>(`/news/categories/${id}`, dto),
  deleteCategory: (id: string) => api.delete<void>(`/news/categories/${id}`),

  // Tags
  listTags: () => api.get<NewsTag[]>('/news/tags'),
  createTag: (dto: { name: string }) => api.post<NewsTag>('/news/tags', dto),
  deleteTag: (id: string) => api.delete<void>(`/news/tags/${id}`),

  // Articles
  list: (params?: NewsListParams) =>
    api.get<PaginatedResult<NewsListItem>>('/news', params as Record<string, string | number | boolean | undefined>),

  getById: (id: string) => api.get<NewsDetail>(`/news/${id}`),

  create: (dto: CreateNewsDto) => api.post<NewsDetail>('/news', dto),

  update: (id: string, dto: UpdateNewsDto) => api.put<NewsDetail>(`/news/${id}`, dto),

  publish: (id: string, dto: PublishNewsDto) => api.patch<NewsDetail>(`/news/${id}/publish`, dto),

  remove: (id: string) => api.delete<void>(`/news/${id}`),
}
