import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from '../lib/api/notifications'
import { useAuthStore } from '../store/authStore'

/** Shared by every portal's notification bell (wired once, in PageHeader) — polls the
 *  signed-in role's office/account for real notices and logs each new one to the console
 *  as it's first seen, so the handoff between offices/actors is visible while presenting. */
export function useNotifications() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const queryClient = useQueryClient()
  const seenIds = useRef<Set<string> | null>(null)

  const { data: notifications = [], isSuccess } = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    enabled: isAuthenticated,
    refetchInterval: 4000,
  })

  useEffect(() => {
    // Wait for the first real fetch — data defaults to [] before that resolves, and seeding
    // the baseline from that placeholder would make every pre-existing notification look
    // "new" the moment the real list loads a moment later.
    if (!isSuccess) return
    if (seenIds.current === null) {
      // First real load — establish the baseline without logging a flood of history.
      seenIds.current = new Set(notifications.map(n => n.id))
      return
    }
    const fresh = notifications.filter(n => !seenIds.current!.has(n.id))
    for (const n of fresh) {
      seenIds.current.add(n.id)
      console.log(`[IARTS notification] ${n.type} — ${n.title}: ${n.message}`)
    }
  }, [notifications, isSuccess])

  const unreadCount = notifications.filter(n => !n.read).length

  async function markRead(id: string) {
    await markNotificationRead(id)
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return { notifications, unreadCount, markRead, markAllRead }
}

export type { AppNotification }
