import { create } from 'zustand'
import { MOCK_CARDS } from '../lib/mockData'

export interface ScanLog {
  id: number
  cardUid: string
  studentName: string
  studentId: string
  time: string
  date: string
  mealSession: string
  status: 'served' | 'duplicate' | 'flagged'
  scanCount: number
}

let nextId = 1000

function now() {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getMealSession(): string {
  const h = new Date().getHours()
  if (h < 10) return 'Breakfast'
  if (h < 15) return 'Lunch'
  return 'Dinner'
}

interface ScanStore {
  scans: ScanLog[]
  addScan: (code: string) => ScanLog
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scans: [],

  addScan: (code: string) => {
    const scanCounts = new Map<string, number>()
    get().scans.forEach(s => {
      const key = `${s.studentId}-${s.mealSession}`
      scanCounts.set(key, (scanCounts.get(key) ?? 0) + 1)
    })

    const card = MOCK_CARDS.find(c => c.cardUid === code || c.studentId === code)
    const session = getMealSession()

    if (!card) {
      const record: ScanLog = {
        id: nextId++, cardUid: code, studentName: 'Unknown Card',
        studentId: '—', time: now(), date: 'Today', mealSession: session,
        status: 'flagged', scanCount: 0,
      }
      set(state => ({ scans: [record, ...state.scans] }))
      return record
    }

    const key = `${card.studentId}-${session}`
    const prevCount = scanCounts.get(key) ?? 0
    const newCount = prevCount + 1

    let status: 'served' | 'duplicate' | 'flagged'
    if (newCount === 1) status = 'served'
    else if (newCount <= 3) status = 'duplicate'
    else status = 'flagged'

    const record: ScanLog = {
      id: nextId++, cardUid: code, studentName: card.studentName,
      studentId: card.studentId, time: now(), date: 'Today',
      mealSession: session, status, scanCount: newCount,
    }

    set(state => ({ scans: [record, ...state.scans] }))
    return record
  },
}))
