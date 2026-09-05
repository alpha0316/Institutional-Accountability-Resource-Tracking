import { useQuery } from '@tanstack/react-query'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { useAuthStore } from '../../../store/authStore'
import { listBankTransactions } from '../../../lib/api/bankTransactions'
import type { BankTransaction } from '../../../types'

const statusBadge: Record<BankTransaction['status'], React.ReactNode> = {
  released: <Badge variant="green">Released</Badge>,
  pending:  <Badge variant="orange">Pending</Badge>,
  rejected: <Badge variant="red">Rejected</Badge>,
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<BankTransaction>[] = [
  { key: 'tokenCode', label: 'Token Code',  width: '22%', primaryKey: true, render: r => r.tokenCode },
  { key: 'amount',    label: 'Amount',      width: '16%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'bank',      label: 'Bank',        width: '22%', render: () => 'Ghana Commercial Bank' },
  { key: 'date',      label: 'Processed',   width: '14%', render: r => r.processedAt ? fmtDate(r.processedAt) : '—' },
  { key: 'reason',    label: 'Reason',      width: '18%', render: r => r.reason ? <span className="text-[#888]">{r.reason}</span> : '—' },
  { key: 'status',    label: 'Status',      width: '8%',  render: r => statusBadge[r.status] },
]

export default function TransactionHistory() {
  const user = useAuthStore(s => s.user)
  const { data: allTransactions = [] } = useQuery({ queryKey: ['bank-transactions'], queryFn: listBankTransactions, refetchInterval: 5000 })
  const transactions = allTransactions.filter(t => t.supplierName === user?.name)

  const total = transactions.filter(t => t.status === 'released').reduce((a, t) => a + t.amount, 0)

  return (
    <>
      <PageHeader title="Transaction History" actions={<Button variant="secondary"><Icon name="download" size={14} />Export</Button>} />
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
