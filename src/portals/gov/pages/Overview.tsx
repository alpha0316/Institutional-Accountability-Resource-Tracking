import { useState } from 'react'
import { ArrowUpRight, Plus, Search } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { clsx } from 'clsx'

import { GOV_CLAIMS, GOV_RECENT_TOKENS } from '../../../lib/mockData'

const claims = GOV_CLAIMS
const recentTokens = GOV_RECENT_TOKENS

type ClaimFilter = 'all' | 'approved' | 'pending' | 'flagged'

const statusBadge = {
  approved: <Badge variant="green">Approved</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  flagged:  <Badge variant="red">Flagged</Badge>,
  redeemed: <Badge variant="blue">Redeemed</Badge>,
  active:   <Badge variant="green">Active</Badge>,
  held:     <Badge variant="red">Held</Badge>,
}

function fmt(n: number) {
  return `GH₵${n.toLocaleString()}`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, badge,
}: {
  label: string
  value: string | number
  sub: React.ReactNode
  accent?: string
  badge?: React.ReactNode
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

export default function GovOverview() {
  const [filter, setFilter] = useState<ClaimFilter>('all')
  const [claimSearch, setClaimSearch] = useState('')

  const filtered = claims.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter
    const matchSearch = c.institution.toLowerCase().includes(claimSearch.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <Button>
            <Plus size={14} strokeWidth={2.5} />
            Enroll Student
          </Button>
        }
      />

      <div className="px-[36px] pb-[40px]">

        {/* Stat cards */}
        <div className="flex gap-[1px] overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-[#f0f0f0]">
          <StatCard
            label="Institutions Connected"
            value="47"
            sub="Across 10 regions"
            accent="bg-white"
            badge={
              <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">
                <ArrowUpRight size={12} strokeWidth={2.5} />
                +25%
              </span>
            }
          />
          <StatCard
            label="Total Students"
            value="284,320"
            sub="Verified enrollments"
            accent="bg-gradient-to-br from-white to-green-50/60"
          />
          <StatCard
            label="Tokens Issued"
            value="GH₵4.2M"
            sub="This semester"
            accent="bg-gradient-to-br from-white to-orange-50/60"
          />
          <StatCard
            label="Pending Reviews"
            value="5"
            sub={<span className="text-[#df6b13] font-medium">Claims awaiting approval</span>}
            accent="bg-gradient-to-br from-white to-red-50/60"
          />
        </div>

        {/* Institutional Claims */}
        <div className="mt-[36px]">
          <div className="mb-[16px] flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#111]">Institutional Claims</h2>
          </div>

          {/* Toolbar */}
          <div className="mb-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px]">
              {(['all', 'approved', 'pending', 'flagged'] as ClaimFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium capitalize transition-colors',
                    filter === f
                      ? 'bg-[#f4f4f4] text-[#111] shadow-sm'
                      : 'text-[#888] hover:text-[#555]'
                  )}
                >
                  {f === 'all' ? 'All Claims' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex h-[34px] w-[200px] items-center gap-[8px] rounded-[10px] border border-[#ededed] bg-[#fcfcfc] px-[12px]">
              <Search size={14} strokeWidth={2.2} className="shrink-0 text-[#aaa]" />
              <input
                value={claimSearch}
                onChange={e => setClaimSearch(e.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#aaa]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[28%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Institution</th>
                  <th className="w-[22%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Claimed Amount</th>
                  <th className="w-[22%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Approved Amount</th>
                  <th className="w-[18%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
                  <th className="w-[10%] rounded-tr-[16px] bg-[#fbfbfb] pr-[16px] py-[10px] text-right text-[13px] font-semibold text-[#666]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-[36px] text-center text-[14px] text-[#aaa]">No claims found.</td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="h-[55px] transition-colors hover:bg-[#fbfbfb]">
                    <td className="px-[16px] text-[14px] font-medium text-[#111]">{c.institution}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{fmt(c.claimed)}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{c.approved ? fmt(c.approved) : '—'}</td>
                    <td className="px-[16px]">{statusBadge[c.status]}</td>
                    <td className="pr-[16px] text-right">
                      <DropdownMenu items={[
                        { label: 'View Details',  onClick: () => {} },
                        { label: 'Approve',       onClick: () => {}, disabled: c.status === 'approved' },
                        { label: 'Flag',          onClick: () => {}, destructive: true },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Tokens */}
        <div className="mt-[36px]">
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Tokens</h2>
          <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[28%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Token ID</th>
                  <th className="w-[18%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Amount</th>
                  <th className="w-[32%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Supplier</th>
                  <th className="w-[12%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
                  <th className="w-[10%] rounded-tr-[16px] bg-[#fbfbfb] pr-[16px] py-[10px] text-right text-[13px] font-semibold text-[#666]">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTokens.map(t => (
                  <tr key={t.id} className="h-[55px] transition-colors hover:bg-[#fbfbfb]">
                    <td className="px-[16px] text-[13px] font-medium text-[#4ea4ff] underline underline-offset-2">{t.id}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{fmt(t.amount)}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">
                      {t.supplier} <span className="text-[#bbb]">·</span> {t.institution}
                    </td>
                    <td className="px-[16px]">{statusBadge[t.status]}</td>
                    <td className="pr-[16px] text-right">
                      <DropdownMenu items={[
                        { label: 'View Token',   onClick: () => {} },
                        { label: 'Revoke Token', onClick: () => {}, destructive: true },
                      ]} />
                    </td>
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
