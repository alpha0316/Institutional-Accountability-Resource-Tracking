import { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import type { GovernmentToken } from '../../../types'
import { clsx } from 'clsx'

import { GOV_ALL_TOKENS } from '../../../lib/mockData'

const allTokens: GovernmentToken[] = GOV_ALL_TOKENS

type StatusFilter = 'all' | GovernmentToken['status']

const statusBadge: Record<GovernmentToken['status'], React.ReactNode> = {
  active:   <Badge variant="green">Active</Badge>,
  redeemed: <Badge variant="blue">Redeemed</Badge>,
  expired:  <Badge variant="gray">Expired</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
}

const columns: Column<GovernmentToken>[] = [
  { key: 'tokenCode',    label: 'Token ID',    width: '20%', primaryKey: true, render: r => r.tokenCode },
  { key: 'institution',  label: 'Institution', width: '16%', render: r => r.institutionName },
  { key: 'supplier',     label: 'Supplier',    width: '22%', render: r => r.supplierName },
  { key: 'value',        label: 'Value',       width: '14%', render: r => `GH₵${r.value.toLocaleString()}` },
  { key: 'issued',       label: 'Issued',      width: '12%', render: r => new Date(r.issuedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) },
  { key: 'expiry',       label: 'Expires',     width: '12%', render: r => new Date(r.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) },
  { key: 'status',       label: 'Status',      width: '14%', render: r => statusBadge[r.status] },
]

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'pending',  label: 'Pending' },
  { key: 'redeemed', label: 'Redeemed' },
  { key: 'expired',  label: 'Expired' },
  { key: 'rejected', label: 'Rejected' },
]

export default function TokenLedger() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = statusFilter === 'all' ? allTokens : allTokens.filter(t => t.status === statusFilter)
  const totalValue = allTokens.reduce((acc, t) => acc + t.value, 0)

  return (
    <>
      <PageHeader
        title="Token Ledger"
        actions={
          <Button variant="secondary">
            <Download size={14} strokeWidth={2.2} />
            Export CSV
          </Button>
        }
      />
      <div className="px-[36px] pb-[40px]">

        {/* Stats strip */}
        <div className="mb-[28px] grid grid-cols-5 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Tokens',  value: allTokens.length,                                     color: 'text-[#111]' },
            { label: 'Active',        value: allTokens.filter(t => t.status === 'active').length,   color: 'text-[#0f9f5d]' },
            { label: 'Pending',       value: allTokens.filter(t => t.status === 'pending').length,  color: 'text-[#df6b13]' },
            { label: 'Redeemed',      value: allTokens.filter(t => t.status === 'redeemed').length, color: 'text-[#4ea4ff]' },
            { label: 'Total Value',   value: `GH₵${(totalValue / 1e6).toFixed(1)}M`,               color: 'text-[#111]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[20px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-[14px] flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px] w-fit">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={clsx(
                'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium transition-colors',
                statusFilter === f.key
                  ? 'bg-[#f4f4f4] text-[#111] shadow-sm'
                  : 'text-[#888] hover:text-[#555]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey={r => r.id}
          rowActions={r => [
            { label: 'View Token',    onClick: () => {} },
            { label: 'Download PDF',  onClick: () => {} },
            { label: 'Revoke Token',  onClick: () => {}, destructive: true, disabled: r.status !== 'active' && r.status !== 'pending' },
          ]}
        />
      </div>
    </>
  )
}
