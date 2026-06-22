import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import { clsx } from 'clsx'
import { MOCK_GOV_CLAIMS } from '../../../lib/mockData'

import { SUPPLIER_TOKENS, SUPPLIER_DELIVERIES, type SupplierTokenItem, type SupplierDeliveryItem } from '../../../lib/mockData'

// ─── Types ────────────────────────────────────────────────────────────────────

type TokenStatus = 'redeemed' | 'unsubmitted' | 'flagged' | 'active'
type DeliveryStatus = 'delivered' | 'pending' | 'in_transit'

type SupplierToken = SupplierTokenItem
type Delivery = SupplierDeliveryItem

const tokens: SupplierToken[] = SUPPLIER_TOKENS.slice(0, 3)
const deliveries: Delivery[] = SUPPLIER_DELIVERIES

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tokenStatusBadge: Record<TokenStatus, React.ReactNode> = {
  redeemed:    <Badge variant="green">Redeemed</Badge>,
  unsubmitted: <Badge variant="orange">Unsubmitted</Badge>,
  flagged:     <Badge variant="red">Flagged</Badge>,
  active:      <Badge variant="blue">Active</Badge>,
}

const deliveryStatusBadge: Record<DeliveryStatus, React.ReactNode> = {
  delivered:  <Badge variant="green">Delivered</Badge>,
  pending:    <Badge variant="orange">Pending</Badge>,
  in_transit: <Badge variant="blue">In Transit</Badge>,
}

type TokenFilter = 'all' | TokenStatus

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupplierOverview() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TokenFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = tokens.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = t.code.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const tokenColumns: Column<SupplierToken>[] = [
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

  const deliveryColumns: Column<Delivery>[] = [
    { key: 'institution', label: 'Institution', width: '18%', primaryKey: true, render: (d) => d.institution },
    { key: 'items',       label: 'Items',       width: '28%', render: (d) => <span className="truncate">{d.items}</span> },
    { key: 'qty',         label: 'Qty',         width: '8%',  render: (d) => d.qty },
    { key: 'tokenRef',    label: 'Token Ref',   width: '18%', primaryKey: true, render: (d) => d.tokenRef },
    { key: 'date',        label: 'Date',        width: '14%', render: (d) => fmtDate(d.date) },
    { key: 'status',      label: 'Status',      width: '14%', render: (d) => deliveryStatusBadge[d.status] },
  ]

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <Button onClick={() => navigate('/supplier/submit-bank')}>
            <Icon name="send" size={14} />
            Submit Token To Bank
          </Button>
        }
      />

      <div className="px-[36px] pb-[40px]">
        {/* Stat cards */}
        <StatCardGroup>
          <StatCard
            label="Active Tokens"
            value="2"
            sub="Pending bank submission"
            accent="bg-white"
            badge={
              <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">
                <Icon name="arrow-up-right" size={12} />+25%
              </span>
            }
          />
          <StatCard
            label="Token Value"
            value="GH₵710K"
            sub="Available to redeem"
            accent="bg-gradient-to-br from-white to-green-50/60"
          />
          <StatCard
            label="Deliveries This Month"
            value="14"
            sub="To 6 institutions"
            accent="bg-gradient-to-br from-white to-orange-50/60"
          />
          <StatCard
            label="Items Below Reorder"
            value="3"
            sub={<span className="text-[#df6b13] font-medium">Action required</span>}
            accent="bg-gradient-to-br from-white to-red-50/60"
          />
        </StatCardGroup>

        {/* Claim Token Tracker — See government-approved claims */}
        <div className="mt-[28px] rounded-[14px] border border-[#efefef] bg-white p-[20px]">
          <h3 className="text-[16px] font-semibold text-black mb-[14px]">Approved Claims Awaiting Token</h3>
          <div className="space-y-[10px]">
            {MOCK_GOV_CLAIMS.filter(c =>
              c.stage === 'budget' || c.stage === 'token_generated' || c.stage === 'supplier_redemption'
            ).slice(0, 3).map(claim => (
              <div key={claim.id} className="flex items-center justify-between rounded-[10px] border border-[#f5f5f5] bg-[#fafafa] p-[14px]">
                <div>
                  <p className="text-[13px] font-semibold text-[#111]">{claim.school}</p>
                  <p className="text-[12px] text-[#888]">{claim.claimId} · {claim.semester}</p>
                </div>
                <div className="flex items-center gap-[12px]">
                  <span className="text-[14px] font-bold text-[#4ea4ff]">{claim.claimValue}</span>
                  <Badge variant={
                    claim.stage === 'budget' ? 'orange' :
                    claim.stage === 'token_generated' ? 'blue' : 'green'
                  }>
                    {claim.stage === 'budget' ? 'Pending Token' :
                     claim.stage === 'token_generated' ? 'Token Issued' : 'Redeemed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Inbox */}
        <div className="mt-[36px]">
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Token Inbox</h2>
          <div className="mb-[12px] flex items-center justify-between">
            <div className="flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px]">
              {(['all', 'redeemed', 'active', 'unsubmitted'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as TokenFilter)}
                  className={clsx(
                    'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium capitalize transition-colors',
                    filter === f ? 'bg-[#f4f4f4] text-[#111] shadow-sm' : 'text-[#888] hover:text-[#555]'
                  )}
                >
                  {f === 'all' ? 'All Tokens' : f === 'unsubmitted' ? 'Pending' : f.charAt(0).toUpperCase() + f.slice(1)}
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
            className="mb-[36px]"
            rowActions={(t) => [
              { label: 'View Token',     onClick: () => {} },
              { label: 'Submit to Bank', onClick: () => navigate('/supplier/submit-bank'), disabled: t.status !== 'unsubmitted' },
              { label: 'Report Issue',   onClick: () => {}, destructive: true },
            ]}
          />

          {/* Recent Deliveries */}
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Deliveries</h2>
          <DataTable columns={deliveryColumns} data={deliveries} rowKey={(d) => d.id} />
        </div>
      </div>
    </>
  )
}
