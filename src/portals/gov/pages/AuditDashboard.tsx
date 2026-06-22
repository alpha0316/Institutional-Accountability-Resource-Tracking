import { PageHeader } from '../../../components/layout/PageHeader'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { MOCK_GOV_CLAIMS } from '../../../lib/mockData'

const RISK_LEVELS = [
  { level: 'Low Risk',   count: 124, color: 'bg-[#10b981]', text: 'text-[#065f46]', bg: 'bg-[#d1fae5]' },
  { level: 'Medium Risk',count: 32,  color: 'bg-[#f59e0b]', text: 'text-[#92400e]', bg: 'bg-[#fef3c7]' },
  { level: 'High Risk',  count: 7,   color: 'bg-[#ef4444]', text: 'text-[#991b1b]', bg: 'bg-[#fee2e2]' },
]

const highRiskClaims = MOCK_GOV_CLAIMS.filter(c => c.riskScore >= 40)

export default function AuditDashboard() {
  return (
    <div>
      <PageHeader title="Risk & Audit Center" />
      <div className="pl-[36px] pr-[20px] pt-[12px]">
        <p className="text-[13px] text-[#888] mb-[24px]">
          Audit & Compliance — Protect government funds. Investigate fraud, review risk, and ensure accountability.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[30px] mb-[32px]">
          {[
            { label: 'Open Investigations', value: '14',   sub: 'Active cases under review',                tone: 'bg-[#fff7f8]', alert: true },
            { label: 'Fraud Alerts',        value: '67',   sub: 'Unknown cards, duplicates, anomalies',     tone: 'bg-[#fcf8f5]' },
            { label: 'Claims Frozen',       value: '2',    sub: 'Claims on audit hold',                     tone: 'bg-[#fff7f8]', alert: true },
            { label: 'Compliance Score',    value: '87%',  sub: 'Overall school compliance rating',         tone: 'bg-[#f7fdf9]' },
          ].map(s => (
            <div key={s.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center rounded-[7px] px-[5px]', s.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{s.label}</span>
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">{s.value}</p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', s.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-[24px] mb-[24px]">
          {/* Risk Overview */}
          <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
            <h3 className="text-[16px] font-semibold text-black mb-[14px]">Risk Distribution</h3>
            <div className="space-y-[12px]">
              {RISK_LEVELS.map((r) => (
                <div key={r.level} className={clsx('rounded-[10px] p-[14px]', r.bg)}>
                  <div className="flex items-center justify-between">
                    <span className={clsx('text-[14px] font-semibold', r.text)}>{r.level}</span>
                    <span className="text-[18px] font-bold">{r.count}</span>
                  </div>
                  <div className="mt-[6px] h-[6px] rounded-full bg-black/10">
                    <div className={clsx('h-full rounded-full', r.color)} style={{ width: `${(r.count / 163) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Alerts */}
          <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
            <h3 className="text-[16px] font-semibold text-black mb-[14px]">Active Fraud Alerts</h3>
            {[
              { type: 'Unknown Cards',     count: 18, icon: 'credit-card', color: 'text-[#de3d36]' },
              { type: 'Duplicate Scans',   count: 43, icon: 'refresh',     color: 'text-[#df6b13]' },
              { type: 'Enrollment Anomaly',count: 6,  icon: 'user-x',      color: 'text-[#f59e0b]' },
            ].map(a => (
              <div key={a.type} className="flex items-center justify-between py-[10px] border-b border-[#f5f5f5] last:border-0">
                <div className="flex items-center gap-[10px]">
                  <Icon name={a.icon} size={16} className={a.color} />
                  <span className="text-[14px] text-[#3f3f3f]">{a.type}</span>
                </div>
                <span className="text-[15px] font-bold text-[#111]">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High-Risk Claims */}
        <div className="rounded-[14px] border border-[#fee2e2] bg-white p-[20px]">
          <div className="flex items-center gap-[10px] mb-[14px]">
            <Icon name="shield-exclamation" size={18} className="text-[#de3d36]" />
            <h3 className="text-[16px] font-semibold text-[#991b1b]">High-Risk Claims — Investigation Queue</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fecaca]">
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Claim ID</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">School</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Value</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Risk Score</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Flags</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskClaims.length > 0 ? highRiskClaims.map(c => (
                <tr key={c.id} className="border-b border-[#fecaca] last:border-0">
                  <td className="py-[14px] text-[13px] font-medium text-[#4ea4ff]">{c.claimId}</td>
                  <td className="py-[14px] text-[14px] text-[#3f3f3f]">{c.school}</td>
                  <td className="py-[14px] text-[14px] font-semibold text-[#111]">{c.claimValue}</td>
                  <td className="py-[14px]">
                    <span className={clsx(
                      'rounded-full px-[8px] py-[2px] text-[12px] font-bold',
                      c.riskScore >= 40 ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#fef3c7] text-[#92400e]'
                    )}>{c.riskScore}</span>
                  </td>
                  <td className="py-[14px] text-[14px] text-[#de3d36] font-medium">{c.fraudFlags}</td>
                  <td className="py-[14px]">
                    <button className="rounded-[6px] bg-[#fee2e2] px-[10px] py-[4px] text-[11px] font-medium text-[#de3d36] hover:bg-[#fecaca]">
                      Investigate
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-[20px] text-center text-[13px] text-[#aaa]">No high-risk claims at this time.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
