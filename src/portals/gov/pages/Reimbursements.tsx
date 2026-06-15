import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import type { ReimbursementClaim } from '../../../types'
import { clsx } from 'clsx'

import { GOV_REIMBURSEMENTS } from '../../../lib/mockData'

const allClaims: (ReimbursementClaim & { institution: string; period: string })[] = GOV_REIMBURSEMENTS

type Filter = 'all' | ReimbursementClaim['status']

const statusBadge: Record<ReimbursementClaim['status'], React.ReactNode> = {
  approved: <Badge variant="green">Approved</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
  partial:  <Badge variant="blue">Partial</Badge>,
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All Claims' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending',  label: 'Pending' },
  { key: 'partial',  label: 'Partial' },
  { key: 'rejected', label: 'Rejected' },
]

type FullClaim = (typeof allClaims)[0]

const columns: Column<FullClaim>[] = [
  { key: 'id',           label: 'Claim ID',       width: '14%', primaryKey: true, render: r => r.id },
  { key: 'institution',  label: 'Institution',    width: '18%', render: r => <span className="font-medium text-[#111]">{r.institution}</span> },
  { key: 'period',       label: 'Period',         width: '14%', render: r => r.period },
  { key: 'claimed',      label: 'Claimed',        width: '16%', render: r => `GH₵${r.amountClaimed.toLocaleString()}` },
  { key: 'approved',     label: 'Approved',       width: '16%', render: r => r.amountApproved ? `GH₵${r.amountApproved.toLocaleString()}` : '—' },
  { key: 'submitted',    label: 'Submitted',      width: '12%', render: r => new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
  { key: 'status',       label: 'Status',         width: '10%', render: r => statusBadge[r.status] },
]

export default function Reimbursements() {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = filter === 'all' ? allClaims : allClaims.filter(c => c.status === filter)

  const totalClaimed  = allClaims.reduce((a, c) => a + c.amountClaimed, 0)
  const totalApproved = allClaims.reduce((a, c) => a + (c.amountApproved ?? 0), 0)
  const pending       = allClaims.filter(c => c.status === 'pending').length

  return (
    <>
      <PageHeader
        title="Reimbursements"
        actions={
          <Button variant="secondary">
            <Icon name="download" size={14} />
            Export
          </Button>
        }
      />
      <div className="px-[36px] pb-[40px]">

        {/* Stat strip */}
        <div className="mb-[28px] grid grid-cols-4 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Claimed',  value: `GH₵${(totalClaimed / 1e6).toFixed(2)}M`,  color: 'text-[#111]' },
            { label: 'Total Approved', value: `GH₵${(totalApproved / 1e6).toFixed(2)}M`, color: 'text-[#0f9f5d]' },
            { label: 'Pending Review', value: pending,                                    color: 'text-[#df6b13]' },
            { label: 'Institutions',   value: allClaims.length,                           color: 'text-[#111]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-[14px] flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px] w-fit">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium transition-colors',
                filter === f.key
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
            { label: 'View Report',    onClick: () => {} },
            { label: 'Approve Claim',  onClick: () => {}, disabled: r.status !== 'pending' },
            { label: 'Reject Claim',   onClick: () => {}, destructive: true, disabled: r.status !== 'pending' },
          ]}
        />
      </div>
    </>
  )
}
