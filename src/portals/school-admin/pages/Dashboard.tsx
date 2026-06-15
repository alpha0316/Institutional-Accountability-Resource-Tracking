import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import {
  MOCK_VALIDATIONS,
  VALIDATION_STATUS_MAP,
  type MockValidation,
} from '../../../lib/mockData'

type FeedFilter = 'all' | 'served' | 'duplicate' | 'flagged' | 'invalid_card' | 'inactive_student'

const filterLabels: Record<FeedFilter, string> = {
  all: 'All Logs', served: 'Served', duplicate: 'Duplicate', flagged: 'Flagged',
  invalid_card: 'Invalid Card', inactive_student: 'Inactive Student',
}

const SESSION_DATA = {
  Breakfast: { label: 'Breakfast', value: '852',  description: 'Breakfast session validations', tone: 'bg-[#f7fdf9]' },
  Lunch:     { label: 'Lunch',     value: '910',  description: 'Lunch session validations',     tone: 'bg-[#fcf8f5]' },
  Dinner:    { label: 'Dinner',    value: '673',  description: 'Dinner session validations',    tone: 'bg-[#f7fdf9]' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FeedFilter>('all')

  const isAfternoon = new Date().getHours() >= 12
  const STATS = [
    { label: 'Meals Served Today', value: '1,247', description: 'Verified scans across all halls', tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
    isAfternoon ? SESSION_DATA.Lunch     : SESSION_DATA.Breakfast,
    isAfternoon ? SESSION_DATA.Dinner    : SESSION_DATA.Lunch,
    { label: 'Fraud Flags',        value: '3',     description: 'Suspicious activity detected',   tone: 'bg-[#fff7f8]', alert: true },
  ]

  const filtered = useMemo(() => {
    if (filter === 'all') return MOCK_VALIDATIONS
    return MOCK_VALIDATIONS.filter(v => v.status === filter)
  }, [filter])

  function rowActions(_row: MockValidation): DropdownMenuItem[] {
    return [
      { label: 'View Student',    onClick: () => {} },
      { label: 'View Card',       onClick: () => {} },
      { label: 'Mark as Reviewed',onClick: () => {} },
    ]
  }

  const columns: Column<MockValidation>[] = [
    {
      key: 'studentName',
      label: 'Student Name',
      width: '20%',
      primaryKey: true,
      render: (v) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{v.studentName}</span>,
    },
    { key: 'studentId',    label: 'Student ID',    width: '16%', render: (v) => v.studentId },
    { key: 'scanPoint',    label: 'Scan Point',    width: '16%', render: (v) => v.scanPoint },
    { key: 'mealSession',  label: 'Meal Session',  width: '12%', render: (v) => v.mealSession },
    {
      key: 'time',
      label: 'Time',
      width: '16%',
      render: (v) => (
        <div>
          <p className="text-[15px] font-normal leading-[18px]">{v.time}</p>
          <p className="mt-[4px] text-[12px] leading-none text-[#9a9a9a]">{v.date}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (v) => {
        const m = VALIDATION_STATUS_MAP[v.status]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
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

        <section className="mt-[52px]">
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
