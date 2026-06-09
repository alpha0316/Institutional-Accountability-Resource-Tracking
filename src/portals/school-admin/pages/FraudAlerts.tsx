import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import {
  MOCK_FRAUD_ALERTS,
  SEVERITY_MAP,
  type MockFraudAlert,
} from '../../../lib/mockData'

type TimeFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'semester'
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium'

const STATS = [
  { label: 'Open Alerts',         value: '18',         description: 'Unresolved alerts across all categories', tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Critical Alerts',     value: '3',          description: 'Require immediate attention',             tone: 'bg-[#f7fdf9]' },
  { label: 'Potential Exposure',  value: 'GHS 42,600', description: 'Estimated reimbursement at risk',         tone: 'bg-[#fcf8f5]' },
  { label: 'Claims Blocked',      value: '2',          description: 'Reports held due to alerts.',             tone: 'bg-[#fff7f8]', alert: true },
]

const filterLabels: Record<TimeFilter, string> = {
  all: 'All', today: 'Today', yesterday: 'Yesterday', last7: 'Last 7 Days', semester: 'This Semester',
}

export default function FraudAlerts() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')

  const filtered = useMemo(() => {
    let rows = MOCK_FRAUD_ALERTS
    if (severityFilter !== 'all') rows = rows.filter(a => a.severity === severityFilter)
    return rows
  }, [severityFilter])

  function rowActions(alert: MockFraudAlert): DropdownMenuItem[] {
    return [
      { label: 'View Details',          onClick: () => {} },
      { label: 'Investigate',           onClick: () => {}, disabled: alert.status === 'resolved' },
      { label: 'Mark as Resolved',      onClick: () => {}, disabled: alert.status === 'resolved' },
      { label: 'Escalate',              onClick: () => {}, destructive: alert.severity === 'critical' },
    ]
  }

  const columns: Column<MockFraudAlert>[] = [
    {
      key: 'alertId',
      label: 'Alert ID',
      width: '13%',
      primaryKey: true,
      render: (a) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{a.alertId}</span>,
    },
    { key: 'category',     label: 'Category',    width: '13%', render: (a) => a.category },
    { key: 'title',        label: 'Title',       width: '28%', render: (a) => <span className="block truncate">{a.title}</span> },
    { key: 'detectedAt',   label: 'Detected',    width: '14%', render: (a) => a.detectedAt },
    { key: 'potentialExposure', label: 'Exposure', width: '12%', render: (a) => a.potentialExposure },
    {
      key: 'severity',
      label: 'Severity',
      width: '11%',
      render: (a) => {
        const m = SEVERITY_MAP[a.severity]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '9%',
      render: (a) => (
        <Badge variant={a.status === 'open' ? 'red' : a.status === 'investigating' ? 'orange' : 'green'}>
          {a.status === 'open' ? 'Open' : a.status === 'investigating' ? 'Investigating' : 'Resolved'}
        </Badge>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Fraud Alerts" />

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
          <h2 className="text-[22px] font-bold leading-[24px] text-black">Active Fraud Alerts</h2>

          <div className="mt-[6px] flex h-[31px] items-center justify-between">
            <div className="flex items-center gap-[8px]">
              <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
                {(Object.keys(filterLabels) as TimeFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={clsx(
                      'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                      timeFilter === f ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#7e7e7e] hover:text-[#555]'
                    )}
                  >
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
              <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'critical', label: 'Critical' },
                  { key: 'high', label: 'High' },
                  { key: 'medium', label: 'Medium' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSeverityFilter(f.key as SeverityFilter)}
                    className={clsx(
                      'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                      severityFilter === f.key ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#7e7e7e] hover:text-[#555]'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
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
              rowKey={(a) => a.id}
              rowActions={rowActions}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
