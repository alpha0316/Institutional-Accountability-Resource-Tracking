import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
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

const STATS = [
  { label: 'Meals Served Today',  value: '1,247', description: 'Verified scans across all halls',   tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Breakfast',           value: '852',   description: 'Breakfast session validations',     tone: 'bg-[#f7fdf9]' },
  { label: 'Lunch',               value: '910',   description: 'Lunch session validations',         tone: 'bg-[#fcf8f5]' },
  { label: 'Fraud Flags',         value: '3',     description: 'Suspicious activity detected',      tone: 'bg-[#fff7f8]', alert: true },
]

export default function Dashboard() {
  const [filter, setFilter] = useState<FeedFilter>('all')

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
        actions={<Button><Plus size={14} />Enroll Student</Button>}
      />

      <div className="pl-[36px] pr-[20px] pt-[2px]">
        <div className="grid grid-cols-4 gap-[30px]">
          {STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center justify-between rounded-[7px] px-[5px]', stat.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{stat.label}</span>
                {stat.trend && <span className="shrink-0 text-[13px] font-semibold leading-none text-[#5fc98e]">{stat.trend}</span>}
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">{stat.value}</p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', stat.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

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
              <Search size={15} strokeWidth={2.4} className="shrink-0 text-[#767676]" />
              <input placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]" />
            </div>
          </div>
          <div className="mt-[12px]">
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(v) => v.id}
              rowActions={rowActions}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
