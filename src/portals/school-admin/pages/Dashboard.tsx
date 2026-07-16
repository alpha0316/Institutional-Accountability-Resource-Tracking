import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { useGovClaimsStore } from '../../gov/govClaimsStore'
import { useScanStore, type ScanLog } from '../../../store/scanStore'

type FeedFilter = 'all' | 'served' | 'duplicate' | 'flagged'

const filterLabels: Record<FeedFilter, string> = {
  all: 'All Logs', served: 'Served', duplicate: 'Duplicate', flagged: 'Flagged',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const claims = useGovClaimsStore(s => s.claims)
  const schoolClaim = claims.find(c => c.schoolId === 'SCH-001')
  const scans = useScanStore(s => s.scans)

  const served = scans.filter(s => s.status === 'served').length
  const duplicates = scans.filter(s => s.status === 'duplicate').length
  const flagged = scans.filter(s => s.status === 'flagged').length

  const breakfastScans = scans.filter(s => s.mealSession === 'Breakfast' && s.status === 'served').length
  const lunchScans = scans.filter(s => s.mealSession === 'Lunch' && s.status === 'served').length

  const STATS = [
    { label: 'Meals Served Today', value: String(served), description: 'Verified scans across all halls', tone: 'bg-[#f7fbff]' },
    { label: 'Breakfast', value: String(breakfastScans), description: 'Breakfast session', tone: 'bg-[#f7fdf9]' },
    { label: 'Lunch', value: String(lunchScans), description: 'Lunch session', tone: 'bg-[#fcf8f5]' },
    { label: 'Fraud Flags', value: String(flagged + duplicates), description: 'Suspicious activity detected', tone: 'bg-[#fff7f8]', alert: true },
  ]

  const filtered = useMemo(() => {
    const all = [...scans]
    if (filter === 'all') return all
    return all.filter(s => s.status === filter)
  }, [filter, scans])

  function rowActions(_row: ScanLog): DropdownMenuItem[] {
    return [
      { label: 'View Student', onClick: () => navigate('/admin/students') },
      { label: 'View Card',    onClick: () => navigate('/admin/cards') },
    ]
  }

  const columns: Column<ScanLog>[] = [
    { key: 'time', label: 'Time', width: '12%', render: (v) => <span className="text-[14px] text-[#3f3f3f]">{v.time}</span> },
    {
      key: 'studentName', label: 'Name', width: '18%', primaryKey: true,
      render: (v) => <span className="text-[14px] font-normal leading-none text-[#4ea4ff]">{v.studentName}</span>,
    },
    { key: 'studentId',   label: 'Student ID', width: '16%', render: (v) => v.studentId },
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
      <PageHeader
        title="Overview"
      />

      <div className="pl-[36px] pr-[20px] pt-[2px]">
        <StatCardGroup>
          {STATS.map((stat: any) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              sub={stat.alert
                ? <span className="font-medium text-[#ff3333]">{stat.description}</span>
                : stat.description
              }
              accent={
                stat.tone === 'bg-[#f7fbff]' ? 'bg-gradient-to-br from-white to-blue-50/50' :
                stat.tone === 'bg-[#f7fdf9]' ? 'bg-gradient-to-br from-white to-green-50/50' :
                stat.tone === 'bg-[#fcf8f5]' ? 'bg-gradient-to-br from-white to-orange-50/50' :
                'bg-gradient-to-br from-white to-red-50/50'
              }
              badge={stat.trend
                ? <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">{stat.trend}</span>
                : undefined
              }
              onClick={stat.alert ? () => navigate('/admin/fraud') : undefined}
            />
          ))}
        </StatCardGroup>

        {/* Live Gov Claim Status */}
        {schoolClaim && (
          <div className="mt-[24px] rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] p-[14px] flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] bg-[#3b82f6]">
                <Icon name="building" size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1e40af]">Semester Claim — {schoolClaim.claimId}</p>
                <p className="text-[11px] text-[#3b82f6]">{schoolClaim.semester} · {schoolClaim.claimValue} · Stage: {schoolClaim.stage.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <Badge variant={schoolClaim.stage === 'closed' ? 'green' : schoolClaim.stage === 'token_generated' || schoolClaim.stage === 'supplier_redemption' ? 'blue' : 'orange'}>
              {schoolClaim.stage === 'closed' ? 'Settled' : schoolClaim.stage === 'token_generated' ? 'Token Issued' : schoolClaim.stage === 'supplier_redemption' ? 'Redeeming' : 'Under Review'}
            </Badge>
          </div>
        )}

        <section className="mt-[40px]">
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
              <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
              <input placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]" />
            </div>
          </div>
          <div className="mt-[12px]">
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(v) => v.id}
              rowActions={rowActions}
              onRowClick={() => navigate('/admin/students')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
