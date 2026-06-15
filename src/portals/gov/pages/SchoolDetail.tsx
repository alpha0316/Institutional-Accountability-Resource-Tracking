import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { clsx } from 'clsx'
import { GOV_SCHOOL_PROFILES, type GovSchoolProfile } from '../../../lib/mockData'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `GH₵${n.toLocaleString()}`
}

function riskColor(score: number) {
  if (score === 0)   return { label: 'Clear',       cls: 'text-[#0f9f5d] bg-[#eefbf4]' }
  if (score <= 20)   return { label: 'Auto Pass',   cls: 'text-[#0f9f5d] bg-[#eefbf4]' }
  if (score <= 50)   return { label: 'Review',      cls: 'text-[#1d4ed8] bg-[#dbeafe]' }
  if (score <= 80)   return { label: 'Hold',        cls: 'text-[#df6b13] bg-[#fff7ed]' }
  return               { label: 'Investigation', cls: 'text-[#de3d36] bg-[#fff1f0]' }
}

function stageLabel(stage: GovSchoolProfile['recentValidations'][0]['stage']) {
  const m = {
    generated:          { label: 'Generated',          color: 'text-[#df6b13]' },
    operational_review: { label: 'Operational Review', color: 'text-[#3b82f6]' },
    compliance_review:  { label: 'Compliance Review',  color: 'text-[#ef4444]' },
    claim_eligible:     { label: 'Claim Eligible',     color: 'text-[#0f9f5d]' },
  }
  return m[stage]
}

function tokenStatusBadge(status: GovSchoolProfile['suppliers'][0]['tokenStatus']) {
  const m = {
    active:   <Badge variant="green">Active</Badge>,
    pending:  <Badge variant="orange">Pending</Badge>,
    redeemed: <Badge variant="blue">Redeemed</Badge>,
    none:     <Badge variant="gray">None</Badge>,
  }
  return m[status]
}

function supplyStatusBadge(status: 'pending' | 'approved' | 'delivered') {
  const m = {
    pending:   <Badge variant="orange">Pending</Badge>,
    approved:  <Badge variant="blue">Approved</Badge>,
    delivered: <Badge variant="green">Delivered</Badge>,
  }
  return m[status]
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f5f5f5] py-[13px] last:border-0">
      <span className="text-[13px] text-[#888]">{label}</span>
      <span className={clsx('text-[13px] font-semibold text-[#111]', valueClass)}>{value}</span>
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function SchoolDetail() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()

  const school = GOV_SCHOOL_PROFILES.find(s => s.id === schoolId)

  if (!school) {
    return (
      <div className="flex h-full items-center justify-center text-[14px] text-[#888]">
        School not found.
      </div>
    )
  }

  const tr = school.tokenRecommendation
  const claimBadge = {
    approved: <Badge variant="green">Approved</Badge>,
    pending:  <Badge variant="orange">Pending</Badge>,
    flagged:  <Badge variant="red">Flagged</Badge>,
  }[school.claimStatus]

  return (
    <>
      <PageHeader
        title={school.name}
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <Icon name="arrow-left" size={14} />
            Back
          </Button>
        }
      />

      <div className="px-[36px] pb-[40px]">

        {/* ── KPI strip ──────────────────────────────────────────────────── */}
        <div className="flex gap-[1px] overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Enrolled Students',  value: school.enrolled.toLocaleString(),      accent: 'bg-gradient-to-br from-white to-blue-50/50',   badge: undefined },
            { label: 'Meals Validated',    value: school.mealsValidated.toLocaleString(), accent: 'bg-gradient-to-br from-white to-green-50/50',  badge: undefined },
            { label: 'Avg Attendance',     value: `${school.attendancePct}%`,            accent: school.attendancePct < 70 ? 'bg-gradient-to-br from-white to-red-50/50' : 'bg-white',
              badge: (
                <span className={clsx('rounded-full px-[8px] py-[3px] text-[12px] font-semibold',
                  school.attendancePct >= 90 ? 'bg-[#eefbf4] text-[#0f9f5d]' :
                  school.attendancePct >= 70 ? 'bg-[#fff7ed] text-[#df6b13]' :
                  'bg-[#fff1f0] text-[#de3d36]'
                )}>
                  {school.attendancePct >= 90 ? 'On Track' : school.attendancePct >= 70 ? 'Below Target' : 'Critical'}
                </span>
              ),
            },
            { label: 'Claim Status',       value: school.approvedAmount ? fmt(school.approvedAmount) : fmt(school.claimedAmount),
              accent: 'bg-gradient-to-br from-white to-orange-50/50', badge: claimBadge },
          ].map((s) => (
            <div key={s.label} className={clsx('relative flex-1 overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-white px-[24px] py-[20px]', s.accent)}>
              <p className="text-[13px] font-medium text-[#888]">{s.label}</p>
              <div className="mt-[10px] flex items-end justify-between gap-2">
                <p className="text-[28px] font-bold leading-none tracking-tight text-[#111]">{s.value}</p>
                {s.badge}
              </div>
              <div className="mt-[8px] text-[13px] text-[#888]">
                {s.label === 'Enrolled Students' && `${school.region} Region`}
                {s.label === 'Meals Validated'   && 'App-verified scans, current semester'}
                {s.label === 'Avg Attendance'    && `${school.mealsValidated.toLocaleString()} total validated meals`}
                {s.label === 'Claim Status'      && (school.approvedAmount ? 'Government approved amount' : 'Submitted, awaiting approval')}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="mt-[28px] flex gap-[20px]">

          {/* ── Left col ─────────────────────────────────────────── */}
          <div className="flex-1 space-y-[20px]">

            {/* Recent validation table */}
            <div className="rounded-[16px] border border-[#f0f0f0] bg-white">
              <div className="border-b border-[#f5f5f5] px-[20px] py-[16px]">
                <h3 className="text-[15px] font-semibold text-[#111]">Recent Validation Reports</h3>
                <p className="mt-[2px] text-[13px] text-[#888]">Daily meal counts recorded via IARTS app scanning</p>
              </div>
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[18%]">Date</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[18%]">Meals Served</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[14%]">Alerts</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[16%]">Risk</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888]">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {school.recentValidations.map((v, i) => {
                    const risk  = riskColor(v.riskScore)
                    const stage = stageLabel(v.stage)
                    return (
                      <tr key={i} className="h-[50px] border-t border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                        <td className="px-[16px] text-[13px] text-[#555]">{v.date}</td>
                        <td className="px-[16px] text-[13px] font-semibold text-[#111]">{v.mealsServed.toLocaleString()}</td>
                        <td className="px-[16px] text-[13px]">
                          {v.fraudAlerts > 0
                            ? <span className="font-semibold text-[#de3d36]">{v.fraudAlerts}</span>
                            : <span className="text-[#0f9f5d]">—</span>
                          }
                        </td>
                        <td className="px-[16px]">
                          {v.riskScore === 0
                            ? <span className="text-[12px] text-[#0f9f5d]">Clear</span>
                            : <span className={clsx('inline-block rounded-full px-[7px] py-[2px] text-[11px] font-medium', risk.cls)}>
                                {v.riskScore} · {risk.label}
                              </span>
                          }
                        </td>
                        <td className="px-[16px]">
                          <span className={clsx('text-[12px] font-medium', stage.color)}>{stage.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Supply requests */}
            <div className="rounded-[16px] border border-[#f0f0f0] bg-white">
              <div className="border-b border-[#f5f5f5] px-[20px] py-[16px]">
                <h3 className="text-[15px] font-semibold text-[#111]">Supply Requests</h3>
                <p className="mt-[2px] text-[13px] text-[#888]">Requests submitted by storekeeper this period</p>
              </div>
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[16%]">Item</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[14%]">Qty</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888]">Requested By</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[17%]">Required By</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[12px] font-semibold text-[#888] w-[14%]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {school.supplyRequests.map((req, i) => (
                    <tr key={i} className="h-[50px] border-t border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-[16px] text-[13px] font-semibold text-[#111]">{req.item}</td>
                      <td className="px-[16px] text-[13px] text-[#555]">{req.qty}</td>
                      <td className="px-[16px] text-[13px] text-[#555]">{req.requestedBy}</td>
                      <td className="px-[16px] text-[13px] text-[#555]">{req.requiredBy}</td>
                      <td className="px-[16px]">{supplyStatusBadge(req.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* ── Right col ─────────────────────────────────────────── */}
          <div className="w-[320px] shrink-0 space-y-[20px]">

            {/* Token recommendation */}
            <div className="rounded-[16px] border border-[#f0f0f0] bg-white">
              <div className="border-b border-[#f5f5f5] px-[20px] py-[16px]">
                <h3 className="text-[15px] font-semibold text-[#111]">Token Recommendation</h3>
                <p className="mt-[2px] text-[13px] text-[#888]">Auto-calculated from validated meals</p>
              </div>
              <div className="px-[20px] py-[16px]">

                {/* Calculation breakdown */}
                <div className="space-y-0 divide-y divide-[#f5f5f5]">
                  <Row label="Validated Meals"       value={tr.validatedMeals.toLocaleString()} />
                  <Row label="Avg Supply Cost / Meal" value={`GHS ${tr.avgSupplyCostPerMeal.toFixed(2)}`} />
                  <Row label="Gross Supply Cost"      value={fmt(tr.grossSupplyCost)} />
                  <Row label="Fraud Deductions"       value={tr.fraudDeductions > 0 ? `-${fmt(tr.fraudDeductions)}` : '—'}
                       valueClass={tr.fraudDeductions > 0 ? 'text-[#de3d36]' : 'text-[#aaa]'} />
                </div>

                {/* Net recommended */}
                <div className="mt-[14px] rounded-[12px] bg-[#f0faf5] px-[16px] py-[14px]">
                  <p className="text-[12px] font-medium text-[#0f9f5d]">Net Token Recommended</p>
                  <p className="mt-[4px] text-[26px] font-bold leading-none tracking-tight text-[#0f9f5d]">
                    {fmt(tr.netRecommended)}
                  </p>
                </div>

                {/* Already issued vs remaining */}
                <div className="mt-[12px] space-y-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#888]">Already Issued</span>
                    <span className="text-[13px] font-semibold text-[#111]">{fmt(tr.alreadyIssued)}</span>
                  </div>
                  <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div
                      className="h-full rounded-full bg-[#3b82f6]"
                      style={{ width: `${Math.min(100, Math.round((tr.alreadyIssued / Math.max(tr.alreadyIssued + tr.remainingAllowance, 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#888]">Remaining Allowance</span>
                    <span className={clsx('text-[13px] font-semibold', tr.remainingAllowance > 0 ? 'text-[#df6b13]' : 'text-[#aaa]')}>
                      {tr.remainingAllowance > 0 ? fmt(tr.remainingAllowance) : 'Fully issued'}
                    </span>
                  </div>
                </div>

                {tr.remainingAllowance > 0 && (
                  <button
                    onClick={() => navigate('/gov/tokens/issue')}
                    className="mt-[16px] flex w-full items-center justify-center gap-[6px] rounded-[10px] bg-[#111] px-[14px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#333]"
                  >
                    <Icon name="coin" size={14} />
                    Issue Remaining Tokens
                  </button>
                )}
              </div>
            </div>

            {/* Linked suppliers */}
            <div className="rounded-[16px] border border-[#f0f0f0] bg-white">
              <div className="border-b border-[#f5f5f5] px-[20px] py-[16px]">
                <h3 className="text-[15px] font-semibold text-[#111]">Linked Suppliers</h3>
                <p className="mt-[2px] text-[13px] text-[#888]">GES-approved suppliers for this school</p>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {school.suppliers.map((s, i) => (
                  <div key={i} className="px-[20px] py-[16px]">
                    <div className="flex items-start justify-between gap-[8px]">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111]">{s.name}</p>
                        <p className="mt-[2px] text-[12px] text-[#888]">{s.category}</p>
                      </div>
                      {tokenStatusBadge(s.tokenStatus)}
                    </div>
                    <div className="mt-[8px] flex flex-wrap gap-[4px]">
                      {s.items.map(item => (
                        <span key={item} className="rounded-full bg-[#f3f4f6] px-[8px] py-[2px] text-[11px] font-medium text-[#555]">
                          {item}
                        </span>
                      ))}
                    </div>
                    {s.tokenCode && (
                      <div className="mt-[10px] flex items-center justify-between rounded-[8px] bg-[#fafafa] px-[10px] py-[8px]">
                        <span className="text-[11px] font-medium text-[#888]">Token</span>
                        <span className="text-[11px] font-semibold text-[#4ea4ff]">{s.tokenCode}</span>
                        <span className="text-[12px] font-bold text-[#111]">{fmt(s.tokenValue)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
