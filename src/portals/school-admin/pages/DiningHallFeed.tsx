import { useState, useCallback } from 'react'
import { Search, ScanLine, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import {
  MOCK_STUDENTS,
  MOCK_CARDS,
} from '../../../lib/mockData'

type FeedFilter = 'all' | 'served' | 'duplicate' | 'flagged'

interface ScanRecord {
  id: number
  studentName: string
  studentId: string
  scanPoint: string
  time: string
  date: string
  mealSession: string
  status: 'served' | 'duplicate' | 'flagged'
  scanCount: number
}

const STATS = [
  { label: 'Students Served',  value: '1,842',  description: 'Scanned in today across all halls',   tone: 'bg-[#f7fbff]', trend: '' },
  { label: 'Eligible Students',value: '2,850',  description: 'Enrolled and active this semester',   tone: 'bg-[#f7fdf9]' },
  { label: 'Utilization Rate', value: '64.6%',  description: 'Meals served vs. eligible students',  tone: 'bg-[#fcf8f5]' },
  { label: 'Scam Flags Today', value: '0',      description: 'Suspicious activity flagged.',         tone: 'bg-[#fff7f8]', alert: true },
]

const filterLabels: Record<FeedFilter, string> = {
  all: 'All Scans', served: 'Success', duplicate: 'Duplicate', flagged: 'Scam Attempts',
}

const MEAL_SESSIONS = ['Breakfast', 'Lunch', 'Dinner']
const SCAN_POINTS = ['Main Refectory', 'Annex Refectory']

function now() {
  const d = new Date()
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function DiningHallFeed() {
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [scanInput, setScanInput] = useState('')
  const [mealSession, setMealSession] = useState('Breakfast')
  const [scanPoint, setScanPoint] = useState('Main Refectory')
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [scanResult, setScanResult] = useState<{ status: 'served' | 'duplicate' | 'flagged'; count: number; name: string; id: string } | null>(null)
  const [nextId, setNextId] = useState(100)

  const scanCounts = new Map<string, number>()
  scans.forEach(s => {
    const key = `${s.studentId}-${s.mealSession}`
    scanCounts.set(key, (scanCounts.get(key) ?? 0) + 1)
  })

  const scamFlags = scans.filter(s => s.status === 'flagged').length

  const handleScan = useCallback(() => {
    const input = scanInput.trim()
    if (!input) return

    let student = MOCK_STUDENTS.find(
      s => s.studentId === input || s.admissionNumber === input
    )
    if (!student) {
      const card = MOCK_CARDS.find(c => c.cardUid === input)
      if (card) {
        student = MOCK_STUDENTS.find(s => s.studentId === card.studentId)
      }
    }
    if (!student) {
      setScanResult({ status: 'flagged', count: 0, name: 'Unknown Card', id: input })
      return
    }

    const key = `${student.studentId}-${mealSession}`
    const prevCount = scanCounts.get(key) ?? 0
    const newCount = prevCount + 1

    let status: 'served' | 'duplicate' | 'flagged'
    if (newCount === 1) {
      status = 'served'
    } else if (newCount <= 3) {
      status = 'duplicate'
    } else {
      status = 'flagged'
    }

    const record: ScanRecord = {
      id: nextId,
      studentName: student.fullName,
      studentId: student.studentId,
      scanPoint,
      time: now(),
      date: 'Today',
      mealSession,
      status,
      scanCount: newCount,
    }

    setScans(prev => [record, ...prev])
    setNextId(n => n + 1)
    setScanResult({ status, count: newCount, name: student.fullName, id: student.studentId })
    setScanInput('')

    setTimeout(() => setScanResult(null), 4000)
  }, [scanInput, mealSession, scanPoint, scanCounts, nextId])

  const displayScans = filter === 'all' ? [...scans] : scans.filter(s => s.status === filter)

  function rowActions(_row: ScanRecord): DropdownMenuItem[] {
    return [
      { label: 'View Student',    onClick: () => {} },
      { label: 'View Card',       onClick: () => {} },
      { label: 'Mark as Reviewed',onClick: () => {} },
      { label: 'Report Issue',    onClick: () => {}, destructive: _row.status === 'flagged' || _row.status === 'duplicate' },
    ]
  }

  const columns: Column<ScanRecord>[] = [
    {
      key: 'time', label: 'Time / Date', width: '14%',
      render: (v) => (
        <div>
          <p className="text-[15px] font-normal leading-[18px]">{v.time}</p>
          <p className="mt-[4px] text-[12px] leading-none text-[#9a9a9a]">Date: {v.date}</p>
        </div>
      ),
    },
    {
      key: 'studentName', label: 'Student Name', width: '18%', primaryKey: true,
      render: (v) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{v.studentName}</span>,
    },
    { key: 'studentId',   label: 'Student ID', width: '16%', render: (v) => v.studentId },
    { key: 'scanPoint',   label: 'Scan Point', width: '14%', render: (v) => v.scanPoint },
    { key: 'mealSession', label: 'Session',    width: '11%', render: (v) => v.mealSession },
    {
      key: 'scanCount', label: '#', width: '6%', align: 'center',
      render: (v) => (
        <span className={v.scanCount >= 4 ? 'text-[#de3d36] font-semibold' : v.scanCount > 1 ? 'text-[#df6b13] font-semibold' : 'text-[#10b981] font-semibold'}>
          {v.scanCount}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', width: '14%',
      render: (v) => {
        if (v.status === 'flagged') return <Badge variant="red">Scam Attempt</Badge>
        if (v.status === 'duplicate') return <Badge variant="orange">Duplicate</Badge>
        return <Badge variant="green">Success</Badge>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Dining Hall Feed" />
      <div className="pl-[36px] pr-[20px] pt-[2px]">
        <div className="grid grid-cols-4 gap-[30px]">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center justify-between rounded-[7px] px-[5px]', stat.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{stat.label}</span>
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">
                  {i === 3 ? scamFlags : stat.value}
                </p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', stat.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Scan Card Simulator ──────────────────────────────────── */}
        <section className="mt-[28px]">
          <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
            <div className="flex items-center gap-[16px]">
              {/* Scan input */}
              <div className="flex flex-1 items-center gap-[10px]">
                <div className="flex h-[42px] flex-1 items-center gap-[10px] rounded-[10px] border border-[#e5e5e5] bg-[#fcfcfc] px-[14px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.01)]">
                  <ScanLine size={18} strokeWidth={2} className="shrink-0 text-[#4ea4ff]" />
                  <input
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    placeholder="Scan or enter student ID / card UID..."
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#555] outline-none placeholder:text-[#aaa]"
                  />
                </div>
                <select
                  value={scanPoint}
                  onChange={(e) => setScanPoint(e.target.value)}
                  className="h-[42px] rounded-[10px] border border-[#e5e5e5] bg-white px-[10px] text-[13px] outline-none"
                >
                  {SCAN_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={mealSession}
                  onChange={(e) => setMealSession(e.target.value)}
                  className="h-[42px] rounded-[10px] border border-[#e5e5e5] bg-white px-[10px] text-[13px] outline-none"
                >
                  {MEAL_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={handleScan}
                className="flex h-[42px] shrink-0 items-center gap-[8px] rounded-[10px] bg-[#4ea4ff] px-[22px] text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(78,164,255,0.3)] transition-colors hover:bg-[#3d93e8]"
              >
                <ScanLine size={16} /> Scan Card
              </button>
            </div>

            {/* Scan result banner */}
            {scanResult && (
              <div className={clsx(
                'mt-[16px] flex items-center gap-[12px] rounded-[10px] p-[14px]',
                scanResult.status === 'served'
                  ? 'border border-[#d1fae5] bg-[#ecfdf5]'
                  : scanResult.status === 'duplicate'
                    ? 'border border-[#fef3c7] bg-[#fffbeb]'
                    : 'border border-[#fee2e2] bg-[#fef2f2]'
              )}>
                {scanResult.status === 'served'
                  ? <CheckCircle size={22} className="shrink-0 text-[#10b981]" />
                  : scanResult.status === 'duplicate'
                    ? <AlertTriangle size={22} className="shrink-0 text-[#df6b13]" />
                    : <ShieldAlert size={22} className="shrink-0 text-[#de3d36]" />
                }
                <div>
                  <p className={clsx(
                    'text-[14px] font-semibold',
                    scanResult.status === 'served' ? 'text-[#065f46]'
                      : scanResult.status === 'duplicate' ? 'text-[#92400e]'
                        : 'text-[#991b1b]'
                  )}>
                    {scanResult.status === 'served'
                      ? `Meal Validated — ${scanResult.name}`
                      : scanResult.status === 'duplicate'
                        ? `Duplicate Scan (${scanResult.count}x) — ${scanResult.name} has already scanned this session`
                        : scanResult.name === 'Unknown Card'
                          ? 'Unknown Card — Access denied. Fraud alert generated.'
                          : `Scam Attempt — ${scanResult.name} has scanned ${scanResult.count} times this session. Flagged for review.`
                    }
                  </p>
                  <p className="mt-[2px] text-[12px] text-[#888]">
                    {scanResult.status === 'served'
                      ? 'First scan accepted. Meal count recorded.'
                      : scanResult.status === 'duplicate'
                        ? 'Meal already recorded. Only 1 validation allowed per session.'
                        : 'Suspicious behaviour detected. Compliance team notified.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Live Feed Table ──────────────────────────────────────── */}
        <section className="mt-[32px]">
          <h2 className="text-[22px] font-bold leading-[24px] text-black">Live Dining Hall Feed Today</h2>
          <div className="mt-[6px] flex h-[31px] items-center justify-between">
            <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
              {(Object.keys(filterLabels) as FeedFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                    filter === f ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#7e7e7e] hover:text-[#555]'
                  )}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>
            <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
              <Search size={15} strokeWidth={2.4} className="shrink-0 text-[#767676]" />
              <input placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]" />
            </div>
          </div>
          <div className="mt-[12px]">
            {displayScans.length === 0 && scans.length === 0 ? (
              <div className="rounded-[16px] border-[0.5px] border-black/[0.06] py-[50px] text-center">
                <ScanLine size={32} className="mx-auto text-[#ccc] mb-[12px]" />
                <p className="text-[14px] text-[#aaa]">No scans recorded yet.</p>
                <p className="text-[12px] text-[#ccc] mt-[4px]">Scan a student card to begin.</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={displayScans}
                rowKey={(v) => v.id}
                rowActions={rowActions}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
