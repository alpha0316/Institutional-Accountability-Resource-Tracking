import { Download } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'

interface RejectedToken {
  id: string; code: string; supplier: string; institution: string
  amount: number; rejectedAt: string; reason: string
}

const tokens: RejectedToken[] = [
  { id: 'r1', code: 'GOV-SAC-SEM1-003', supplier: 'Ashanti Agro Supplies', institution: 'St. Augustine College', amount: 210000, rejectedAt: '2026-03-08', reason: 'Supplier verification failed — pending re-registration' },
  { id: 'r2', code: 'GOV-SAC-SEM1-007', supplier: 'Golden Harvest Foods',  institution: 'St. Augustine College', amount: 200000, rejectedAt: '2025-08-20', reason: 'Token submitted after expiry date' },
  { id: 'r3', code: 'GOV-ACH-SEM2-001', supplier: 'Northern Foods Ltd',    institution: 'Achimota SHS',           amount: 178000, rejectedAt: '2026-03-02', reason: 'Duplicate submission attempt' },
]

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<RejectedToken>[] = [
  { key: 'code',        label: 'Token Code',  width: '20%', primaryKey: true, render: r => r.code },
  { key: 'supplier',    label: 'Supplier',    width: '22%', render: r => r.supplier },
  { key: 'institution', label: 'Institution', width: '14%', render: r => r.institution },
  { key: 'amount',      label: 'Amount',      width: '14%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'reason',      label: 'Reason',      width: '24%', render: r => <span className="text-[#888]">{r.reason}</span> },
  { key: 'date',        label: 'Rejected',    width: '12%', render: r => fmtDate(r.rejectedAt) },
  { key: 'status',      label: '',            width: '10%', render: () => <Badge variant="red">Rejected</Badge> },
]

export default function RejectedTokens() {
  const totalAmount = tokens.reduce((a, t) => a + t.amount, 0)

  return (
    <>
      <PageHeader title="Rejected Tokens" actions={<Button variant="secondary"><Download size={14} strokeWidth={2.2} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Rejected Tokens', value: tokens.length,                       color: 'text-[#de3d36]' },
            { label: 'Value Withheld',  value: `GH₵${totalAmount.toLocaleString()}`, color: 'text-[#111]' },
            { label: 'This Month',      value: tokens.filter(t => t.rejectedAt.startsWith('2025-03') || t.rejectedAt.startsWith('2025-04')).length, color: 'text-[#df6b13]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={tokens} rowKey={r => r.id}
          rowActions={() => [
            { label: 'View Details',    onClick: () => {} },
            { label: 'Notify Supplier', onClick: () => {} },
          ]}
        />
      </div>
    </>
  )
}
