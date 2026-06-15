import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DropdownMenu } from '../../../components/ui/DropdownMenu'
import { clsx } from 'clsx'

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
        <div className="flex gap-[1px] overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-[#f0f0f0]">
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
                        { label: 'View Token',    onClick: () => {} },
                        { label: 'Submit to Bank',onClick: () => navigate('/supplier/submit-bank'), disabled: t.status !== 'unsubmitted' },
                        { label: 'Report Issue',  onClick: () => {}, destructive: true },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Deliveries */}
          <h2 className="mb-[16px] text-[17px] font-bold text-[#111]">Recent Deliveries</h2>
          <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[18%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Institution</th>
                  <th className="w-[28%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Items</th>
                  <th className="w-[8%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Qty</th>
                  <th className="w-[18%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Token Ref</th>
                  <th className="w-[14%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Date</th>
                  <th className="w-[14%] rounded-tr-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id} className="h-[55px] hover:bg-[#fbfbfb] transition-colors">
                    <td className="px-[16px] text-[14px] font-medium text-[#111]">{d.institution}</td>
                    <td className="px-[16px] text-[13px] text-[#555] truncate">{d.items}</td>
                    <td className="px-[16px] text-[14px] text-[#3f3f3f]">{d.qty}</td>
                    <td className="px-[16px] text-[13px] font-medium text-[#4ea4ff] underline underline-offset-2">{d.tokenRef}</td>
                    <td className="px-[16px] text-[13px] text-[#555]">{fmtDate(d.date)}</td>
                    <td className="px-[16px]">{deliveryStatusBadge[d.status]}</td>
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
