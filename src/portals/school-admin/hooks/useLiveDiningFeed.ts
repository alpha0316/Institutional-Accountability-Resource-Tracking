import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import type { ApiResponse } from '../../../lib/axios'
import type { MealValidation } from '../../../types'

export type FeedFilter = 'all' | 'served' | 'duplicate' | 'flagged' | 'invalid_card' | 'inactive_student'

export const filterLabels: Record<FeedFilter, string> = {
  all: 'All Logs', served: 'Served', duplicate: 'Duplicate', flagged: 'Flagged',
  invalid_card: 'Invalid Card', inactive_student: 'Inactive Student',
}

export interface FeedRow {
  id: string
  studentName: string
  cardNumber: string
  time: string
  date: string
  mealSession: string
  status: FeedFilter
}

function mealSessionFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 11) return 'Breakfast'
  if (hour < 15) return 'Lunch'
  return 'Dinner'
}

function toRow(v: MealValidation): FeedRow {
  const scanned = new Date(v.scanTime)
  const isToday = scanned.toDateString() === new Date().toDateString()
  return {
    id: v.id,
    studentName: v.studentName,
    cardNumber: v.cardNumber,
    time: scanned.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: isToday ? 'Today' : scanned.toLocaleDateString(),
    mealSession: mealSessionFor(scanned),
    status: v.isDuplicate ? 'duplicate'
      : v.rejectionReason === 'unknown_card' ? 'invalid_card'
      : v.rejectionReason === 'inactive_student' ? 'inactive_student'
      : v.isFlagged ? 'flagged'
      : 'served',
  }
}

/** Polls the real scanner feed (no WebSocket in the backend yet) — single source shared
 *  by every "Live Dining Hall Feed" table in the School Admin portal. */
export function useLiveDiningFeed() {
  const { data: validations = [] } = useQuery({
    queryKey: ['dining-hall-feed'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MealValidation[]>>('/scanner/feed')
      return res.data.data
    },
    refetchInterval: 4000,
  })

  const rows = useMemo(() => validations.map(toRow), [validations])
  const todaysRows = useMemo(() => rows.filter(r => r.date === 'Today'), [rows])
  const studentsServedToday = todaysRows.filter(r => r.status === 'served').length
  const scamFlagsToday = todaysRows.filter(r => r.status !== 'served').length

  return { rows, todaysRows, studentsServedToday, scamFlagsToday }
}
