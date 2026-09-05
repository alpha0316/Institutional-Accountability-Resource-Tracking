import { useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { useBankTransactions, useAllTokens } from '../hooks/usePaymentSessions'
import type { BankTransaction } from '../../../types'

interface RejectedRow extends BankTransaction {
  institutionName: string
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<RejectedRow>[] = [
  { key: 'code',        label: 'Token Code',  width: '18%', primaryKey: true, render: r => r.tokenCode },
  { key: 'supplier',    label: 'Supplier',    width: '20%', render: r => r.supplierName },
  { key: 'institution', label: 'Institution', width: '14%', render: r => r.institutionName },
  { key: 'amount',      label: 'Amount',      width: '14%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'reason',      label: 'Reason',      width: '20%', render: r => <span className="text-[#888]">{r.reason || '—'}</span> },
  { key: 'date',        label: 'Rejected',    width: '10%', render: r => r.processedAt ? fmtDate(r.processedAt) : '—' },
  { key: 'status',      label: '',            width: '4%',  render: () => <Badge variant="red">Rejected</Badge> },
]

export default function RejectedTokens() {
  const { data: transactions = [] } = useBankTransactions()
  const { data: tokens = [] } = useAllTokens()

  const rows: RejectedRow[] = useMemo(() => {
    const institutionByTokenId = new Map(tokens.map(t => [t.id, t.institutionName]))
    return transactions
      .filter(t => t.status === 'rejected')
      .map(t => ({ ...t, institutionName: institutionByTokenId.get(t.tokenId) ?? '—' }))
  }, [transactions, tokens])

  const totalAmount = rows.reduce((a, t) => a + t.amount, 0)
  const thisMonth = rows.filter(t => t.processedAt && new Date(t.processedAt).getMonth() === new Date().getMonth()).length

  return (
    <>
      <PageHeader title="Rejected Tokens" actions={<Button variant="secondary"><Icon name="download" size={14} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Rejected Tokens', value: rows.length,                          color: 'text-[#de3d36]' },
            { label: 'Value Withheld',  value: `GH₵${totalAmount.toLocaleString()}`, color: 'text-[#111]' },
            { label: 'This Month',      value: thisMonth,                            color: 'text-[#df6b13]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable columns={columns} data={rows} rowKey={r => r.id} emptyMessage="No rejected tokens." />
      </div>
    </>
  )
}
