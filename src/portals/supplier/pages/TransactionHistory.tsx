import { Download } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import type { BankTransaction } from '../../../types'

const transactions: BankTransaction[] = [
  { id: 't1', tokenId: '1', tokenCode: 'TKN-2025-00891', supplierName: 'Agric Supplies Ltd', amount: 420000, processedAt: '2025-04-02', status: 'released' },
  { id: 't2', tokenId: '2', tokenCode: 'TKN-2025-00880', supplierName: 'Agric Supplies Ltd', amount: 290000, processedAt: '2025-03-20', status: 'released' },
  { id: 't3', tokenId: '3', tokenCode: 'TKN-2025-00871', supplierName: 'Agric Supplies Ltd', amount: 210000, processedAt: '2025-03-10', status: 'released' },
  { id: 't4', tokenId: '4', tokenCode: 'TKN-2024-00860', supplierName: 'Agric Supplies Ltd', amount: 175000, processedAt: '2025-02-15', status: 'rejected' },
  { id: 't5', tokenId: '5', tokenCode: 'TKN-2024-00851', supplierName: 'Agric Supplies Ltd', amount: 320000, processedAt: '2025-01-28', status: 'released' },
]

const statusBadge: Record<BankTransaction['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<BankTransaction>[] = [
  { key: 'tokenCode', label: 'Token Code',  width: '26%', primaryKey: true, render: r => r.tokenCode },
  { key: 'amount',    label: 'Amount',      width: '20%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'bank',      label: 'Bank',        width: '28%', render: () => 'Ghana Commercial Bank' },
  { key: 'date',      label: 'Processed',   width: '16%', render: r => fmtDate(r.processedAt) },
  { key: 'status',    label: 'Status',      width: '10%', render: r => statusBadge[r.status] },
]

export default function TransactionHistory() {
  const total = transactions.filter(t => t.status === 'released').reduce((a, t) => a + t.amount, 0)

  return (
    <>
      <PageHeader title="Transaction History" actions={<Button variant="secondary"><Download size={14} strokeWidth={2.2} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Released', value: `GH₵${(total / 1e6).toFixed(2)}M`, color: 'text-[#0f9f5d]' },
            { label: 'Transactions',   value: transactions.length,                 color: 'text-[#111]' },
            { label: 'Rejected',       value: transactions.filter(t => t.status === 'rejected').length, color: 'text-[#de3d36]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={transactions} rowKey={r => r.id}
          rowActions={() => [
            { label: 'View Receipt', onClick: () => {} },
            { label: 'Download PDF', onClick: () => {} },
          ]}
        />
      </div>
    </>
  )
}
