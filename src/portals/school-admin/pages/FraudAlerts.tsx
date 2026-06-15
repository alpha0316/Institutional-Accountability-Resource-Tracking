import { useState, useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import {
  MOCK_FRAUD_ALERTS,
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
      width: '16%',
      primaryKey: true,
      render: (a) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{a.alertId}</span>,
    },
    { key: 'category',   label: 'Category', width: '16%', render: (a) => a.category },
    { key: 'title',      label: 'Title',    width: '36%', render: (a) => <span className="block truncate">{a.title}</span> },
    { key: 'detectedAt', label: 'Detected', width: '20%', render: (a) => a.detectedAt },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
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
              badge={stat.trend
                ? <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">{stat.trend}</span>
                : undefined
              }
            />
          ))}
        </StatCardGroup>

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
              <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
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
