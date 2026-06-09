import { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import type { BankTransaction } from '../../../types'
import { clsx } from 'clsx'

const transactions: BankTransaction[] = [
  { id: 't1',  tokenId: '1',  tokenCode: 'TKN-2025-00891', supplierName: 'Agric Supplies Ltd',  amount: 420000, processedAt: '2025-04-01', status: 'released' },
  { id: 't2',  tokenId: '2',  tokenCode: 'TKN-2025-00893', supplierName: 'Fresh Mart Ltd',      amount: 210000, processedAt: '2025-04-02', status: 'released' },
  { id: 't3',  tokenId: '3',  tokenCode: 'TKN-2025-00895', supplierName: 'Agric Supplies Ltd',  amount: 175000, processedAt: '2025-04-03', status: 'released' },
  { id: 't4',  tokenId: '4',  tokenCode: 'TKN-2025-00892', supplierName: 'Ghana Foods Co.',     amount: 380000, processedAt: '2025-03-28', status: 'pending' },
  { id: 't5',  tokenId: '5',  tokenCode: 'TKN-2025-00880', supplierName: 'Agric Supplies Ltd',  amount: 290000, processedAt: '2025-03-20', status: 'rejected' },
  { id: 't6',  tokenId: '6',  tokenCode: 'TKN-2025-00871', supplierName: 'Northern Foods Ltd',  amount: 210000, processedAt: '2025-03-15', status: 'released' },
  { id: 't7',  tokenId: '7',  tokenCode: 'TKN-2024-00860', supplierName: 'Agric Supplies Ltd',  amount: 175000, processedAt: '2025-02-28', status: 'released' },
  { id: 't8',  tokenId: '8',  tokenCode: 'TKN-2024-00851', supplierName: 'Ghana Foods Co.',     amount: 320000, processedAt: '2025-02-15', status: 'released' },
]

type Filter = 'all' | BankTransaction['status']

const statusBadge: Record<BankTransaction['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<BankTransaction>[] = [
  { key: 'tokenCode',   label: 'Token Code',  width: '22%', primaryKey: true, render: r => r.tokenCode },
  { key: 'supplier',    label: 'Supplier',    width: '26%', render: r => r.supplierName },
  { key: 'amount',      label: 'Amount',      width: '16%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'processed',   label: 'Processed',   width: '16%', render: r => fmtDate(r.processedAt) },
  { key: 'status',      label: 'Status',      width: '12%', render: r => statusBadge[r.status] },
]

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'released', label: 'Released' },
  { key: 'pending',  label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
]

export default function TransactionLog() {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.status === filter)
  const totalReleased = transactions.filter(t => t.status === 'released').reduce((a, t) => a + t.amount, 0)

  return (
    <>
      <PageHeader title="Transaction Log" actions={<Button variant="secondary"><Download size={14} strokeWidth={2.2} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-4 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Released',  value: `GH₵${(totalReleased / 1e6).toFixed(2)}M`, color: 'text-[#0f9f5d]' },
            { label: 'Transactions',    value: transactions.length,                         color: 'text-[#111]' },
            { label: 'Pending',         value: transactions.filter(t => t.status === 'pending').length,  color: 'text-[#df6b13]' },
            { label: 'Rejected',        value: transactions.filter(t => t.status === 'rejected').length, color: 'text-[#de3d36]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-[14px] flex gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px] w-fit">
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
          rowActions={() => [
            { label: 'View Details',  onClick: () => {} },
            { label: 'Download PDF',  onClick: () => {} },
          ]}
        />
      </div>
    </>
  )
}
