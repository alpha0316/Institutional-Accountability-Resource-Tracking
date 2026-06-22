import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { clsx } from 'clsx'

import { SUPPLIER_TOKENS, type SupplierTokenItem } from '../../../lib/mockData'

type TokenStatus = 'redeemed' | 'unsubmitted' | 'flagged' | 'active'
type SupplierToken = SupplierTokenItem

const allTokens: SupplierToken[] = SUPPLIER_TOKENS

type Filter = 'all' | TokenStatus

const statusBadge: Record<TokenStatus, React.ReactNode> = {
  redeemed:    <Badge variant="green">Redeemed</Badge>,
  unsubmitted: <Badge variant="orange">Unsubmitted</Badge>,
  flagged:     <Badge variant="red">Flagged</Badge>,
  active:      <Badge variant="blue">Active</Badge>,
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',         label: 'All Tokens' },
  { key: 'active',      label: 'Active' },
  { key: 'unsubmitted', label: 'Pending' },
  { key: 'redeemed',    label: 'Redeemed' },
  { key: 'flagged',     label: 'Flagged' },
]

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<SupplierToken>[] = [
  {
    key: 'code', label: 'Token ID', width: '26%', primaryKey: true,
    render: r => (
      <span className="flex items-center gap-[6px]">
        {r.code}
        {r.isNew && <span className="rounded-full bg-[#eefbf4] px-[6px] py-[1px] text-[10px] font-bold text-[#0f9f5d]">NEW</span>}
      </span>
    ),
  },
  { key: 'institution', label: 'Institution', width: '16%', render: r => r.institution },
  { key: 'amount',      label: 'Amount',      width: '16%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'issued',      label: 'Issued',      width: '14%', render: r => fmtDate(r.issuedDate) },
  { key: 'expiry',      label: 'Expiry',      width: '14%', render: r => r.expiry ? fmtDate(r.expiry) : '—' },
  { key: 'status',      label: 'Status',      width: '14%', render: r => statusBadge[r.status] },
]

export default function TokenInbox() {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = filter === 'all' ? allTokens : allTokens.filter(t => t.status === filter)

  return (
    <>
      <PageHeader
        title="Token Inbox"
        actions={<Button variant="secondary"><Icon name="download" size={14} />Export</Button>}
      />
      <div className="px-[36px] pb-[40px]">
        <StatCardGroup>
          {[
            { label: 'Total Tokens',  value: allTokens.length,                                        color: 'text-[#111]' },
            { label: 'Active',        value: allTokens.filter(t => t.status === 'active').length,      color: 'text-[#0f9f5d]' },
            { label: 'Unsubmitted',   value: allTokens.filter(t => t.status === 'unsubmitted').length, color: 'text-[#df6b13]' },
            { label: 'Flagged',       value: allTokens.filter(t => t.status === 'flagged').length,     color: 'text-[#de3d36]' },
          ].map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} valueClassName={s.color} />
          ))}
        </StatCardGroup>

        <div className="mb-[14px] mt-[28px] flex gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px] w-fit">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={clsx('rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium transition-colors',
                filter === f.key ? 'bg-[#f4f4f4] text-[#111] shadow-sm' : 'text-[#888] hover:text-[#555]')}>
              {f.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns} data={filtered} rowKey={r => r.id}
          rowActions={r => [
            { label: 'View Token',    onClick: () => {} },
            { label: 'Submit to Bank',onClick: () => {}, disabled: r.status !== 'unsubmitted' },
            { label: 'Report Issue',  onClick: () => {}, destructive: true },
          ]}
        />
      </div>
    </>
  )
}
