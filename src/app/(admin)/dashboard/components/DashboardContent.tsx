'use client'

import { useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import DashboardKpiCards from './DashboardKpiCards'
import RecentNewsWidget from './RecentNewsWidget'
import RecentEventsWidget from './RecentEventsWidget'
import RecentContactsWidget from './RecentContactsWidget'
import RecentVolunteersWidget from './RecentVolunteersWidget'
import ActivityTimeline from './ActivityTimeline'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/lib/api/analytics.api'
import { newsApi } from '@/lib/api/news.api'
import { eventsApi } from '@/lib/api/events.api'
import { contactsApi } from '@/lib/api/contacts.api'
import { volunteersApi } from '@/lib/api/volunteers.api'
import { ApiError } from '@/lib/api'
import type { AnalyticsSummary, PaginatedResult } from '@/types/bpa.types'

// Swallow 404/NOT_FOUND so unimplemented endpoints don't crash the dashboard.
// Other errors (401, 500, network) still surface normally.
function safe404<T>(fn: () => Promise<T>, fallback: T): () => Promise<T> {
  return async () => {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.code === 'NOT_FOUND')) {
        return fallback
      }
      throw err
    }
  }
}

const emptyPage = <T,>(): PaginatedResult<T> => ({
  data: [],
  meta: { page: 1, limit: 5, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
})

const emptyAnalyticsSummary: AnalyticsSummary = {
  totalUsers: 0, totalNews: 0, totalEvents: 0, totalVolunteers: 0,
  totalContacts: 0, totalMedia: 0, pendingVolunteers: 0, unreadContacts: 0, totalPayments: 0,
}

export default function DashboardContent() {
  const summaryFn = useCallback(safe404(() => analyticsApi.summary(), emptyAnalyticsSummary), [])
  const newsFn = useCallback(safe404(() => newsApi.list({ limit: 5, page: 1 }), emptyPage()), [])
  const eventsFn = useCallback(safe404(() => eventsApi.list({ limit: 5, page: 1, upcoming: true }), emptyPage()), [])
  const contactsFn = useCallback(safe404(() => contactsApi.list({ limit: 5, status: 'unread' }), emptyPage()), [])
  const volunteersFn = useCallback(safe404(() => volunteersApi.list({ limit: 5, status: 'pending' }), emptyPage()), [])

  const { data: summary, loading: sumLoading } = useApi(summaryFn, [])
  const { data: newsData } = useApi(newsFn, [])
  const { data: eventsData } = useApi(eventsFn, [])
  const { data: contactsData } = useApi(contactsFn, [])
  const { data: volunteersData } = useApi(volunteersFn, [])

  const news = newsData?.data ?? []
  const events = eventsData?.data ?? []
  const contacts = contactsData?.data ?? []
  const volunteers = volunteersData?.data ?? []

  return (
    <div className="container-fluid">
      <DashboardKpiCards summary={sumLoading ? emptyAnalyticsSummary : (summary ?? emptyAnalyticsSummary)} />

      <Row className="g-3 mb-4">
        <Col xl={6}>
          <RecentNewsWidget items={news} />
        </Col>
        <Col xl={6}>
          <RecentEventsWidget items={events} />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col xl={6}>
          <RecentContactsWidget items={contacts} />
        </Col>
        <Col xl={6}>
          <RecentVolunteersWidget items={volunteers} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12}>
          <ActivityTimeline news={news} events={events} contacts={contacts} volunteers={volunteers} />
        </Col>
      </Row>
    </div>
  )
}
