import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { useScanStore, type ScanLog } from '../../../store/scanStore'

type FeedFilter = 'all' | 'served' | 'duplicate' | 'flagged'

const filterLabels: Record<FeedFilter, string> = {
  all: 'All', served: 'Success', duplicate: 'Duplicate', flagged: 'Scam Attempts',
}

export default function DiningHallFeed() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [scanInput, setScanInput] = useState('')
  const scans = useScanStore(s => s.scans)
  const addScan = useScanStore(s => s.addScan)
  const [lastResult, setLastResult] = useState<ScanLog | null>(null)

  const servedCount = scans.filter(s => s.status === 'served').length
  const duplicateCount = scans.filter(s => s.status === 'duplicate').length
  const flaggedCount = scans.filter(s => s.status === 'flagged').length

  function handleScan() {
    const input = scanInput.trim()
    if (!input) return
    const result = addScan(input)
    setLastResult(result)
    setScanInput('')
  }

  const displayScans = filter === 'all' ? [...scans] : scans.filter(s => s.status === filter)

  function rowActions(_row: ScanLog): DropdownMenuItem[] {
    return [
      { label: 'View Student', onClick: () => navigate('/admin/students') },
      { label: 'View Card',    onClick: () => navigate('/admin/cards') },
    ]
  }

  const columns: Column<ScanLog>[] = [
    { key: 'time', label: 'Time', width: '12%', render: (v) => <span className="text-[14px] text-[#3f3f3f]">{v.time}</span> },
    {
      key: 'studentName', label: 'Student', width: '18%', primaryKey: true,
      render: (v) => <span className="text-[14px] font-normal leading-none text-[#4ea4ff]">{v.studentName}</span>,
    },
    { key: 'studentId',   label: 'Student ID', width: '16%', render: (v) => v.studentId },
    { key: 'cardUid',     label: 'Card ID',    width: '14%', render: (v) => v.cardUid },
    { key: 'mealSession', label: 'Session',    width: '12%', render: (v) => v.mealSession },
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
      render: (v) => v.status === 'flagged' ? <Badge variant="red">Scam Attempt</Badge>
        : v.status === 'duplicate' ? <Badge variant="orange">Duplicate</Badge>
        : <Badge variant="green">Success</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader title="Dining Hall Feed" />
      <div className="pl-[36px] pr-[20px] pt-[2px]">

        <StatCardGroup>
          <StatCard label="Students Served" value={String(servedCount)} sub="Successfully validated today" accent="bg-gradient-to-br from-white to-green-50/60" />
          <StatCard label="Duplicate Scans" value={String(duplicateCount)} sub="Already scanned this session" accent="bg-gradient-to-br from-white to-orange-50/60" />
          <StatCard label="Scam Flags" value={String(flaggedCount)} sub={<span className="text-[#ff3333] font-medium">Suspicious activity detected</span>} accent="bg-gradient-to-br from-white to-red-50/60" />
          <StatCard label="Total Scans" value={String(scans.length)} sub="All verifications today" accent="bg-gradient-to-br from-white to-blue-50/60" />
        </StatCardGroup>

        {/* Scan Input */}
        <div className="mt-[24px] rounded-[14px] border border-[#efefef] bg-white p-[16px]">
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[44px] flex-1 items-center gap-[10px] rounded-[10px] border border-[#e5e5e5] bg-[#fcfcfc] px-[14px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.01)]">
              <Icon name="scan" size={18} className="shrink-0 text-[#4ea4ff]" />
              <input
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Scan QR code or enter card UID..."
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#555] outline-none placeholder:text-[#aaa]"
                autoFocus
              />
            </div>
            <button onClick={handleScan} className="flex h-[44px] shrink-0 items-center gap-[8px] rounded-[10px] bg-[#4ea4ff] px-[22px] text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(78,164,255,0.3)] hover:bg-[#3d93e8]">
              <Icon name="scan" size={16} /> Scan
            </button>
          </div>

          {lastResult && (
            <div className={clsx(
              'mt-[12px] rounded-[10px] p-[12px] flex items-center gap-[10px]',
              lastResult.status === 'served' ? 'border border-[#d1fae5] bg-[#ecfdf5]'
                : lastResult.status === 'duplicate' ? 'border border-[#fef3c7] bg-[#fffbeb]'
                : 'border border-[#fee2e2] bg-[#fef2f2]'
            )}>
              <Icon name={lastResult.status === 'served' ? 'circle-check' : 'alert-triangle'} size={18}
                className={lastResult.status === 'served' ? 'text-[#10b981]' : lastResult.status === 'duplicate' ? 'text-[#df6b13]' : 'text-[#de3d36]'} />
              <div>
                <p className={clsx('text-[13px] font-semibold', lastResult.status === 'served' ? 'text-[#065f46]' : lastResult.status === 'duplicate' ? 'text-[#92400e]' : 'text-[#991b1b]')}>
                  {lastResult.studentName === 'Unknown Card' ? 'Unknown Card — Access denied'
                    : lastResult.status === 'served' ? `${lastResult.studentName} — Meal Validated`
                    : lastResult.status === 'duplicate' ? `${lastResult.studentName} — Duplicate (${lastResult.scanCount}x)`
                    : `${lastResult.studentName} — Scam Attempt (${lastResult.scanCount}x scans)`}
                </p>
                <p className="text-[11px] text-[#888] mt-[2px]">{lastResult.cardUid} · {lastResult.mealSession} · {lastResult.time}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scan Feed */}
        <section className="mt-[32px]">
          <h2 className="text-[22px] font-bold leading-[24px] text-black">Scan Feed Today</h2>
          <div className="mt-[6px] flex h-[31px] items-center justify-between">
            <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
              {(Object.keys(filterLabels) as FeedFilter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={clsx(
                  'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                  filter === f ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#7e7e7e] hover:text-[#555]'
                )}>{filterLabels[f]}</button>
              ))}
            </div>
          </div>
          <div className="mt-[12px]">
            {displayScans.length === 0 ? (
              <div className="rounded-[16px] border-[0.5px] border-black/[0.06] py-[50px] text-center">
                <Icon name="scan" size={32} className="mx-auto text-[#ccc] mb-[12px]" />
                <p className="text-[14px] text-[#aaa]">No scans recorded yet.</p>
                <p className="text-[12px] text-[#ccc] mt-[4px]">Scan a student card to begin.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={displayScans} rowKey={(v) => v.id} onRowClick={() => navigate('/admin/students')} rowActions={rowActions} />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
