import { useState, useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import {
  MOCK_DAILY_REPORTS,
  REIMBURSEMENT_BREAKDOWN,
  // SUPPLY_CLAIM_BRIDGE, // TODO: supply-to-claim bridge
  ATTENDANCE_SESSIONS,
  WORKFLOW_COLUMNS,
  REPORT_STATUS_MAP,
  WEEKLY_BATCHES,
  MONTHLY_BATCHES,
  SEMESTER_POOL,
  type MockDailyReport,
  type WeeklyBatch,
  type MonthlyBatch,
  type SemesterPool,
} from '../../../lib/mockData'

type PageTab  = 'overview' | 'attendance' | 'financial' | 'workflow'
type ModalTab = 'overview' | 'operational' | 'risks' | 'finances'
type BatchKind =
  | { kind: 'week';     data: WeeklyBatch  }
  | { kind: 'month';    data: MonthlyBatch }
  | { kind: 'semester'; data: SemesterPool }

const PAGE_TABS: { label: string; value: PageTab }[] = [
  { label: 'Overview',          value: 'overview'   },
  { label: 'Meal Attendance',   value: 'attendance' },
  { label: 'Financial Summary', value: 'financial'  },
  { label: 'Approval Workflow', value: 'workflow'   },
]

const MODAL_TABS: { label: string; value: ModalTab; count?: number }[] = [
  { label: 'Overview',    value: 'overview'    },
  { label: 'Operational', value: 'operational' },
  { label: 'Risks',       value: 'risks' },
  { label: 'Finances',    value: 'finances'    },
]

const RISK_TRIGGERS = [
  { label: 'Attendance Spike',        icon: 'users',           bg: 'bg-blue-500'   },
  { label: 'Duplicate Scan Pattern',  icon: 'copy',            bg: 'bg-blue-500'   },
  { label: 'Dining Hall Imbalance',   icon: 'alert-triangle',  bg: 'bg-red-500'    },
  { label: 'Inventory Variance',      icon: 'package',         bg: 'bg-green-600'  },
  { label: 'Session Timing Conflict', icon: 'clock',           bg: 'bg-violet-500' },
]

const REVIEW_STEPS: { label: string; icon: string; stageThreshold: number }[] = [
  { label: 'Operational Review',  icon: 'checklist',    stageThreshold: 1 },
  { label: 'Compliance Review',   icon: 'shield-check', stageThreshold: 2 },
  { label: 'Fraud Analysis',      icon: 'alert-circle', stageThreshold: 3 },
  { label: 'Financial Validation',icon: 'calculator',   stageThreshold: 4 },
]

const STAGE_PROGRESS: Record<string, number> = {
  generated:          0,
  operational_review: 1,
  compliance_review:  2,
  claim_eligible:     4,
}

const REVIEW_TEAM = [
  { name: 'Kwame Asante-Mensah', role: 'Dining Hall Supervisor',  initial: 'K', color: 'bg-blue-600'   },
  { name: 'Abena Ofori',         role: 'GES Compliance Officer',  initial: 'A', color: 'bg-violet-600' },
  { name: 'Kofi Darko',          role: 'Finance Officer',         initial: 'K', color: 'bg-green-600'  },
]

const OVERVIEW_STATS = [
  { label: 'Meals Served',             value: '2,413',       description: 'Verified scans today',              tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Estimated Reimbursement',  value: 'GHS 41,820',  description: "Based on today's verified meals",   tone: 'bg-[#f7fdf9]' },
  { label: 'Supplies Consumed',        value: '38',          description: 'Line Items',                        tone: 'bg-[#fcf8f5]' },
  { label: 'Fraud Alerts',             value: '2',           description: 'Cards that are no longer valid.',   tone: 'bg-[#fff7f8]', alert: true },
]

const FINANCIAL_STATS = [
  { label: 'Daily Reimb. Estimate', value: 'GHS 41,820',  description: 'Reimbursable value from meals',        tone: 'bg-[#f7fbff]' },
  { label: 'Semester-to-Date',      value: 'GHS 812,400', description: 'Eligible reimbursement accumulated',   tone: 'bg-[#f7fdf9]' },
  { label: 'Policy Adjustments',    value: 'GHS -3,500',  description: 'Automatic deductions applied',         tone: 'bg-[#fcf8f5]' },
  { label: 'Net Eligible Amount',   value: 'GHS 38,320',  description: 'Amount added to semester claim',       tone: 'bg-[#fff7f8]' },
]

// ── Risk score helpers ────────────────────────────────────────────────────────
function riskLevel(score: number): { label: string; color: string; bg: string } {
  if (score <= 20) return { label: 'Auto Pass',      color: 'text-[#0f9f5d]', bg: 'bg-[#eefbf4]' }
  if (score <= 50) return { label: 'Review',         color: 'text-[#1d4ed8]', bg: 'bg-[#dbeafe]' }
  if (score <= 80) return { label: 'Hold',           color: 'text-[#df6b13]', bg: 'bg-[#fff7ed]' }
  return               { label: 'Investigation',  color: 'text-[#de3d36]', bg: 'bg-[#fff1f0]' }
}

function RiskBadge({ score }: { score: number }) {
  const r = riskLevel(score)
  return (
    <span className={clsx('ml-auto shrink-0 rounded-full px-[6px] py-[1px] text-[10px] font-medium', r.bg, r.color)}>
      {score} · {r.label}
    </span>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatRow({ stats }: { stats: typeof OVERVIEW_STATS }) {
  return (
    <StatCardGroup>
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          sub={'alert' in stat && stat.alert
            ? <span className="font-medium text-[#ff3333]">{stat.description}</span>
            : stat.description
          }
          accent={
            stat.tone === 'bg-[#f7fbff]' ? 'bg-gradient-to-br from-white to-blue-50/50' :
            stat.tone === 'bg-[#f7fdf9]' ? 'bg-gradient-to-br from-white to-green-50/50' :
            stat.tone === 'bg-[#fcf8f5]' ? 'bg-gradient-to-br from-white to-orange-50/50' :
            'bg-gradient-to-br from-white to-red-50/50'
          }
          badge={'trend' in stat && stat.trend
            ? <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">{stat.trend}</span>
            : undefined
          }
        />
      ))}
    </StatCardGroup>
  )
}

function SectionSearch() {
  return (
    <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
      <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-[8px] mt-[20px] text-[11px] font-semibold uppercase tracking-wide text-[#aaa]">{children}</p>
}

// ── Kanban card styles by stage ───────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────
export default function MealReports() {
  const [pageTab, setPageTab]         = useState<PageTab>('overview')
  const [selectedReport, setSelectedReport] = useState<MockDailyReport | null>(null)
  const [modalTab, setModalTab]       = useState<ModalTab>('overview')
  const [selectedBatch, setSelectedBatch]   = useState<BatchKind | null>(null)

  function openReport(r: MockDailyReport) {
    setSelectedBatch(null)
    setSelectedReport(r)
    setModalTab('overview')
  }
  function closeReport() { setSelectedReport(null) }

  function openBatch(b: BatchKind) {
    setSelectedReport(null)
    setSelectedBatch(b)
  }
  function closeBatch() { setSelectedBatch(null) }

  function reportActions(report: MockDailyReport): DropdownMenuItem[] {
    return [
      { label: 'View Details',   onClick: () => openReport(report) },
      { label: 'Export PDF',     onClick: () => {} },
      { label: 'Export Excel',   onClick: () => {} },
      { label: 'Approve Report', onClick: () => {}, disabled: report.workflowStage === 'claim_eligible' },
      { label: 'Lock Report',    onClick: () => {}, disabled: report.workflowStage !== 'claim_eligible' },
    ]
  }

  const reportColumns: Column<MockDailyReport>[] = [
    { key: 'reportId', label: 'Report ID',   width: '15%', primaryKey: true, render: (r) => r.reportId },
    { key: 'date',     label: 'Date',        width: '14%', render: (r) => r.date },
    { key: 'meals',    label: 'Meals',       width: '10%', render: (r) => r.mealsServed.toLocaleString() },
    { key: 'risk',     label: 'Risk',        width: '12%', render: (r) => {
      const rl = riskLevel(r.riskScore)
      return <span className={clsx('text-[13px] font-semibold', rl.color)}>{r.riskScore}</span>
    }},
    { key: 'net',      label: 'Net Eligible',width: '18%', render: (r) => r.netEligible },
    { key: 'status',   label: 'Status',      width: '20%', render: (r) => { const m = REPORT_STATUS_MAP[r.status]; return <Badge variant={m.variant}>{m.label}</Badge> } },
  ]

  const kanbanGroups = useMemo(() => {
    const groups: Record<string, MockDailyReport[]> = {}
    for (const col of WORKFLOW_COLUMNS) groups[col.id] = []
    for (const r of MOCK_DAILY_REPORTS) {
      if (r.workflowStage !== 'claim_eligible') groups[r.workflowStage]?.push(r)
    }
    return groups
  }, [])

  const cta: Partial<Record<PageTab, React.ReactNode>> = {
    overview:  <Button onClick={() => MOCK_DAILY_REPORTS[0] && openReport(MOCK_DAILY_REPORTS[0])}>Generate Report</Button>,
    workflow:  <Button>Approve &amp; Lock Report</Button>,
  }

  // ── Batch claim count for claim_eligible column ──
  const claimEligibleCount = WEEKLY_BATCHES.length + MONTHLY_BATCHES.length + 1

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

            <div className="mt-[30px] rounded-[14px] border border-[#efefef] bg-white p-[20px]">
              <h3 className="text-[16px] font-semibold text-black mb-[14px]">Semester Progress</h3>
              <div className="grid grid-cols-4 gap-[20px]">
                {[
                  { label: 'Locked Reports',   value: '57 / 60',       sub: 'Reports secured for claim' },
                  { label: 'Eligible Reports', value: '57',            sub: 'Ready for semester submission' },
                  { label: 'Pending Reviews',  value: '3',             sub: 'Awaiting admin approval' },
                  { label: 'Projected Claim',  value: 'GHS 1,765,000', sub: 'Based on locked reports' },
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
                          row.type === 'total'      ? 'font-semibold text-[#111]' :
                          row.type === 'final'      ? 'font-semibold text-[#4ea4ff]' :
                          'text-[#3f3f3f]')}>{row.category}</td>
                        <td className={clsx('py-[12px] text-[14px]', row.type === 'adjustment' ? 'text-[#f97316]' : 'text-[#888]')}>{row.basis}</td>
                        <td className={clsx('py-[12px] text-right text-[14px]',
                          row.type === 'total'      ? 'font-semibold text-[#111]' :
                          row.type === 'adjustment' ? 'font-semibold text-[#ef4444]' :
                          row.type === 'final'      ? 'font-semibold text-[#111]' :
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
                    <li className="flex items-start gap-[8px]"><span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#888]" />Excess supplies excluded from claim</li>
                    <li className="flex items-start gap-[8px]"><span className="mt-[4px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#888]" />Policy cap applied — -GHS 3,500</li>
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
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex min-w-max gap-4">
              {WORKFLOW_COLUMNS.map((col) => {
                const isClaim = col.id === 'claim_eligible'
                const count   = isClaim ? claimEligibleCount : (kanbanGroups[col.id]?.length ?? 0)

                return (
                  <div
                    key={col.id}
                    className={clsx('flex flex-col gap-3 rounded-2xl bg-neutral-50 p-3', isClaim ? 'w-72' : 'w-64')}
                  >
                    {/* Column header */}
                    <div className="flex items-center justify-between px-[2px]">
                      <div className="flex items-center gap-[6px]">
                        <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', col.dot)} />
                        <p className="text-[13px] font-semibold text-black">{col.label}</p>
                      </div>
                      <span className="text-[12px] text-black/50">{count}</span>
                    </div>

                    {/* Card list */}
                    <div className="flex max-h-[560px] flex-col gap-2 overflow-y-auto">

                      {/* Claim Eligible — batch cards */}
                      {isClaim && (
                        <>
                          {WEEKLY_BATCHES.map((wk) => {
                            const eligibleDays = wk.days.filter(d => d.status === 'eligible').length
                            return (
                              <button
                                key={wk.id}
                                onClick={() => openBatch({ kind: 'week', data: wk })}
                                className="w-full rounded-xl border border-[#efefef] bg-white p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                              >
                                <div className="mb-[3px] flex items-center justify-between">
                                  <span className="text-[13px] font-semibold text-[#111]">{wk.weekLabel}</span>
                                  <span className={clsx(
                                    'rounded-full px-[6px] py-[1px] text-[10px] font-medium',
                                    wk.status === 'complete' ? 'bg-[#eefbf4] text-[#0f9f5d]' : 'bg-[#fff7ed] text-[#df6b13]'
                                  )}>
                                    {wk.status === 'complete' ? 'Complete' : `${eligibleDays}/7 days`}
                                  </span>
                                </div>
                                <p className="mb-[8px] text-[11px] text-[#888]">{wk.daysRange}</p>
                                <div className="mb-[8px] flex gap-[12px]">
                                  <span className="text-[11px] text-[#aaa]">{wk.totalMeals.toLocaleString()} meals</span>
                                  {wk.fraudCases > 0 && <span className="text-[11px] text-[#de3d36]">{wk.fraudCases} fraud</span>}
                                </div>
                                <div className="flex items-center justify-between border-t border-[#f5f5f5] pt-[8px]">
                                  <span className="text-[11px] text-[#888]">Net Eligible</span>
                                  <span className={clsx('text-[12px] font-semibold', wk.status === 'complete' ? 'text-[#111]' : 'text-[#aaa] italic')}>
                                    {wk.netEligible}
                                  </span>
                                </div>
                              </button>
                            )
                          })}

                          {MONTHLY_BATCHES.map((mo) => (
                            <button
                              key={mo.id}
                              onClick={() => openBatch({ kind: 'month', data: mo })}
                              className="w-full rounded-xl border border-[#efefef] bg-white p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                            >
                              <div className="mb-[3px] flex items-center justify-between">
                                <span className="text-[13px] font-semibold text-[#111]">{mo.monthLabel}</span>
                                <span className="rounded-full bg-[#eefbf4] px-[6px] py-[1px] text-[10px] font-medium text-[#0f9f5d]">Complete</span>
                              </div>
                              <p className="mb-[8px] text-[11px] text-[#888]">{mo.weekLabels.join(' · ')}</p>
                              <div className="flex items-center justify-between border-t border-[#f5f5f5] pt-[8px]">
                                <span className="text-[11px] text-[#888]">Net Eligible</span>
                                <span className="text-[12px] font-semibold text-[#111]">{mo.netEligible}</span>
                              </div>
                            </button>
                          ))}

                          <button
                            onClick={() => openBatch({ kind: 'semester', data: SEMESTER_POOL })}
                            className="w-full rounded-xl border border-[#efefef] bg-gradient-to-br from-white to-[#f0faf5] p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                          >
                            <div className="mb-[3px] flex items-center justify-between">
                              <span className="text-[13px] font-bold text-[#111]">{SEMESTER_POOL.semesterLabel}</span>
                              <span className="rounded-full bg-[#dbeafe] px-[6px] py-[1px] text-[10px] font-medium text-[#1d4ed8]">Active</span>
                            </div>
                            <p className="mb-[8px] text-[11px] text-[#888]">
                              {SEMESTER_POOL.monthsIncluded.map((m, i) => (
                                <span key={m}>{i > 0 && ' · '}{m}</span>
                              ))}
                            </p>
                            <div className="flex items-center justify-between border-t border-[#d1fae5] pt-[8px]">
                              <span className="text-[11px] text-[#555]">Current Eligible</span>
                              <span className="text-[13px] font-bold text-[#0f9f5d]">{SEMESTER_POOL.currentEligible}</span>
                            </div>
                          </button>
                        </>
                      )}

                      {/* Other columns — daily report cards */}
                      {!isClaim && kanbanGroups[col.id]?.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => openReport(r)}
                          className="w-full rounded-xl border border-[#efefef] bg-white p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                        >
                          <div className="mb-[4px] flex items-center gap-[6px]">
                            <Icon name="file-text" size={13} className="shrink-0 text-[#aaa]" />
                            <span className="text-[13px] font-semibold text-[#111]">{r.reportId}</span>
                            <RiskBadge score={r.riskScore} />
                          </div>
                          <p className="text-[11px] leading-[16px] text-[#aaa]">{r.date}</p>
                          <p className="mt-[6px] text-[12px] font-medium text-[#444]">{r.mealsServed.toLocaleString()} Meals</p>
                          {r.fraudAlerts > 0 && (
                            <p className="mt-[2px] text-[11px] font-medium text-[#de3d36]">{r.fraudAlerts} fraud alert{r.fraudAlerts > 1 ? 's' : ''}</p>
                          )}
                          <div className="mt-[8px] flex items-center justify-between border-t border-[#f5f5f5] pt-[8px]">
                            <span className="text-[11px] text-[#aaa]">Net Eligible</span>
                            <span className="text-[12px] font-semibold text-[#111]">{r.netEligible}</span>
                          </div>
                        </button>
                      ))}

                      {/* Empty state */}
                      {count === 0 && (
                        <div className="flex h-[136px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-white text-center">
                          <p className="text-[12px] text-black/40">No reports</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Daily Report Sidebar ──────────────────────────────────────── */}
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

            {/* Risk score strip */}
            {(() => {
              const rl = riskLevel(selectedReport.riskScore)
              return (
                <div className={clsx('mx-[20px] mb-[8px] flex items-center justify-between rounded-[8px] px-[12px] py-[8px]', rl.bg)}>
                  <span className={clsx('text-[13px] font-semibold', rl.color)}>Risk Score: {selectedReport.riskScore} — {rl.label}</span>
                  <span className={clsx('text-[12px]', rl.color)}>{selectedReport.riskScore <= 20 ? 'Eligible for auto-approval' : selectedReport.riskScore <= 50 ? 'Needs manual review' : selectedReport.riskScore <= 80 ? 'Compliance hold' : 'Fraud investigation open'}</span>
                </div>
              )
            })()}

            {/* Modal tabs */}
            <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
              {MODAL_TABS.map((tab) => {
                const badgeCount = tab.value === 'risks' ? selectedReport.fraudAlerts : 0
                return (
                  <button
                    key={tab.value}
                    onClick={() => setModalTab(tab.value)}
                    className={clsx(
                      'flex h-[24px] items-center rounded-[5px] px-[9px] text-[13px] font-medium transition-colors',
                      modalTab === tab.value ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-black/50 hover:text-[#555]'
                    )}
                  >
                    {tab.label}
                    {badgeCount > 0 && (
                      <span className="ml-[4px] inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#ff3b30] px-[2px] text-[9px] font-bold text-white">{badgeCount}</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-[20px] pb-[24px] pt-[16px]">
              {modalTab === 'overview' && (
                <>
                  <SidebarDetailRow label="Report ID"    value={selectedReport.reportId} />
                  <SidebarDetailRow label="Date"         value={selectedReport.date} />
                  <SidebarDetailRow label="Meals Served" value={selectedReport.mealsServed.toLocaleString()} />
                  <SidebarDetailRow label="Fraud Alerts" value={String(selectedReport.fraudAlerts)} />
                  <SidebarDetailRow label="Net Eligible" value={selectedReport.netEligible} />
                  <SidebarDetailRow label="Status"       value={REPORT_STATUS_MAP[selectedReport.status]?.label ?? selectedReport.status} />
                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">Review Completion</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {(() => {
                      const progress = STAGE_PROGRESS[selectedReport.workflowStage] ?? 0
                      return REVIEW_STEPS.map((step) => {
                        const done       = progress >= step.stageThreshold
                        const inProgress = progress === step.stageThreshold - 1
                        return (
                          <div key={step.label} className="flex items-center gap-[10px]">
                            <div className={clsx(
                              'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full',
                              done        ? 'bg-[#0f9f5d]' :
                              inProgress  ? 'bg-[#3b82f6]' : 'bg-[#e5e5e5]'
                            )}>
                              <Icon
                                name={done ? 'circle-check' : step.icon}
                                size={13}
                                className={done || inProgress ? 'text-white' : 'text-[#aaa]'}
                              />
                            </div>
                            <span className={clsx('text-[13px]', done ? 'text-[#0f9f5d] font-medium' : inProgress ? 'text-[#3b82f6] font-medium' : 'text-[#aaa]')}>
                              {step.label}
                            </span>
                            {inProgress && <span className="ml-auto text-[11px] text-[#3b82f6]">In progress</span>}
                            {done        && <span className="ml-auto text-[11px] text-[#0f9f5d]">Done</span>}
                          </div>
                        )
                      })
                    })()}
                  </div>
                </>
              )}

              {modalTab === 'operational' && (
                <>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[16px]">
                    <SidebarDetailRow label="Eligible Students"  value={selectedReport.eligibleStudents.toLocaleString()} />
                    <SidebarDetailRow label="Total Meals Served" value={selectedReport.mealsServed.toLocaleString()} />
                    <SidebarDetailRow label="Breakfast"          value={selectedReport.breakfastServed.toLocaleString()} />
                    <SidebarDetailRow label="Lunch"              value={selectedReport.lunchServed.toLocaleString()} />
                    <SidebarDetailRow label="Dinner"             value={selectedReport.dinnerServed.toLocaleString()} />
                    <SidebarDetailRow label="Sessions"           value={`${selectedReport.sessions} of 3`} />
                    <SidebarDetailRow label="Utilization"        value={`${((selectedReport.mealsServed / selectedReport.eligibleStudents) * 100).toFixed(1)}%`} />
                  </div>
                  <h4 className="mb-[10px] text-[13px] font-semibold text-[#111]">Supplies Consumed This Day</h4>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[14px]">
                    <SidebarDetailRow label="Rice"                          value={selectedReport.riceUsed} />
                    <SidebarDetailRow label="Cooking Oil"                   value={selectedReport.oilUsed} />
                    <SidebarDetailRow label="Beans"                         value={selectedReport.beansUsed} />
                    <SidebarDetailRow label="Approved Supply Contribution"  value={selectedReport.supplyCost} valueClass="text-[#4ea4ff] font-semibold" />
                  </div>
                  <div className="rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] p-[13px]">
                    <p className="text-[12px] font-medium text-[#1e40af] mb-[4px]">How supply logs feed into this report</p>
                    <p className="text-[12px] text-[#3b82f6] leading-[18px]">
                      Logged consumption is cross-checked against meal validations. Government-approved rates are applied to verified quantities — the result ({selectedReport.supplyCost}) is added to meal revenue to form the gross estimate.
                    </p>
                  </div>
                </>
              )}

              {modalTab === 'risks' && (
                <>
                  <SidebarDetailRow label="Report ID"    value={selectedReport.reportId} />
                  <SidebarDetailRow label="Fraud Alerts" value={String(selectedReport.fraudAlerts)} />

                  {selectedReport.riskAlerts && selectedReport.riskAlerts.length > 0 && (
                    <>
                      <h4 className="mt-[20px] mb-[10px] text-[14px] font-semibold text-black">Alert Breakdown</h4>
                      <div className="space-y-[8px]">
                        {selectedReport.riskAlerts.map((alert, i) => (
                          <div key={i} className="rounded-[10px] border border-[#f0f0f0] bg-[#fafafa] px-[14px] py-[11px]">
                            <p className="text-[13px] font-semibold text-[#111]">{alert.label}</p>
                            <p className="mt-[3px] text-[12px] leading-[17px] text-[#666]">{alert.detail}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {selectedReport.reviewFlag && (
                    <>
                      <h4 className="mt-[20px] mb-[10px] text-[14px] font-semibold text-black">Flagged Issue</h4>
                      <div className={clsx(
                        'rounded-[10px] border p-[14px]',
                        selectedReport.workflowStage === 'compliance_review'
                          ? 'border-[#fecdca] bg-[#fff1f0]'
                          : 'border-[#fed7aa] bg-[#fff7ed]'
                      )}>
                        <div className="flex items-start justify-between gap-[8px]">
                          <p className={clsx('text-[13px] font-semibold leading-none',
                            selectedReport.workflowStage === 'compliance_review' ? 'text-[#de3d36]' : 'text-[#df6b13]'
                          )}>{selectedReport.reviewFlag.type}</p>
                          {selectedReport.reviewFlag.session && (
                            <span className="shrink-0 rounded-full bg-white/70 px-[7px] py-[2px] text-[10px] font-medium text-[#555]">
                              {selectedReport.reviewFlag.session}
                            </span>
                          )}
                        </div>
                        <p className="mt-[8px] text-[12px] leading-[18px] text-[#444]">{selectedReport.reviewFlag.detail}</p>
                      </div>
                    </>
                  )}

                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">What Triggers Review?</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {RISK_TRIGGERS.map(({ label, icon, bg }) => (
                      <div key={label} className="flex items-center gap-[10px]">
                        <div className={clsx('flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full', bg)}><Icon name={icon} size={13} className="text-white" /></div>
                        <span className="text-[13px] text-[#333]">{label}</span>
                      </div>
                    ))}
                  </div>
                  <h4 className="mt-[20px] mb-[12px] text-[14px] font-semibold text-black">Review Team</h4>
                  <div className="space-y-[8px] rounded-[10px] border border-[#efefef] bg-[#fafafa] p-[12px]">
                    {REVIEW_TEAM.map(({ name, role, initial, color }) => (
                      <div key={role} className="flex items-center gap-[10px]">
                        <div className={clsx('flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full', color)}>
                          <span className="text-[11px] font-semibold text-white">{initial}</span>
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

              {modalTab === 'finances' && (
                <>
                  <p className="mb-[8px] text-[12px] font-semibold uppercase tracking-wide text-[#888]">1 · Meal Revenue</p>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[14px]">
                    <SidebarDetailRow label={`Breakfast (${selectedReport.breakfastServed.toLocaleString()} × GHS 5.46)`} value={`GHS ${(selectedReport.breakfastServed * 5.46).toLocaleString('en-GH', { maximumFractionDigits: 0 })}`} />
                    <SidebarDetailRow label={`Lunch (${selectedReport.lunchServed.toLocaleString()} × GHS 5.77)`}     value={`GHS ${(selectedReport.lunchServed * 5.77).toLocaleString('en-GH', { maximumFractionDigits: 0 })}`} />
                    <SidebarDetailRow label={`Dinner (${selectedReport.dinnerServed.toLocaleString()} × GHS 5.19)`}   value={`GHS ${(selectedReport.dinnerServed * 5.19).toLocaleString('en-GH', { maximumFractionDigits: 0 })}`} />
                    <SidebarDetailRow label="Subtotal — Meal Revenue" value={selectedReport.mealRevenue} valueClass="font-semibold text-[#111]" />
                  </div>
                  <p className="mb-[8px] text-[12px] font-semibold uppercase tracking-wide text-[#888]">2 · Supply Contribution</p>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[4px]">
                    <SidebarDetailRow label="Rice consumed"         value={selectedReport.riceUsed} />
                    <SidebarDetailRow label="Cooking Oil consumed"  value={selectedReport.oilUsed} />
                    <SidebarDetailRow label="Beans consumed"        value={selectedReport.beansUsed} />
                    <SidebarDetailRow label="Approved Supply Amount" value={selectedReport.supplyCost} valueClass="font-semibold text-[#4ea4ff]" />
                  </div>
                  <p className="mb-[14px] text-[11px] text-[#aaa] leading-[16px] px-[2px]">Only quantities cross-checked against meal validations count.</p>
                  <p className="mb-[8px] text-[12px] font-semibold uppercase tracking-wide text-[#888]">3 · Claim Calculation</p>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[14px]">
                    <SidebarDetailRow label="Meal Revenue"        value={selectedReport.mealRevenue} />
                    <SidebarDetailRow label="Supply Contribution" value={selectedReport.supplyCost} />
                    <SidebarDetailRow label="Gross Estimate"      value={selectedReport.grossEstimate} valueClass="font-semibold text-[#111]" />
                    <SidebarDetailRow
                      label="Policy Adjustments"
                      value={selectedReport.policyAdjustments}
                      valueClass={selectedReport.policyAdjustments.startsWith('-') ? 'font-semibold text-[#ef4444]' : 'font-semibold text-[#888]'}
                    />
                    <SidebarDetailRow label="Net Claimable" value={selectedReport.netEligible} valueClass="font-semibold text-[#10b981]" />
                  </div>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="Semester-to-Date" value={selectedReport.semesterAccrued} />
                    <SidebarDetailRow
                      label="Claim Pool"
                      value={selectedReport.workflowStage === 'claim_eligible' ? 'Added to pool' : 'Pending Approval'}
                      valueClass={selectedReport.workflowStage === 'claim_eligible' ? 'text-[#10b981]' : 'text-[#f97316]'}
                    />
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Batch Sidebar ─────────────────────────────────────────────── */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeBatch} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">

            {/* Header */}
            <div className="relative px-[20px] pb-[12px] pt-[22px]">
              {selectedBatch.kind === 'week' && (
                <>
                  <p className="text-[12px] font-medium text-[#888]">Weekly Batch</p>
                  <h2 className="mt-[2px] pr-12 text-[20px] font-bold leading-none text-black">{selectedBatch.data.weekLabel}</h2>
                  <p className="mt-[4px] text-[13px] text-[#888]">{selectedBatch.data.daysRange}</p>
                </>
              )}
              {selectedBatch.kind === 'month' && (
                <>
                  <p className="text-[12px] font-medium text-[#888]">Monthly Batch</p>
                  <h2 className="mt-[2px] pr-12 text-[20px] font-bold leading-none text-black">{selectedBatch.data.monthLabel}</h2>
                </>
              )}
              {selectedBatch.kind === 'semester' && (
                <>
                  <p className="text-[12px] font-medium text-[#888]">Settlement Pool</p>
                  <h2 className="mt-[2px] pr-12 text-[20px] font-bold leading-none text-black">{selectedBatch.data.semesterLabel}</h2>
                </>
              )}
              <button onClick={closeBatch} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></svg>
              </button>
            </div>

            <div className="px-[20px] pb-[32px]">

              {/* ── WEEK BATCH CONTENT ── */}
              {selectedBatch.kind === 'week' && (() => {
                const wk = selectedBatch.data
                const eligibleCount = wk.days.filter(d => d.status === 'eligible').length
                return (
                  <>
                    {/* Status strip */}
                    <div className={clsx(
                      'mb-[16px] flex items-center justify-between rounded-[10px] px-[14px] py-[10px]',
                      wk.status === 'complete' ? 'bg-[#eefbf4]' : 'bg-[#fff7ed]'
                    )}>
                      <span className={clsx('text-[13px] font-semibold', wk.status === 'complete' ? 'text-[#0f9f5d]' : 'text-[#df6b13]')}>
                        {wk.status === 'complete' ? 'All 7 days complete — claim eligible' : `${eligibleCount} of 7 days complete — awaiting ${7 - eligibleCount} more`}
                      </span>
                    </div>

                    {/* Daily reports checklist */}
                    <SectionLabel>Daily Reports</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)] mb-[4px]">
                      {wk.days.map((d) => (
                        <div key={d.dayNum} className="flex items-center justify-between border-b border-[#f2f2f2] py-[11px] last:border-0">
                          <div className="flex items-center gap-[10px]">
                            {d.status === 'eligible'
                              ? <Icon name="circle-check" size={15} className="shrink-0 text-[#0f9f5d]" />
                              : <Icon name="circle" size={15} className="shrink-0 text-[#ddd]" />
                            }
                            <span className="text-[13px] text-[#333]">{d.reportId}</span>
                            <span className="text-[12px] text-[#aaa]">{d.date}</span>
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <span className="text-[12px] text-[#555]">{d.meals.toLocaleString()} meals</span>
                            {d.status === 'pipeline' && (
                              <span className="rounded-full bg-[#fff7ed] px-[6px] py-[1px] text-[10px] font-medium text-[#df6b13]">In pipeline</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Student validation */}
                    <SectionLabel>Student Validation</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Total Student Scans" value={wk.studentValidations.total.toLocaleString()} />
                      <SidebarDetailRow label="Successful"          value={wk.studentValidations.successful.toLocaleString()} valueClass="text-[#0f9f5d]" />
                      <SidebarDetailRow label="Rejected"            value={wk.studentValidations.rejected.toLocaleString()}   valueClass="text-[#ef4444]" />
                    </div>

                    {/* Supply logs */}
                    <SectionLabel>Supply Logs</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {wk.supplyLogs.map((s) => (
                        <SidebarDetailRow key={s.item} label={s.item} value={`${s.qty} ${s.unit}`} />
                      ))}
                    </div>

                    {/* Fraud summary */}
                    <SectionLabel>Fraud Summary</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Duplicate Cards"  value={String(wk.fraudSummary.duplicateCards)} valueClass={wk.fraudSummary.duplicateCards > 0 ? 'text-[#ef4444]' : ''} />
                      <SidebarDetailRow label="Unknown Cards"    value={String(wk.fraudSummary.unknownCards)}   valueClass={wk.fraudSummary.unknownCards > 0   ? 'text-[#ef4444]' : ''} />
                      <SidebarDetailRow label="Supply Anomalies" value={String(wk.fraudSummary.supplyAnomalies)} valueClass={wk.fraudSummary.supplyAnomalies > 0 ? 'text-[#ef4444]' : ''} />
                    </div>

                    {/* Financial summary */}
                    <SectionLabel>Financial Summary</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Gross"             value={wk.status === 'complete' ? `GHS ${wk.financial.gross.toLocaleString()}` : '—'} />
                      <SidebarDetailRow label="Policy Deductions" value={wk.status === 'complete' ? `-GHS ${wk.financial.policyDeductions.toLocaleString()}` : '—'} valueClass="text-[#ef4444]" />
                      <SidebarDetailRow label="Net Eligible"      value={wk.netEligible} valueClass="text-[#0f9f5d] font-bold text-[16px]" />
                    </div>
                  </>
                )
              })()}

              {/* ── MONTH BATCH CONTENT ── */}
              {selectedBatch.kind === 'month' && (() => {
                const mo = selectedBatch.data
                return (
                  <>
                    <div className="mb-[16px] flex items-center justify-between rounded-[10px] bg-[#eefbf4] px-[14px] py-[10px]">
                      <span className="text-[13px] font-semibold text-[#0f9f5d]">All 4 weekly batches complete</span>
                    </div>

                    {/* Weeks included */}
                    <SectionLabel>Weeks Included</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {mo.weekLabels.map((wl) => (
                        <div key={wl} className="flex items-center gap-[10px] border-b border-[#f2f2f2] py-[11px] last:border-0">
                          <Icon name="circle-check" size={15} className="shrink-0 text-[#0f9f5d]" />
                          <span className="text-[13px] text-[#333]">{wl}</span>
                        </div>
                      ))}
                    </div>

                    {/* Student validations */}
                    <SectionLabel>Monthly Student Validations</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Total Validations" value={mo.studentValidations.toLocaleString()} />
                      <SidebarDetailRow label="Supply Records"    value={String(mo.supplyRecords)} />
                      <SidebarDetailRow label="Fraud Cases"       value={String(mo.fraudCases)} valueClass={mo.fraudCases > 0 ? 'text-[#ef4444]' : ''} />
                    </div>

                    {/* Supply logs */}
                    <SectionLabel>Monthly Supply Logs</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {mo.supplyLogs.map((s) => (
                        <SidebarDetailRow key={s.item} label={s.item} value={`${s.qty} ${s.unit}`} />
                      ))}
                    </div>

                    {/* Financial */}
                    <SectionLabel>Net Eligible</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Total Meals"  value={mo.totalMeals.toLocaleString()} />
                      <SidebarDetailRow label="Net Eligible" value={mo.netEligible} valueClass="text-[#0f9f5d] font-bold text-[16px]" />
                    </div>
                  </>
                )
              })()}

              {/* ── SEMESTER POOL CONTENT ── */}
              {selectedBatch.kind === 'semester' && (() => {
                const sp = selectedBatch.data
                return (
                  <>
                    {/* Months included */}
                    <SectionLabel>Months Included</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {sp.monthsIncluded.map((m, i) => (
                        <div key={m} className="flex items-center gap-[10px] border-b border-[#f2f2f2] py-[11px] last:border-0">
                          {i < sp.monthsIncluded.length - 1
                            ? <Icon name="circle-check" size={15} className="shrink-0 text-[#0f9f5d]" />
                            : <Icon name="circle" size={15} className="shrink-0 text-[#f59e0b]" />
                          }
                          <span className="text-[13px] text-[#333]">{m}</span>
                          {i === sp.monthsIncluded.length - 1 && (
                            <span className="ml-auto text-[11px] text-[#df6b13]">Accumulating</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Student activity */}
                    <SectionLabel>Student Activity</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Meal Validations" value={sp.studentValidations.toLocaleString()} />
                    </div>

                    {/* Supplies */}
                    <SectionLabel>Supplies</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      {sp.supplyLogs.map((s) => (
                        <SidebarDetailRow key={s.item} label={s.item} value={`${s.qty.toLocaleString()} ${s.unit}`} />
                      ))}
                    </div>

                    {/* Fraud overview */}
                    <SectionLabel>Fraud Overview</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Unknown Cards"    value={String(sp.fraudOverview.unknownCards)}   valueClass={sp.fraudOverview.unknownCards > 0   ? 'text-[#ef4444]' : ''} />
                      <SidebarDetailRow label="Duplicate Scans"  value={String(sp.fraudOverview.duplicateScans)} valueClass={sp.fraudOverview.duplicateScans > 0  ? 'text-[#ef4444]' : ''} />
                      <SidebarDetailRow label="Supply Anomalies" value={String(sp.fraudOverview.supplyAnomalies)} valueClass={sp.fraudOverview.supplyAnomalies > 0 ? 'text-[#ef4444]' : ''} />
                    </div>

                    {/* Financial overview */}
                    <SectionLabel>Financial Overview</SectionLabel>
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Gross Estimate"    value={`GHS ${sp.financial.grossEstimate.toLocaleString()}`} />
                      <SidebarDetailRow label="Policy Adjustments" value={`-GHS ${sp.financial.policyAdjustments.toLocaleString()}`} valueClass="text-[#ef4444]" />
                      <SidebarDetailRow label="Net Eligible"       value={sp.currentEligible} valueClass="text-[#0f9f5d] font-bold text-[17px]" />
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
