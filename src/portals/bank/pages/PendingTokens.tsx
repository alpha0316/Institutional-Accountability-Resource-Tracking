import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'

import { BANK_PENDING_TOKENS, type BankPendingToken } from '../../../lib/mockData'

type PendingToken = BankPendingToken

const tokens: PendingToken[] = BANK_PENDING_TOKENS

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

const columns: Column<PendingToken>[] = [
  { key: 'code',        label: 'Token ID',    width: '22%', primaryKey: true, render: r => r.code },
  { key: 'supplier',    label: 'Supplier',    width: '22%', render: r => r.supplier },
  { key: 'institution', label: 'Institution', width: '16%', render: r => r.institution },
  { key: 'amount',      label: 'Amount',      width: '16%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'submitted',   label: 'Submitted',   width: '12%', render: r => fmtDate(r.submittedAt) },
  { key: 'priority',    label: 'Priority',    width: '12%', render: r => r.priority === 'high' ? <Badge variant="red">High</Badge> : <Badge variant="gray">Normal</Badge> },
]

export default function PendingTokens() {
  const highPri = tokens.filter(t => t.priority === 'high').length

  return (
    <>
      <PageHeader title="Pending Tokens" actions={<Button>Validate All</Button>} />
      <div className="px-[36px] pb-[40px]">

        {highPri > 0 && (
          <div className="mb-[22px] flex items-center gap-[12px] rounded-[12px] border border-[#ffd26b] bg-[#fff8ea] px-[16px] py-[12px]">
            <Icon name="clock" size={16} className="shrink-0 text-[#df6b13]" />
            <p className="text-[13px] font-medium text-[#df6b13]">
              {highPri} high-priority token{highPri > 1 ? 's' : ''} awaiting validation.
            </p>
          </div>
        )}

        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Pending',        value: tokens.length,    color: 'text-[#df6b13]' },
            { label: 'High Priority',  value: highPri,          color: 'text-[#de3d36]' },
            { label: 'Total Value',    value: `GH₵${(tokens.reduce((a, t) => a + t.amount, 0) / 1e6).toFixed(2)}M`, color: 'text-[#111]' },
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
            { label: 'Validate Token',  onClick: () => {} },
            { label: 'Request Info',    onClick: () => {} },
            { label: 'Reject Token',    onClick: () => {}, destructive: true },
          ]}
        />
      </div>
    </>
  )
}
