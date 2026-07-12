export const API_MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

export function normalizePagination(page?: number | string | null, limit?: number | string | null) {
  let p = Number(page)
  if (isNaN(p) || p < 1) p = 1

  let l = Number(limit)
  if (isNaN(l) || l < 1) l = DEFAULT_PAGE_SIZE
  if (l > API_MAX_PAGE_SIZE) l = API_MAX_PAGE_SIZE

  return { page: p, limit: l }
}

export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{ data: T[]; meta?: { totalPages: number } }>
): Promise<T[]> {
  const limit = API_MAX_PAGE_SIZE
  const allData: T[] = []
  let currentPage = 1
  let totalPages = 1
  const MAX_PAGES = 50 // Guard against infinite loops

  while (currentPage <= totalPages && currentPage <= MAX_PAGES) {
    const response = await fetchPage(currentPage, limit)
    if (!response.data || response.data.length === 0) break

    allData.push(...response.data)

    if (response.meta && response.meta.totalPages) {
      totalPages = response.meta.totalPages
    } else if (response.data.length < limit) {
      break
    }
    
    currentPage++
  }

  return allData
}
