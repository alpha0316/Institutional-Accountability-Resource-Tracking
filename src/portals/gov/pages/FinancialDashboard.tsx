import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { clsx } from 'clsx'
import { MOCK_GOV_CLAIMS } from '../../../lib/mockData'

const totalValue = MOCK_GOV_CLAIMS.reduce((a, c) => a + parseFloat(c.claimValue.replace(/[^0-9.]/g, '')), 0)
const financialClaims = MOCK_GOV_CLAIMS.filter(c => c.stage === 'financial' || c.stage === 'audit' || c.stage === 'budget')

export default function FinancialDashboard() {
  return (
    <div>
      <PageHeader title="Financial Dashboard" />
      <div className="pl-[36px] pr-[20px] pt-[12px]">
        <p className="text-[13px] text-[#888] mb-[24px]">
          Financial Assessment — Verify calculations, rates, deductions, and ensure government only pays correct amounts.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[30px] mb-[32px]">
          {[
            { label: 'Claims Under Review',   value: String(financialClaims.length), sub: 'In financial assessment pipeline',   tone: 'bg-[#f7fbff]' },
            { label: 'Total Value',           value: `GHS ${(totalValue / 1_000_000).toFixed(1)}M`, sub: 'Aggregate claim value', tone: 'bg-[#f7fdf9]' },
            { label: 'Financial Exceptions',  value: '7 Claims', sub: 'Rate variances or miscalculations',                      tone: 'bg-[#fff7f8]', alert: true },
            { label: 'Budget Available',      value: 'GHS 1.8M',  sub: 'Current cycle allocation',                              tone: 'bg-[#fcf8f5]' },
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
          {/* Rate Verification */}
          <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
            <h3 className="text-[16px] font-semibold text-black mb-[14px]">Rate Verification</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  <th className="pb-[8px] text-left text-[12px] font-medium text-[#888]">Session</th>
                  <th className="pb-[8px] text-left text-[12px] font-medium text-[#888]">Govt Rate</th>
                  <th className="pb-[8px] text-left text-[12px] font-medium text-[#888]">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { session: 'Breakfast', rate: 'GHS 5.46', status: 'Verified' },
                  { session: 'Lunch',     rate: 'GHS 5.77', status: 'Verified' },
                  { session: 'Supper',    rate: 'GHS 5.19', status: 'Verified' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-[#f8f8f8] last:border-0">
                    <td className="py-[12px] text-[14px] text-[#3f3f3f]">{r.session}</td>
                    <td className="py-[12px] text-[14px] font-semibold text-[#111]">{r.rate}</td>
                    <td className="py-[12px]">
                      <Badge variant="green">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
            <h3 className="text-[16px] font-semibold text-black mb-[14px]">Cost Breakdown</h3>
            <div className="space-y-[14px]">
              {[
                { label: 'Meal Revenue',   pct: 85, color: 'bg-[#4ea4ff]' },
                { label: 'Supply Costs',   pct: 12, color: 'bg-[#10b981]' },
                { label: 'Adjustments',    pct: 3,  color: 'bg-[#f59e0b]' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[13px] mb-[4px]">
                    <span className="text-[#3f3f3f]">{item.label}</span>
                    <span className="font-semibold text-[#111]">{item.pct}%</span>
                  </div>
                  <div className="h-[8px] rounded-full bg-[#f0f0f0]">
                    <div className={clsx('h-full rounded-full', item.color)} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Queue */}
        <div className="rounded-[14px] border border-[#efefef] bg-white p-[20px]">
          <h3 className="text-[16px] font-semibold text-black mb-[14px]">Financial Review Queue</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Claim</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">School</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Value</th>
                <th className="pb-[10px] text-left text-[13px] font-medium text-[#888]">Status</th>
              </tr>
            </thead>
            <tbody>
              {financialClaims.map((c) => (
                <tr key={c.id} className="border-b border-[#f8f8f8] last:border-0">
                  <td className="py-[14px] text-[13px] font-medium text-[#4ea4ff]">{c.claimId}</td>
                  <td className="py-[14px] text-[14px] text-[#3f3f3f]">{c.school}</td>
                  <td className="py-[14px] text-[14px] font-semibold text-[#111]">{c.claimValue}</td>
                  <td className="py-[14px]">
                    <Badge variant={c.stage === 'audit' ? 'orange' : c.stage === 'financial' ? 'blue' : 'green'}>
                      {c.stage === 'financial' ? 'Under Review' : c.stage === 'audit' ? 'In Audit' : 'Budget'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
