'use client'

import { useCallback } from 'react'
import { Row, Col } from 'react-bootstrap'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
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
import type { ApiError } from '@/lib/api'

export default function DashboardContent() {
  const summaryFn = useCallback(() => analyticsApi.summary(), [])
  const newsFn = useCallback(() => newsApi.list({ limit: 5, page: 1 }), [])
  const eventsFn = useCallback(() => eventsApi.list({ limit: 5, page: 1, upcoming: true }), [])
  const contactsFn = useCallback(() => contactsApi.list({ limit: 5, status: 'unread' }), [])
  const volunteersFn = useCallback(() => volunteersApi.list({ limit: 5, status: 'pending' }), [])

  const { data: summary, loading: sumLoading, error: sumError } = useApi(summaryFn, [])
  const { data: newsData } = useApi(newsFn, [])
  const { data: eventsData } = useApi(eventsFn, [])
  const { data: contactsData } = useApi(contactsFn, [])
  const { data: volunteersData } = useApi(volunteersFn, [])

  const news = newsData?.data ?? []
  const events = eventsData?.data ?? []
  const contacts = contactsData?.data ?? []
  const volunteers = volunteersData?.data ?? []

  const emptyAnalyticsSummary = {
    totalUsers: 0, totalNews: 0, totalEvents: 0, totalVolunteers: 0,
    totalContacts: 0, totalMedia: 0, pendingVolunteers: 0, unreadContacts: 0, totalPayments: 0,
  }

  return (
    <div className="container-fluid">
      <ApiErrorAlert error={sumError as ApiError | null} />

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
