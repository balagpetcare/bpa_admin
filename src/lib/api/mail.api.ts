import { apiClient, apiClientPaginated } from '../api'

export interface MailAccount {
  id: string
  displayName: string
  emailAddress: string
  smtpHost: string | null
  smtpPort: number | null
  smtpSecure: boolean | null
  imapHost: string | null
  imapPort: number | null
  imapSecure: boolean | null
  username: string
  fromName: string
  status: 'active' | 'inactive'
  isDefault: boolean
  sortOrder?: number
  smtpLastStatus?: string | null
  smtpLastCheckedAt?: string | null
  imapLastStatus?: string | null
  imapLastCheckedAt?: string | null
  lastSyncAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMailAccountDto {
  displayName: string
  emailAddress: string
  smtpHost?: string | null
  smtpPort?: number | null
  smtpSecure?: boolean | null
  imapHost?: string | null
  imapPort?: number | null
  imapSecure?: boolean | null
  username: string
  password?: string | null
  fromName: string
  status?: 'active' | 'inactive'
  isDefault?: boolean
  sortOrder?: number
}

export interface MailRecipient {
  id: string
  messageId: string
  emailAddress: string
  name: string | null
  type: 'to' | 'cc' | 'bcc'
}

export interface MailAttachment {
  id: string
  messageId: string
  filename: string
  contentType: string
  size: number
  storagePath: string
  url: string
}

export interface MailMessage {
  id: string
  messageId: string
  threadId: string
  mailboxId: string
  fromAddress: string
  fromName: string | null
  subject: string
  bodyHtml: string
  bodyText: string | null
  isRead: boolean
  status: 'received' | 'sent_success' | 'sent_failed' | 'draft'
  date: string
  inReplyTo: string | null
  references: string | null
  createdAt: string
  updatedAt: string
  recipients?: MailRecipient[]
  attachments?: MailAttachment[]
  mailbox?: {
    displayName: string
    emailAddress: string
  }
}

export interface MailThread {
  id: string
  subject: string
  createdAt: string
  updatedAt: string
}

export interface MailInternalNote {
  id: string
  threadId: string
  messageId: string | null
  note: string
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export interface SendMailDto {
  fromAccountId: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  bodyHtml: string
  plainText?: string
  attachments?: {
    filename: string
    contentType: string
    size: number
    storagePath: string
    url: string
    cid?: string
  }[]
  attachmentIds?: string[]
  useTemplate?: boolean
  layoutKey?: string
}

export interface ReplyMailDto extends SendMailDto {
  inReplyTo: string
  references?: string
  threadId: string
}

export interface ForwardMailDto extends SendMailDto {
  originalMessageId?: string
  threadId?: string
}

export interface QueryInboxParams {
  mailboxId?: string
  status?: 'received' | 'sent_success' | 'sent_failed' | 'draft'
  isRead?: 'true' | 'false'
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const mailApi = {
  // Accounts CRUD
  listAccounts: () => apiClient<MailAccount[]>('/admin/mail/accounts'),
  getAccount: (id: string) => apiClient<MailAccount>(`/admin/mail/accounts/${id}`),
  createAccount: (dto: CreateMailAccountDto) => apiClient<MailAccount>('/admin/mail/accounts', { method: 'POST', body: dto }),
  updateAccount: (id: string, dto: Partial<CreateMailAccountDto>) =>
    apiClient<MailAccount>(`/admin/mail/accounts/${id}`, { method: 'PATCH', body: dto }),
  deleteAccount: (id: string) => apiClient<void>(`/admin/mail/accounts/${id}`, { method: 'DELETE' }),

  // Connection tests
  testSmtp: (id: string) => apiClient<{ success: boolean; message: string }>(`/admin/mail/accounts/${id}/test-smtp`, { method: 'POST' }),
  testImap: (id: string) => apiClient<{ success: boolean; message: string }>(`/admin/mail/accounts/${id}/test-imap`, { method: 'POST' }),

  // Inbox & Sync & Thread Details
  getInbox: (params: QueryInboxParams = {}) =>
    apiClientPaginated<MailMessage>('/admin/mail/inbox', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getMessage: (id: string) => apiClient<MailMessage>(`/admin/mail/messages/${id}`),

  getThreadDetails: (id: string) =>
    apiClient<{ thread: MailThread & { internalNotes?: MailInternalNote[] }; messages: MailMessage[] }>(`/admin/mail/threads/${id}`),

  getContactHistory: (email: string) => apiClient<MailMessage[]>('/admin/mail/history', { params: { email } }),

  syncMailbox: (mailboxId?: string) => apiClient<{ success: boolean; message: string }>('/admin/mail/sync', { method: 'POST', body: { mailboxId } }),

  // Composers
  sendMail: (dto: SendMailDto) => apiClient<MailMessage>('/admin/mail/send', { method: 'POST', body: dto }),
  replyMail: (dto: ReplyMailDto) => apiClient<MailMessage>('/admin/mail/reply', { method: 'POST', body: dto }),
  forwardMail: (dto: ForwardMailDto) => apiClient<MailMessage>('/admin/mail/forward', { method: 'POST', body: dto }),

  // Internal Notes
  createInternalNote: (threadId: string, note: string, messageId?: string | null) =>
    apiClient<MailInternalNote>(`/admin/mail/threads/${threadId}/internal-notes`, {
      method: 'POST',
      body: { note, messageId },
    }),
}
