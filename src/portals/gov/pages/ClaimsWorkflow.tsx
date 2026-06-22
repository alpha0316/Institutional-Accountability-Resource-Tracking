import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Icon } from '../../../components/ui/Icon'
import {
  MOCK_GOV_CLAIMS,
  GOV_WORKFLOW_COLUMNS,
  type GovSemesterClaim,
} from '../../../lib/mockData'
import { useGovRole, GOV_ROLES, stageRoleMap } from '../GovRoleContext'

type DetailTab = 'overview' | 'attendance' | 'supply' | 'history'

const DETAIL_TABS = [
  { label: 'Overview',          value: 'overview' as const },
  { label: 'Attendance',        value: 'attendance' as const },
  { label: 'Supply & Policy',   value: 'supply' as const },
  { label: 'Approval History',  value: 'history' as const },
]

const GET_RISK_COLOR = (score: number) =>
  score >= 40 ? 'bg-[#fee2e2] text-[#991b1b]' :
  score >= 20 ? 'bg-[#fef3c7] text-[#92400e]' :
  'bg-[#d1fae5] text-[#065f46]'

function SidebarDetailRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[13px] last:border-0">
      <span className="text-[14px] text-[#888]">{label}</span>
      <span className={clsx('text-[14px] font-semibold', valueClass || 'text-[#111]')}>{value}</span>
    </div>
  )
}

export default function ClaimsWorkflow() {
  const { role } = useGovRole()
  const [selected, setSelected] = useState<GovSemesterClaim | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')

  const kanbanGroups = useMemo(() => {
    const g: Record<string, GovSemesterClaim[]> = {}
    for (const col of GOV_WORKFLOW_COLUMNS) g[col.id] = []
    for (const c of MOCK_GOV_CLAIMS) g[c.stage]?.push(c)
    return g
  }, [])

  const currentOfficer = GOV_ROLES.find(r => r.value === role)

  return (
    <div>
      <PageHeader title="Claims Workflow" />

      <div className="pl-[36px] pr-[20px] pt-[12px]">
        <div className="flex items-center justify-between mb-[16px]">
          <p className="text-[13px] text-[#888]">
            Semester claims move through government verification, financial assessment, audit, and settlement.
          </p>
          <div className="flex items-center gap-[8px] rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] px-[10px] py-[5px]">
            <span className="text-[11px] text-[#888]">Viewing as:</span>
            <span className="text-[12px] font-semibold text-[#111]">{currentOfficer?.label}</span>
            <span className="text-[11px] text-[#aaa]">({currentOfficer?.dept})</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {GOV_WORKFLOW_COLUMNS.map((col) => {
              const items = kanbanGroups[col.id] ?? []
              return (
                <div key={col.id} className="w-[210px] shrink-0 flex flex-col gap-3 rounded-2xl bg-neutral-50 p-3">
                  <div className="flex items-center justify-between px-[2px]">
                    <div className="flex items-center gap-[6px]">
                      <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', col.dot)} />
                      <p className="text-[13px] font-semibold text-black">{col.label}</p>
                    </div>
                    <span className="text-[12px] text-black/50">{items.length}</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto">
                    {items.map((claim) => (
                      <button
                        key={claim.id}
                        onClick={() => { setSelected(claim); setDetailTab('overview') }}
                        className="w-full rounded-xl border border-[#efefef] bg-white p-[12px] text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                      >
                        <div className="mb-[4px] flex items-center gap-[6px]">
                          <span className="text-[12px] font-semibold text-[#111]">{claim.claimId}</span>
                          {claim.riskScore >= 20 && (
                            <span className={clsx('rounded-full px-[6px] py-[1px] text-[10px] font-medium', GET_RISK_COLOR(claim.riskScore))}>
                              R{claim.riskScore}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] leading-[16px] text-[#aaa]">{claim.school}</p>
                        <p className="text-[11px] text-[#888]">{claim.semester}</p>
                        <p className="mt-[6px] text-[13px] font-semibold text-[#111]">{claim.claimValue}</p>
                        <div className="mt-[8px] flex items-center justify-between border-t border-[#f5f5f5] pt-[8px]">
                          <span className="text-[11px] text-[#aaa]">{claim.verifiedStudents.toLocaleString()} students</span>
                          {claim.fraudFlags > 0 && (
                            <span className="text-[11px] font-medium text-[#de3d36]">{claim.fraudFlags} flag{claim.fraudFlags > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </button>
                    ))}

                    {items.length === 0 && (
                      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-white text-center">
                        <p className="text-[12px] text-black/40">No claims</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-[8px] border-t border-[#e5e5e5]">
                    <p className="text-[11px] text-[#aaa] text-center">
                      {['budget', 'token_generated', 'supplier_redemption', 'bank_settlement', 'closed'].includes(col.id) ? 'Automated' : col.actor}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Claim Detail Sidebar ─────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={() => setSelected(null)} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[500px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <div className="flex items-center gap-[10px]">
                <h2 className="pr-12 text-[17px] font-bold leading-none text-black">{selected.claimId}</h2>
                <span className={clsx('rounded-full px-[8px] py-[2px] text-[11px] font-semibold', GET_RISK_COLOR(selected.riskScore))}>
                  Risk {selected.riskScore}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
              {DETAIL_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setDetailTab(tab.value)}
                  className={clsx(
                    'flex h-[24px] items-center rounded-[5px] px-[9px] text-[12px] font-medium transition-colors',
                    detailTab === tab.value ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-black/50 hover:text-[#555]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-[20px] pb-[24px] pt-[16px] space-y-[14px]">
              {/* Overview Tab */}
              {detailTab === 'overview' && (
                <>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="School"            value={selected.school} />
                    <SidebarDetailRow label="Semester"          value={selected.semester} />
                    <SidebarDetailRow label="Verified Students" value={selected.verifiedStudents.toLocaleString()} />
                    <SidebarDetailRow label="Claim Value"       value={selected.claimValue} valueClass="text-[#4ea4ff]" />
                    <SidebarDetailRow label="Attendance Rate"   value={`${selected.attendancePct}%`} />
                    <SidebarDetailRow label="Risk Score"        value={String(selected.riskScore)} />
                    <SidebarDetailRow label="Fraud Flags"       value={String(selected.fraudFlags)} valueClass={selected.fraudFlags > 0 ? 'text-[#de3d36]' : ''} />
                    <SidebarDetailRow label="Current Stage"     value={GOV_WORKFLOW_COLUMNS.find(c => c.id === selected.stage)?.label ?? selected.stage} />
                    <SidebarDetailRow label="Submitted"         value={selected.submittedAt} />
                    <SidebarDetailRow label="Last Updated"      value={selected.updatedAt} />
                  </div>

                  {/* Policy Deductions */}
                  {selected.policyDeductions.length > 0 && (
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white p-[16px]">
                      <h4 className="text-[14px] font-semibold text-[#111] mb-[10px]">Policy Deductions</h4>
                      {selected.policyDeductions.map((d, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-[#f2f2f2] py-[8px] last:border-0">
                          <span className="text-[13px] text-[#555]">{d.reason}</span>
                          <span className="text-[13px] font-semibold text-[#ef4444]">{d.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supporting Documents */}
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white p-[16px]">
                    <h4 className="text-[14px] font-semibold text-[#111] mb-[10px]">Supporting Documents</h4>
                    {selected.supportingDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-[10px] py-[6px]">
                        <Icon name="file-text" size={14} className="text-[#aaa]" />
                        <span className="text-[13px] text-[#3f3f3f]">{doc.name}</span>
                        <span className="ml-auto text-[11px] text-[#aaa]">{doc.type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Government Notes */}
                  {selected.governmentNotes && (
                    <div className={clsx(
                      'rounded-[10px] p-[14px]',
                      selected.riskScore >= 40 ? 'border border-[#fee2e2] bg-[#fef2f2]' : 'border border-[#dbeafe] bg-[#eff6ff]'
                    )}>
                      <p className={clsx('text-[12px] font-medium mb-[4px]', selected.riskScore >= 40 ? 'text-[#991b1b]' : 'text-[#1e40af]')}>Government Notes</p>
                      <p className={clsx('text-[12px] leading-[18px]', selected.riskScore >= 40 ? 'text-[#b91c1c]' : 'text-[#3b82f6]')}>{selected.governmentNotes}</p>
                    </div>
                  )}

                  {/* Role-based Actions */}
                  {stageRoleMap[selected.stage] === role && (
                    <div className="rounded-[13px] border border-[#e5e5e5] bg-white p-[16px] space-y-[8px]">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <div className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#3b82f6]">
                          <span className="text-[10px] font-semibold text-white">{currentOfficer?.label[0] ?? 'C'}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-[#111]">{currentOfficer?.label}</p>
                      </div>
                      <div className="rounded-[8px] bg-[#f8fafc] p-[10px]">
                        <p className="text-[11px] font-medium text-[#888] mb-[6px]">Permissions</p>
                        <ul className="space-y-[3px]">
                          {currentOfficer?.permissions.map((p, i) => (
                            <li key={i} className="flex items-center gap-[6px] text-[12px] text-[#3f3f3f]">
                              <Icon name="circle-check" size={11} className="text-[#10b981] shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="flex w-full items-center justify-center gap-[6px] rounded-[8px] bg-[#10b981] px-[16px] py-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#059669]"
                      >
                        <Icon name="circle-check" size={15} /> Approve & Advance
                      </button>
                      <button className="flex w-full items-center justify-center gap-[6px] rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-[16px] py-[10px] text-[13px] font-medium text-[#de3d36] transition-colors hover:bg-[#fee2e2]">
                        <Icon name="x" size={15} /> Return to School
                      </button>
                      <button className="flex w-full items-center justify-center gap-[6px] rounded-[8px] border border-[#e5e5e5] bg-white px-[16px] py-[10px] text-[13px] font-medium text-[#555] transition-colors hover:bg-[#f5f5f5]">
                        <Icon name="shield-exclamation" size={15} /> Escalate
                      </button>
                    </div>
                  )}

                  {/* Post-audit: claim advancing beyond audit is visible to school/supplier */}
                  {(selected.stage === 'budget' || selected.stage === 'token_generated' || selected.stage === 'supplier_redemption' || selected.stage === 'bank_settlement') && (
                    <div className="rounded-[10px] border border-[#dbeafe] bg-[#eff6ff] p-[14px]">
                      <p className="text-[12px] font-medium text-[#1e40af] mb-[4px]">Post-Audit Stage</p>
                      <p className="text-[12px] text-[#3b82f6] leading-[18px]">
                        {selected.stage === 'budget' && 'This claim has passed audit and is awaiting budget authorization. The school and supplier can see this status.'}
                        {selected.stage === 'token_generated' && 'Token has been generated. Supplier can now redeem. School notified of approval.'}
                        {selected.stage === 'supplier_redemption' && 'Supplier has redeemed the token. Awaiting bank settlement.'}
                        {selected.stage === 'bank_settlement' && 'Bank settlement in progress. Funds being released to supplier.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Attendance Tab */}
              {detailTab === 'attendance' && (
                <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center border-b border-[#f0f0f0] px-[14px] py-[10px] text-[12px] font-medium text-[#888]">
                    <span className="w-[60px]">Month</span>
                    <span className="flex-1">Meals</span>
                    <span className="flex-1">Eligible</span>
                    <span className="w-[50px] text-right">Rate</span>
                  </div>
                  {selected.attendanceHistory.map((row, i) => (
                    <div key={i} className="flex items-center border-b border-[#f8f8f8] px-[14px] py-[12px] last:border-0">
                      <span className="w-[60px] text-[13px] font-medium text-[#888]">{row.month}</span>
                      <span className="flex-1 text-[13px] text-[#3f3f3f]">{row.meals.toLocaleString()}</span>
                      <span className="flex-1 text-[13px] text-[#3f3f3f]">{row.eligible.toLocaleString()}</span>
                      <span className="w-[50px] text-right text-[13px] font-semibold text-[#111]">
                        {((row.meals / row.eligible) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Supply & Policy Tab */}
              {detailTab === 'supply' && (
                <>
                  <div className="rounded-[13px] border border-[#f5f5f5] bg-white shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center border-b border-[#f0f0f0] px-[14px] py-[10px] text-[12px] font-medium text-[#888]">
                      <span className="flex-1">Supply Item</span>
                      <span className="w-[100px]">Consumed</span>
                      <span className="w-[90px] text-right">Cost</span>
                    </div>
                    {selected.supplyBreakdown.map((row, i) => (
                      <div key={i} className="flex items-center border-b border-[#f8f8f8] px-[14px] py-[12px] last:border-0">
                        <span className="flex-1 text-[13px] text-[#3f3f3f]">{row.item}</span>
                        <span className="w-[100px] text-[13px] text-[#888]">{row.semester}</span>
                        <span className="w-[90px] text-right text-[13px] font-semibold text-[#4ea4ff]">{row.cost}</span>
                      </div>
                    ))}
                  </div>

                  {selected.policyDeductions.length > 0 && (
                    <div className="rounded-[13px] border border-[#fee2e2] bg-white p-[16px]">
                      <h4 className="text-[14px] font-semibold text-[#991b1b] mb-[10px]">Policy Deductions</h4>
                      {selected.policyDeductions.map((d, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-[#f2f2f2] py-[8px] last:border-0">
                          <span className="text-[13px] text-[#555]">{d.reason}</span>
                          <span className="text-[13px] font-semibold text-[#ef4444]">{d.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Approval History Tab */}
              {detailTab === 'history' && (
                <div className="space-y-0">
                  {selected.approvalHistory.map((log, i) => (
                    <div key={i} className="flex items-start gap-[12px] border-b border-[#f5f5f5] py-[14px] last:border-0">
                      <span className="shrink-0 w-[65px] text-[12px] font-medium text-[#888]">{log.date}</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#111]">{log.action}</p>
                        <p className="text-[11px] text-[#888] mt-[2px]">{log.actor}</p>
                        {log.notes && <p className="text-[11px] text-[#aaa] mt-[2px] italic">{log.notes}</p>}
                      </div>
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
