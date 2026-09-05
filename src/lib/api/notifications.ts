import api, { type ApiResponse } from '../axios'

export type NotificationType =
  | 'claim_submitted' | 'claim_advanced' | 'claim_returned' | 'claim_rejected' | 'claim_ready_for_token'
  | 'token_issued'
  | 'payment_submitted' | 'payment_validated' | 'payment_released' | 'payment_rejected'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  relatedId?: string
  read: boolean
  createdAt: string
}

export async function listNotifications(): Promise<AppNotification[]> {
  const res = await api.get<ApiResponse<AppNotification[]>>('/notifications')
  return res.data.data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all')
}
