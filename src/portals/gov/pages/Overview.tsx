import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { clsx } from 'clsx'

import { GOV_CLAIMS, GOV_RECENT_TOKENS, GOV_SCHOOL_PROFILES } from '../../../lib/mockData'

const SCHOOL_ID_MAP = Object.fromEntries(GOV_SCHOOL_PROFILES.map(s => [s.name, s.id]))

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function GovOverview() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ClaimFilter>('all')
  const [claimSearch, setClaimSearch] = useState('')

  const filtered = claims.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter
    const matchSearch = c.institution.toLowerCase().includes(claimSearch.toLowerCase())
    return matchFilter && matchSearch
  })

  const claimColumns: Column<(typeof claims)[number]>[] = [
    {
      key: 'institution',
      label: 'Institution',
      width: '28%',
      primaryKey: true,
      render: (c) => c.institution,
    },
    { key: 'claimed',  label: 'Claimed Amount',  width: '22%', render: (c) => fmt(c.claimed) },
    { key: 'approved', label: 'Approved Amount', width: '22%', render: (c) => c.approved ? fmt(c.approved) : '—' },
    { key: 'status',   label: 'Status',          width: '18%', render: (c) => statusBadge[c.status] },
  ]

  const tokenColumns: Column<(typeof recentTokens)[number]>[] = [
    { key: 'id',       label: 'Token ID', width: '28%', primaryKey: true, render: (t) => t.id },
    { key: 'amount',   label: 'Amount',   width: '18%', render: (t) => fmt(t.amount) },
    {
      key: 'supplier',
      label: 'Supplier',
      width: '32%',
      render: (t) => (
        <span>
          {t.supplier} <span className="text-[#bbb]">·</span> {t.institution}
        </span>
      ),
    },
    { key: 'status', label: 'Status', width: '12%', render: (t) => statusBadge[t.status] },
  ]

  return (
    <>
      <PageHeader
        title="Overview"
      />

      <div className="px-[36px] pb-[40px]">

        {/* Stat cards */}
        <StatCardGroup>
          <StatCard
            label="Institutions Connected"
            value="47"
            sub="Across 10 regions"
            accent="bg-white"
            badge={
              <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">
                <Icon name="arrow-up-right" size={12} />
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
        </StatCardGroup>

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
              <Icon name="search" size={14} className="shrink-0 text-[#aaa]" />
              <input
                value={claimSearch}
                onChange={e => setClaimSearch(e.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#aaa]"
              />
            </div>
          </div>

          <DataTable
            columns={claimColumns}
            data={filtered}
            rowKey={(c) => c.id}
            emptyMessage="No claims found."
            onRowClick={(c) => {
              const schoolId = SCHOOL_ID_MAP[c.institution]
              if (schoolId) navigate(`/gov/schools/${schoolId}`)
            }}
            rowActions={(c) => {
              const schoolId = SCHOOL_ID_MAP[c.institution]
              return [
                { label: 'View School', onClick: () => schoolId && navigate(`/gov/schools/${schoolId}`) },
                { label: 'Approve',     onClick: () => {}, disabled: c.status === 'approved' },
                { label: 'Flag',        onClick: () => {}, destructive: true },
              ]
            }}
          />
        </div>

          {/* Recent Tokens */}
          <div className="mt-[36px]">
            <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Tokens</h2>
          <DataTable
            columns={tokenColumns}
            data={recentTokens}
            rowKey={(t) => t.id}
            rowActions={() => [
              { label: 'View Token',   onClick: () => {} },
              { label: 'Revoke Token', onClick: () => {}, destructive: true },
            ]}
          />
        </div>

      </div>
    </>
  )
}
