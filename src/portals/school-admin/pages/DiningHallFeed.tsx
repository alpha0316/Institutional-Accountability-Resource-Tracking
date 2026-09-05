import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { VALIDATION_STATUS_MAP } from '../../../lib/mockData'
import { useLiveDiningFeed, filterLabels, type FeedFilter, type FeedRow } from '../hooks/useLiveDiningFeed'

// Population-side figures — Student Registry stays mock data for now, so these
// don't have a real denominator to compute against yet.
const ELIGIBLE_STUDENTS = 2850
const UTILIZATION_RATE = '64.6%'

export default function DiningHallFeed() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FeedFilter>('all')

  const { rows, studentsServedToday, scamFlagsToday } = useLiveDiningFeed()

  const STATS = [
    { label: 'Students Served',   value: studentsServedToday, description: 'Scanned in today across all halls', tone: 'bg-[#f7fbff]' },
    { label: 'Eligible Students', value: ELIGIBLE_STUDENTS,   description: 'Enrolled and active this semester', tone: 'bg-[#f7fdf9]' },
    { label: 'Utilization Rate',  value: UTILIZATION_RATE,    description: 'Meals served vs. eligible students', tone: 'bg-[#fcf8f5]' },
    { label: 'Scam Flags Today',  value: scamFlagsToday,      description: 'Suspicious activity flagged.', tone: 'bg-[#fff7f8]', alert: true },
  ]

  const filtered = useMemo(() => {
    if (filter === 'all') return rows
    return rows.filter(r => r.status === filter)
  }, [filter, rows])

  function rowActions(): DropdownMenuItem[] {
    return [
      { label: 'View Student',    onClick: () => {} },
      { label: 'View Card',       onClick: () => {} },
      { label: 'Mark as Reviewed',onClick: () => {} },
    ]
  }

  const columns: Column<FeedRow>[] = [
    {
      key: 'time', label: 'Time / Date', width: '16%',
      render: (v) => (
        <div>
          <p className="text-[15px] font-normal leading-[18px]">{v.time}</p>
          <p className="mt-[4px] text-[12px] leading-none text-[#9a9a9a]">{v.date}</p>
        </div>
      ),
    },
    {
      key: 'studentName', label: 'Student Name', width: '20%', primaryKey: true,
      render: (v) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{v.studentName}</span>,
    },
    { key: 'cardNumber',  label: 'Card Number', width: '16%', render: (v) => v.cardNumber },
    { key: 'mealSession', label: 'Session',     width: '14%', render: (v) => v.mealSession },
    {
      key: 'status', label: 'Status', width: '14%',
      render: (v) => {
        const m = VALIDATION_STATUS_MAP[v.status]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Dining Hall Feed" />
      <div className="pl-[36px] pr-[20px] pt-[2px]">
        <StatCardGroup>
          {STATS.map((stat) => (
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
            />
          ))}
        </StatCardGroup>

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
