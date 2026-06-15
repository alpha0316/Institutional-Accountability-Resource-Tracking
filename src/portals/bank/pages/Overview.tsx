import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { clsx } from 'clsx'
import type { BankTransaction } from '../../../types'

import { BANK_OVERVIEW_TOKENS, BANK_TRANSACTIONS, type BankOverviewToken } from '../../../lib/mockData'

type PendingToken = BankOverviewToken

const pendingTokens: PendingToken[] = BANK_OVERVIEW_TOKENS
const recentTransactions: BankTransaction[] = BANK_TRANSACTIONS.slice(0, 3)

type TokenFilter = 'all' | 'released' | 'pending' | 'rejected'

const tokenStatusBadge: Record<PendingToken['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Unsubmitted</Badge>,
  rejected: <Badge variant="red">Flagged</Badge>,
}

const txStatusBadge: Record<BankTransaction['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
}

function StatCard({ label, value, sub, accent, badge }: {
  label: string; value: string; sub: React.ReactNode; accent?: string; badge?: React.ReactNode
}) {
  return (
    <div className={clsx('relative flex-1 overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-white px-[24px] py-[20px]', accent)}>
      <p className="text-[13px] font-medium text-[#888]">{label}</p>
      <div className="mt-[10px] flex items-end justify-between gap-2">
        <p className="text-[28px] font-bold leading-none tracking-tight text-[#111]">{value}</p>
        {badge}
      </div>
      <div className="mt-[8px] text-[13px] text-[#888]">{sub}</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BankOverview() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TokenFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = pendingTokens.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = t.code.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <Button onClick={() => navigate('/bank/validate')}>
            <Icon name="shield-check" size={14} />
            Validate Token
          </Button>
        }
      />

      <div className="px-[36px] pb-[40px]">
        {/* Stat cards */}
        <div className="flex gap-[1px] overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-[#f0f0f0]">
          <StatCard
            label="Pending Tokens"
            value="4"
            sub="Awaiting validation"
            accent="bg-white"
            badge={
              <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">
                <Icon name="arrow-up-right" size={12} />+25%
              </span>
            }
          />
          <StatCard
            label="Cash Released Today"
            value="GH₵1.2M"
            sub="3 transactions"
            accent="bg-gradient-to-br from-white to-green-50/60"
          />
          <StatCard
            label="Expiring Soon"
            value="14"
            sub="Within 7 days"
            accent="bg-gradient-to-br from-white to-orange-50/60"
          />
          <StatCard
            label="Rejected Tokens"
            value="3"
            sub={<span className="text-[#df6b13] font-medium">This month</span>}
            accent="bg-gradient-to-br from-white to-red-50/60"
          />
        </div>

        {/* Pending Token Validations */}
        <div className="mt-[36px]">
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Pending Token Validations</h2>
          <div className="mb-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px]">
              {(['all', 'released', 'pending', 'rejected'] as TokenFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium capitalize transition-colors',
                    filter === f ? 'bg-[#f4f4f4] text-[#111] shadow-sm' : 'text-[#888] hover:text-[#555]'
                  )}
                >
                  {f === 'all' ? 'All Tokens' : f === 'released' ? 'Redeemed' : f === 'pending' ? 'Active' : 'Pending'}
                </button>
              ))}
            </div>
            <div className="flex h-[34px] w-[200px] items-center gap-[8px] rounded-[10px] border border-[#ededed] bg-[#fcfcfc] px-[12px]">
              <Icon name="search" size={14} className="shrink-0 text-[#aaa]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#aaa]" />
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06] mb-[36px]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[32%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Token ID</th>
                  <th className="w-[20%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Amount</th>
                  <th className="w-[22%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Expiry</th>
                  <th className="w-[16%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
                  <th className="w-[10%] rounded-tr-[16px] bg-[#fbfbfb] pr-[16px] py-[10px] text-right text-[13px] font-semibold text-[#666]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="h-[55px] hover:bg-[#fbfbfb] transition-colors">
                    <td className="px-[16px] text-[13px]">
                      <span className="font-medium text-[#4ea4ff] underline underline-offset-2">{t.code}</span>
                      {t.isNew && (
                        <span className="ml-[6px] rounded-full bg-[#eefbf4] px-[6px] py-[1px] text-[10px] font-bold text-[#0f9f5d]">NEW</span>
                      )}
                    </td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">GH₵{t.amount.toLocaleString()}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{t.expiry ? fmtDate(t.expiry) : '—'}</td>
                    <td className="px-[16px]">{tokenStatusBadge[t.status]}</td>
                    <td className="pr-[16px] text-right">
                      <DropdownMenu items={[
                        { label: 'Validate Token',  onClick: () => navigate('/bank/validate'), disabled: t.status !== 'pending' },
                        { label: 'Release Cash',    onClick: () => navigate('/bank/cash-release'), disabled: t.status !== 'released' },
                        { label: 'Reject Token',    onClick: () => {}, destructive: true, disabled: t.status !== 'pending' },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Transactions */}
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Transactions</h2>
          <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[26%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Token Code</th>
                  <th className="w-[26%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Supplier</th>
                  <th className="w-[18%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Amount</th>
                  <th className="w-[16%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Date</th>
                  <th className="w-[14%] rounded-tr-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(t => (
                  <tr key={t.id} className="h-[55px] hover:bg-[#fbfbfb] transition-colors">
                    <td className="px-[16px] text-[13px] font-medium text-[#4ea4ff] underline underline-offset-2">{t.tokenCode}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{t.supplierName}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">GH₵{t.amount.toLocaleString()}</td>
                    <td className="px-[16px] text-[13px] text-[#555]">{fmtDate(t.processedAt)}</td>
                    <td className="px-[16px]">{txStatusBadge[t.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
