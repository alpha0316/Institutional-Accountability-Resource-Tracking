import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { AlertTriangle } from 'lucide-react'
import type { ReorderLevel } from '../../../types'

const items: ReorderLevel[] = [
  { id: '1', itemType: 'Rice (50kg bags)',       unit: 'bags',  currentStock: 120, minStock: 200, status: 'low' },
  { id: '2', itemType: 'Cooking Oil (5L)',        unit: 'cans',  currentStock:  18, minStock:  50, status: 'critical' },
  { id: '3', itemType: 'Tomatoes (crate)',        unit: 'crates',currentStock:  60, minStock:  80, status: 'low' },
  { id: '4', itemType: 'Beans (50kg bags)',       unit: 'bags',  currentStock: 350, minStock: 100, status: 'ok' },
  { id: '5', itemType: 'Plantain (bunch)',        unit: 'bunches',currentStock: 240, minStock: 150, status: 'ok' },
  { id: '6', itemType: 'Chicken (frozen, kg)',    unit: 'kg',    currentStock:  90, minStock: 200, status: 'critical' },
  { id: '7', itemType: 'Yam (tubers)',            unit: 'tubers',currentStock: 500, minStock: 300, status: 'ok' },
  { id: '8', itemType: 'Vegetables (assorted)',   unit: 'kg',    currentStock:  35, minStock:  60, status: 'low' },
]

const statusBadge: Record<ReorderLevel['status'], React.ReactNode> = {
  ok:       <Badge variant="green">OK</Badge>,
  low:      <Badge variant="orange">Low</Badge>,
  critical: <Badge variant="red">Critical</Badge>,
}

function StockBar({ current, min }: { current: number; min: number }) {
  const pct = Math.min(100, Math.round((current / min) * 100))
  const color = pct >= 100 ? 'bg-[#0f9f5d]' : pct >= 50 ? 'bg-[#df6b13]' : 'bg-[#de3d36]'
  return (
    <div className="flex items-center gap-[8px]">
      <div className="h-[6px] w-[80px] overflow-hidden rounded-full bg-[#f0f0f0]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[12px] text-[#888]">{current} / {min}</span>
    </div>
  )
}

const columns: Column<ReorderLevel>[] = [
  { key: 'item',    label: 'Item',           width: '35%', render: r => <span className="font-medium text-[#111]">{r.itemType}</span> },
  { key: 'unit',    label: 'Unit',           width: '12%', render: r => r.unit },
  { key: 'stock',   label: 'Stock / Min',    width: '28%', render: r => <StockBar current={r.currentStock} min={r.minStock} /> },
  { key: 'status',  label: 'Status',         width: '15%', render: r => statusBadge[r.status] },
  { key: 'reorder', label: 'Reorder Qty',    width: '10%', render: r => r.status !== 'ok' ? String(r.minStock * 2 - r.currentStock) : '—' },
]

export default function ReorderMonitor() {
  const critical = items.filter(i => i.status === 'critical').length
  const low      = items.filter(i => i.status === 'low').length

  return (
    <>
      <PageHeader title="Reorder Monitor" actions={<Button>Place Reorder</Button>} />
      <div className="px-[36px] pb-[40px]">

        {(critical > 0 || low > 0) && (
          <div className="mb-[22px] flex items-center gap-[12px] rounded-[12px] border border-[#ffd26b] bg-[#fff8ea] px-[16px] py-[12px]">
            <AlertTriangle size={16} strokeWidth={2.2} className="shrink-0 text-[#df6b13]" />
            <p className="text-[13px] font-medium text-[#df6b13]">
              {critical} critical and {low} low-stock items need attention.
            </p>
          </div>
        )}

        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Critical',   value: critical,                   color: 'text-[#de3d36]' },
            { label: 'Low Stock',  value: low,                        color: 'text-[#df6b13]' },
            { label: 'OK',         value: items.filter(i => i.status === 'ok').length, color: 'text-[#0f9f5d]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[26px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={items} rowKey={r => r.id}
          rowActions={r => [
            { label: 'Place Reorder', onClick: () => {}, disabled: r.status === 'ok' },
            { label: 'Update Stock',  onClick: () => {} },
          ]}
        />
      </div>
    </>
  )
}
