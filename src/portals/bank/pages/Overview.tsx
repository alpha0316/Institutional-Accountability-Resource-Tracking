import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
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

  const tokenColumns: Column<PendingToken>[] = [
    {
      key: 'code',
      label: 'Token ID',
      width: '32%',
      render: (t) => (
        <span className="inline-flex min-w-0 items-center gap-[6px]">
          <span className="truncate">{t.code}</span>
          {t.isNew && (
            <span className="rounded-full bg-[#eefbf4] px-[6px] py-[1px] text-[10px] font-bold text-[#0f9f5d]">NEW</span>
          )}
        </span>
      ),
    },
    { key: 'amount', label: 'Amount', width: '20%', render: (t) => `GH₵${t.amount.toLocaleString()}` },
    { key: 'expiry', label: 'Expiry', width: '22%', render: (t) => t.expiry ? fmtDate(t.expiry) : '—' },
    { key: 'status', label: 'Status', width: '16%', render: (t) => tokenStatusBadge[t.status] },
  ]

  const transactionColumns: Column<BankTransaction>[] = [
    { key: 'tokenCode', label: 'Token Code', width: '26%', primaryKey: true, render: (t) => t.tokenCode },
    { key: 'supplier',  label: 'Supplier',   width: '26%', render: (t) => t.supplierName },
    { key: 'amount',    label: 'Amount',     width: '18%', render: (t) => `GH₵${t.amount.toLocaleString()}` },
    { key: 'date',      label: 'Date',       width: '16%', render: (t) => fmtDate(t.processedAt) },
    { key: 'status',    label: 'Status',     width: '14%', render: (t) => txStatusBadge[t.status] },
  ]

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
        <StatCardGroup>
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
        </StatCardGroup>

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

          <DataTable
            columns={tokenColumns}
            data={filtered}
            rowKey={(t) => t.id}
            emptyMessage="No pending tokens found."
            className="mb-[36px]"
            rowActions={(t) => [
              { label: 'Validate Token', onClick: () => navigate('/bank/validate'), disabled: t.status !== 'pending' },
              { label: 'Release Cash',   onClick: () => navigate('/bank/cash-release'), disabled: t.status !== 'released' },
              { label: 'Reject Token',   onClick: () => {}, destructive: true, disabled: t.status !== 'pending' },
            ]}
          />

          {/* Recent Transactions */}
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Transactions</h2>
          <DataTable columns={transactionColumns} data={recentTransactions} rowKey={(t) => t.id} />
        </div>
      </div>
    </>
  )
}
