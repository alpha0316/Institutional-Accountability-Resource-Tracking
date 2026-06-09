import { useState, useMemo } from 'react'
import { Plus, Search, FileText, Users, Settings, AlertTriangle, Package, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import {
  MOCK_DAILY_REPORTS,
  REIMBURSEMENT_BREAKDOWN,
  ATTENDANCE_SESSIONS,
  WORKFLOW_COLUMNS,
  REPORT_STATUS_MAP,
  type MockDailyReport,
} from '../../../lib/mockData'

type PageTab = 'overview' | 'attendance' | 'supply' | 'financial' | 'workflow' | 'claim'
type ModalTab = 'overview' | 'operational' | 'risks' | 'finances' | 'logs'

const PAGE_TABS: { label: string; value: PageTab }[] = [
  { label: 'Overview',           value: 'overview'    },
  { label: 'Meal Attendance',    value: 'attendance'  },
  { label: 'Supply Usage',       value: 'supply'      },
  { label: 'Financial Summary',  value: 'financial'   },
  { label: 'Approval Workflow',  value: 'workflow'    },
  { label: 'Claim Readiness',    value: 'claim'       },
]

const MODAL_TABS: { label: string; value: ModalTab; count?: number }[] = [
  { label: 'Overview',     value: 'overview'    },
  { label: 'Operational',  value: 'operational' },
  { label: 'Risks',        value: 'risks',       count: 4 },
  { label: 'Finances',     value: 'finances'    },
  { label: 'Logs',         value: 'logs'        },
]

const RISK_TRIGGERS = [
  { label: 'Attendance Spike',         icon: Users,          bg: 'bg-blue-500'   },
  { label: 'Duplicate Scan Pattern',   icon: Settings,       bg: 'bg-blue-500'   },
  { label: 'Dining Hall Imbalance',    icon: AlertTriangle,  bg: 'bg-red-500'    },
  { label: 'Inventory Variance',       icon: Package,        bg: 'bg-green-600'  },
  { label: 'Session Timing Conflict',  icon: Clock,          bg: 'bg-violet-500' },
]

const REVIEW_STEPS = ['Operational Review', 'Compliance Review', 'Fraud Analysis', 'Financial Validation']

const OVERVIEW_STATS = [
  { label: 'Meals Served',             value: '2,413',      description: 'Verified scans today',               tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Estimated Reimbursement',  value: 'GHS 41,820', description: 'Based on today\'s verified meals',    tone: 'bg-[#f7fdf9]' },
  { label: 'Supplies Consumed',        value: '38',         description: 'Line Items',                          tone: 'bg-[#fcf8f5]' },
  { label: 'Fraud Alerts',             value: '2',          description: 'Cards that are no longer valid.',     tone: 'bg-[#fff7f8]', alert: true },
]

const FINANCIAL_STATS = [
  { label: 'Daily Reimb. Estimate',  value: 'GHS 41,820', description: 'Reimbursable value from meals',         tone: 'bg-[#f7fbff]' },
  { label: 'Semester-to-Date',       value: 'GHS 812,400',description: 'Eligible reimbursement accumulated',    tone: 'bg-[#f7fdf9]' },
  { label: 'Policy Adjustments',     value: 'GHS -3,500', description: 'Automatic deductions applied',          tone: 'bg-[#fcf8f5]' },
  { label: 'Net Eligible Amount',    value: 'GHS 38,320', description: 'Amount added to semester claim',        tone: 'bg-[#fff7f8]' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatRow({ stats }: { stats: typeof OVERVIEW_STATS }) {
  return (
    <div className="grid grid-cols-4 gap-[30px]">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <div className={clsx('flex h-[25px] items-center justify-between rounded-[7px] px-[5px]', stat.tone)}>
            <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{stat.label}</span>
            {'trend' in stat && stat.trend && <span className="shrink-0 text-[13px] font-semibold leading-none text-[#5fc98e]">{stat.trend}</span>}
          </div>
          <div className="mt-[29px]">
            <p className="text-[26px] font-semibold leading-none text-[#414141]">{stat.value}</p>
            <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', 'alert' in stat && stat.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionSearch() {
  return (
    <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
      <Search size={15} strokeWidth={2.4} className="shrink-0 text-[#767676]" />
      <input placeholder="Search reports..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]" />
    </div>
  )
}

function SidebarDetailRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[14px] last:border-0">
      <span className="text-[14px] text-[#888]">{label}</span>
      <span className={clsx('text-[14px] font-semibold', valueClass || 'text-[#111]')}>{value}</span>
    </div>
  )
}

export default function MealReports() {
  const [pageTab, setPageTab] = useState<PageTab>('overview')
  const [selectedReport, setSelectedReport] = useState<MockDailyReport | null>(null)
  const [modalTab, setModalTab] = useState<ModalTab>('overview')

  function openReport(r: MockDailyReport) {
    setSelectedReport(r)
    setModalTab('overview')
  }

  function closeReport() { setSelectedReport(null) }

  function reportActions(report: MockDailyReport): DropdownMenuItem[] {
    return [
      { label: 'View Details',          onClick: () => openReport(report) },
      { label: 'Export PDF',            onClick: () => {} },
      { label: 'Export Excel',          onClick: () => {} },
      { label: 'Approve Report',        onClick: () => {}, disabled: report.workflowStage === 'claim_eligible' },
      { label: 'Lock Report',           onClick: () => {}, disabled: report.workflowStage !== 'approve_lock' },
    ]
  }

  // ── Report columns ──
  const reportColumns: Column<MockDailyReport>[] = [
    { key: 'reportId',  label: 'Report ID',   width: '15%', primaryKey: true, render: (r) => r.reportId },
    { key: 'date',      label: 'Date',         width: '14%', render: (r) => r.date },
    { key: 'meals',     label: 'Meals',        width: '10%', render: (r) => r.mealsServed.toLocaleString() },
    { key: 'alerts',    label: 'Alerts',       width: '9%', render: (r) => <span className={r.fraudAlerts > 0 ? 'text-[#ff3333] font-semibold' : ''}>{r.fraudAlerts}</span> },
    { key: 'net',       label: 'Net Eligible', width: '14%', render: (r) => r.netEligible },
    { key: 'status',    label: 'Status',       width: '16%', render: (r) => { const m = REPORT_STATUS_MAP[r.status]; return <Badge variant={m.variant}>{m.label}</Badge> } },
    { key: 'updated',   label: 'Updated',      width: '14%', render: (r) => r.updatedAt },
  ]

  // ── Kanban groups ──
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, MockDailyReport[]> = {}
    for (const col of WORKFLOW_COLUMNS) groups[col.id] = []
    for (const r of MOCK_DAILY_REPORTS) {
      groups[r.workflowStage]?.push(r)
    }
    return groups
  }, [])

  // ── CTA per tab ──
  const cta: Partial<Record<PageTab, React.ReactNode>> = {
    overview:  <Button onClick={() => MOCK_DAILY_REPORTS[0] && openReport(MOCK_DAILY_REPORTS[0])}>Generate Report</Button>,
    supply:    <Button><Plus size={14} />Record Supply</Button>,
    financial: <Button onClick={() => setPageTab('claim')}>View Claim Readiness</Button>,
    workflow:  <Button>Approve &amp; Lock Report</Button>,
    claim:     <Button><Plus size={14} />Record Supply</Button>,
  }

  return (
    <div>
      <PageHeader title="Daily Reports" actions={cta[pageTab]} />

      {/* Page-level tab nav */}
      <div className="flex border-b border-[#f0f0f0] pl-[36px]">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPageTab(tab.value)}
            className={clsx(
              '-mb-px mr-[6px] border-b-2 px-[4px] pb-[10px] pt-[10px] text-[14px] transition-colors',
              pageTab === tab.value
                ? 'border-[#111] font-medium text-[#111]'
                : 'border-transparent text-[#888] hover:text-[#555]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pl-[36px] pr-[20px] pt-[20px]">

        {/* ── Overview ──────────────────────────────────────────────── */}
        {pageTab === 'overview' && (
          <>
            <StatRow stats={OVERVIEW_STATS} />

            {/* Claim Readiness mini-card */}
            <div className="mt-[30px] rounded-[14px] border border-[#efefef] bg-white p-[20px]">
              <h3 className="text-[16px] font-semibold text-black mb-[14px]">Semester Progress</h3>
              <div className="grid grid-cols-4 gap-[20px]">
                {[
                  { label: 'Locked Reports',       value: '57 / 60', sub: 'Reports secured for claim' },
                  { label: 'Eligible Reports',     value: '57',      sub: 'Ready for semester submission' },
                  { label: 'Pending Reviews',      value: '3',       sub: 'Awaiting admin approval' },
                  { label: 'Projected Claim',      value: 'GHS 1,765,000', sub: 'Based on locked reports' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[13px] text-[#888]">{s.label}</p>
                    <p className="mt-[4px] text-[20px] font-bold text-[#111]">{s.value}</p>
                    <p className="mt-[2px] text-[12px] text-[#aaa]">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-[32px]">
              <h2 className="text-[22px] font-bold leading-[24px] text-black">Reports Overview</h2>
              <div className="mt-[6px] flex h-[31px] items-center justify-end"><SectionSearch /></div>
              <div className="mt-[12px]">
                <DataTable
                  columns={reportColumns}
                  data={MOCK_DAILY_REPORTS}
                  rowKey={(r) => r.id}
                  onRowClick={openReport}
                  rowActions={reportActions}
                />
              </div>
            </section>
          </>
        )}

        {/* ── Meal Attendance ────────────────────────────────────────── */}
        {pageTab === 'attendance' && (
          <section>
            <h2 className="text-[22px] font-bold leading-[24px] text-black">Meal Attendance Summary</h2>
            <p className="mt-[4px] text-[14px] text-[#888]">Verified meal validations by session</p>
            <table className="mt-[20px] w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="h-[25px] rounded-l-[7px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Session</th>
                  <th className="h-[25px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Served</th>
                  <th className="h-[25px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Eligible</th>
                  <th className="h-[25px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Utilization</th>
                  <th className="h-[25px] rounded-r-[7px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Govt Rate</th>
                </tr>
              </thead>
              <tbody>
                {ATTENDANCE_SESSIONS.map((row) => (
                  <tr key={row.session} className="h-[55px] transition-colors hover:bg-[#fbfbfb]">
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.session}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.served.toLocaleString()}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.eligible.toLocaleString()}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.utilization}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#10b981]">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Supply Usage ────────────────────────────────────────────── */}
        {pageTab === 'supply' && selectedReport && (
          <section>
            <h2 className="text-[22px] font-bold leading-[24px] text-black">Supply Usage Summary — {selectedReport.reportId}</h2>
            <p className="mt-[4px] text-[14px] text-[#888]">Records all food and operational supplies consumed.</p>
            <table className="mt-[20px] w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="h-[25px] rounded-l-[7px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Item</th>
                  <th className="h-[25px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Expected Use</th>
                  <th className="h-[25px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Actual Use</th>
                  <th className="h-[25px] rounded-r-[7px] bg-[#fbfbfb] pl-[5px] text-left text-[15px] font-normal leading-none text-[#666]">Variance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: 'Rice',        expected: '450 Bags',   actual: selectedReport.riceUsed, variance: '-30 Bags'   },
                  { item: 'Cooking Oil', expected: '280 Litres', actual: selectedReport.oilUsed, variance: '+30 Litres'  },
                  { item: 'Beans',       expected: '100 Bags',   actual: selectedReport.beansUsed,variance: '-25 Bags'   },
                ].map((row) => (
                  <tr key={row.item} className="h-[55px] cursor-pointer transition-colors hover:bg-[#fbfbfb]" onClick={() => MOCK_DAILY_REPORTS[0] && openReport(MOCK_DAILY_REPORTS[0])}>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.item}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.expected}</td>
                    <td className="pl-[5px] text-[15px] font-normal text-[#3f3f3f]">{row.actual}</td>
                    <td className={clsx('pl-[5px] text-[15px] font-normal', row.variance.startsWith('+') ? 'text-[#ff6b35]' : 'text-[#3f3f3f]')}>{row.variance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Financial Summary ────────────────────────────────────────── */}
        {pageTab === 'financial' && (
          <>
            <StatRow stats={FINANCIAL_STATS} />
            <div className="mt-[40px] flex gap-[24px]">
              <div className="flex-1 rounded-[14px] border border-[#efefef] bg-white p-[20px]">
                <h3 className="mb-[16px] text-[16px] font-semibold text-black">Reimbursement Breakdown</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f0f0f0]">
                      <th className="pb-[8px] text-left text-[13px] font-normal text-[#888]">Category</th>
                      <th className="pb-[8px] text-left text-[13px] font-normal text-[#888]">Basis</th>
                      <th className="pb-[8px] text-right text-[13px] font-normal text-[#888]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REIMBURSEMENT_BREAKDOWN.map((row, i) => (
                      <tr key={i} className="border-b border-[#f8f8f8] last:border-0">
                        <td className={clsx('py-[12px] text-[14px]',
                          row.type === 'total' ? 'font-semibold text-[#111]' :
                          row.type === 'final' ? 'font-semibold text-[#4ea4ff]' :
                          'text-[#3f3f3f]')}>{row.category}</td>
                        <td className={clsx('py-[12px] text-[14px]', row.type === 'adjustment' ? 'text-[#f97316]' : 'text-[#888]')}>{row.basis}</td>
                        <td className={clsx('py-[12px] text-right text-[14px]',
                          row.type === 'total' ? 'font-semibold text-[#111]' :
                          row.type === 'adjustment' ? 'font-semibold text-[#ef4444]' :
                          row.type === 'final' ? 'font-semibold text-[#111]' :
                          'text-[#3f3f3f]')}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-[280px] shrink-0 space-y-[16px]">
                <div className="rounded-[14px] border border-[#efefef] bg-white p-[16px]">
                  <h4 className="mb-[10px] text-[14px] font-semibold text-black">Policy Notes</h4>
                  <ul className="space-y-[8px] text-[13px] text-[#555]">
                    <li className="flex items-start gap-[8px]"><span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#888]" />Excess supplies excluded</li>
                    <li className="flex items-start gap-[8px]"><span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#888]" />Policy cap applied (-GHS 3,500)</li>
                  </ul>
                </div>
                <div className="rounded-[14px] border border-[#efefef] bg-white p-[16px]">
                  <h4 className="mb-[10px] text-[14px] font-semibold text-black">Official Rates</h4>
                  <ul className="space-y-[6px] text-[13px]">
                    {[
                      ['Breakfast', 'GHS 5.46/student'],
                      ['Lunch',     'GHS 5.77/student'],
                      ['Supper',    'GHS 5.19/student'],
                    ].map(([label, val]) => (
                      <li key={label} className="flex items-center gap-[8px] text-[#555]">
                        <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-green-500" />{label}: <span className="font-semibold text-[#111]">{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Approval Workflow (kanban) ──────────────────────────────── */}
        {pageTab === 'workflow' && (
          <div className="flex h-[calc(100vh-200px)] gap-0 overflow-x-auto">
            {WORKFLOW_COLUMNS.map((col, ci) => (
              <div key={col.id} className={clsx('flex w-[240px] shrink-0 flex-col', ci < WORKFLOW_COLUMNS.length - 1 && 'border-r border-[#f0f0f0]')}>
                <div className="flex items-center gap-[6px] pb-[12px] pr-[16px]">
                  <span className={clsx('h-[8px] w-[8px] shrink-0 rounded-full', col.dot)} />
                  <span className="text-[13px] font-medium text-[#333]">{col.label}</span>
                  <span className="ml-[2px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#f0f0f0] px-[4px] text-[11px] font-medium text-[#555]">
                    {kanbanGroups[col.id]?.length ?? 0}
                  </span>
                </div>
                {kanbanGroups[col.id]?.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openReport(r)}
                    className="mb-[8px] mr-[16px] rounded-[10px] border border-[#efefef] bg-white p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    style={r.workflowStage === 'generated' ? { borderLeft: '3px solid #fb923c' } : r.workflowStage === 'operational_review' ? { borderLeft: '3px solid #3b82f6' } : r.workflowStage === 'compliance_review' ? { borderLeft: '3px solid #ef4444' } : r.workflowStage === 'approve_lock' ? { borderLeft: '3px solid #eab308' } : { borderLeft: '3px solid #22c55e' }}
                  >
                    <div className="mb-[4px] flex items-center gap-[6px]">
                      <FileText size={13} className="text-red-500 shrink-0" />
                      <span className="text-[13px] font-semibold text-[#111]">{r.reportId}</span>
                    </div>
                    <p className="text-[11px] leading-[16px] text-[#aaa]">Created {r.date}</p>
                    <p className="text-[11px] leading-[16px] text-[#aaa]">Updated <span className="text-[#555]">{r.updatedAt}</span></p>
                    <p className="mt-[6px] text-[12px] font-medium text-[#444]">{r.mealsServed.toLocaleString()} Meals Served</p>
                    <div className="mt-[8px] flex items-center justify-between">
                      <span className="text-[11px] text-[#aaa]">Net Eligible</span>
                      <span className="text-[12px] font-semibold text-[#111]">{r.netEligible}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Claim Readiness ──────────────────────────────────────────── */}
        {pageTab === 'claim' && (
          <section>
            <h2 className="text-[22px] font-bold leading-[24px] text-black">Claim Readiness</h2>
            <p className="mt-[4px] text-[14px] text-[#888]">Reports pending review before semester claim submission</p>
            <div className="mt-[6px] flex h-[31px] items-center justify-end"><SectionSearch /></div>
            <div className="mt-[12px]">
              <DataTable
                columns={reportColumns}
                data={MOCK_DAILY_REPORTS.filter(r => r.workflowStage === 'approve_lock' || r.workflowStage === 'compliance_review' || r.workflowStage === 'operational_review')}
                rowKey={(r) => r.id}
                onRowClick={openReport}
                rowActions={reportActions}
                emptyMessage="All reports are claim eligible."
              />
            </div>
          </section>
        )}
      </div>

      {/* ── Report Detail Sidebar ──────────────────────────────────────── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeReport} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">{selectedReport.reportId}</h2>
              <button onClick={closeReport} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></svg>
              </button>
            </div>

            {/* Modal tabs */}
            <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
              {MODAL_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setModalTab(tab.value)}
                  className={clsx(
                    'flex h-[24px] items-center rounded-[5px] px-[9px] text-[13px] font-medium transition-colors',
                    modalTab === tab.value ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-black/50 hover:text-[#555]'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-[4px] inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#ff3b30] px-[2px] text-[9px] font-bold text-white">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-[20px] pb-[24px] pt-[16px]">
              {/* Overview */}
              {modalTab === 'overview' && (
                <>
                  <SidebarDetailRow label="Report ID"      value={selectedReport.reportId} />
                  <SidebarDetailRow label="Date"           value={selectedReport.date} />
                  <SidebarDetailRow label="Meals Served"   value={selectedReport.mealsServed.toLocaleString()} />
                  <SidebarDetailRow label="Fraud Alerts"   value={String(selectedReport.fraudAlerts)} />
                  <SidebarDetailRow label="Net Eligible"   value={selectedReport.netEligible} />
                  <SidebarDetailRow label="Status"         value={REPORT_STATUS_MAP[selectedReport.status]?.label ?? selectedReport.status} />
                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">Review Completion</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {REVIEW_STEPS.map((step) => (
                      <div key={step} className="flex items-center gap-[10px]">
                        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <Settings size={13} className="text-white" />
                        </div>
                        <span className="text-[13px] text-[#333]">{step}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Operational */}
              {modalTab === 'operational' && (
                <>
                  <SidebarDetailRow label="Eligible Students"  value={selectedReport.eligibleStudents.toLocaleString()} />
                  <SidebarDetailRow label="Total Meals"        value={selectedReport.mealsServed.toLocaleString()} />
                  <SidebarDetailRow label="Breakfast"          value={selectedReport.breakfastServed.toLocaleString()} />
                  <SidebarDetailRow label="Lunch"              value={selectedReport.lunchServed.toLocaleString()} />
                  <SidebarDetailRow label="Dinner"             value={selectedReport.dinnerServed.toLocaleString()} />
                  <SidebarDetailRow label="Sessions"           value={`${selectedReport.sessions} of 3`} />
                  <SidebarDetailRow label="Utilization"        value={`${((selectedReport.mealsServed / selectedReport.eligibleStudents) * 100).toFixed(1)}%`} />
                </>
              )}

              {/* Risks */}
              {modalTab === 'risks' && (
                <>
                  <SidebarDetailRow label="Report ID"    value={selectedReport.reportId} />
                  <SidebarDetailRow label="Fraud Alerts" value={String(selectedReport.fraudAlerts)} />
                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">What Triggers Review?</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {RISK_TRIGGERS.map(({ label, icon: Icon, bg }) => (
                      <div key={label} className="flex items-center gap-[10px]">
                        <div className={clsx('flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full', bg)}><Icon size={13} className="text-white" /></div>
                        <span className="text-[13px] text-[#333]">{label}</span>
                      </div>
                    ))}
                  </div>
                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">Review Team</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {[
                      { name: 'Essandoh Prince', role: 'Dining Supervisor' },
                      { name: 'Essandoh Prince', role: 'Compliance Officer' },
                    ].map(({ name, role }) => (
                      <div key={role} className="flex items-center gap-[10px]">
                        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <span className="text-[11px] font-semibold text-white">E</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#111]">{name}</p>
                          <p className="text-[11px] text-[#888]">{role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Finances */}
              {modalTab === 'finances' && (
                <>
                  <SidebarDetailRow label="Gross Estimate"           value={selectedReport.grossEstimate} />
                  <SidebarDetailRow label="Policy Adjustments"       value={selectedReport.policyAdjustments} valueClass="font-semibold text-[#ef4444]" />
                  <SidebarDetailRow label="Net Eligible"             value={selectedReport.netEligible} />
                  <SidebarDetailRow label="Semester-to-Date"         value={selectedReport.semesterAccrued} />
                  <SidebarDetailRow label="Claim Pool Impact"        value={selectedReport.workflowStage === 'claim_eligible' ? 'Added to pool' : 'Pending Approval'} valueClass={selectedReport.workflowStage === 'claim_eligible' ? 'text-[#10b981]' : 'text-[#f97316]'} />
                </>
              )}

              {/* Logs */}
              {modalTab === 'logs' && (
                <div className="space-y-[14px]">
                  {selectedReport.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-[12px]">
                      <span className="shrink-0 w-[52px] text-[13px] font-medium text-[#888]">{log.time}</span>
                      <span className="text-[13px] text-[#333]">~ {log.event}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
