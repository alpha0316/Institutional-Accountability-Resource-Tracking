import { useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { useBankTransactions } from '../hooks/usePaymentSessions'

interface AuditEntry {
  id: string
  action: string
  tokenCode: string
  amount: number
  timestamp: string | null
  outcome: 'success' | 'error'
}

const outcomeBadge: Record<AuditEntry['outcome'], React.ReactNode> = {
  success: <Badge variant="green">Success</Badge>,
  error:   <Badge variant="red">Error</Badge>,
}

const fmtTs = (ts: string | null) => {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const columns: Column<AuditEntry>[] = [
  { key: 'action',    label: 'Action',      width: '26%', render: r => <span className="font-medium text-[#111]">{r.action}</span> },
  { key: 'token',     label: 'Token',       width: '22%', primaryKey: true, render: r => r.tokenCode },
  { key: 'amount',    label: 'Amount',      width: '18%', render: r => `GH₵${r.amount.toLocaleString()}` },
  { key: 'timestamp', label: 'Time',        width: '18%', render: r => fmtTs(r.timestamp) },
  { key: 'outcome',   label: 'Outcome',     width: '16%', render: r => outcomeBadge[r.outcome] },
]

export default function AuditReport() {
  const { data: transactions = [] } = useBankTransactions()

  // Derived from real BankTransaction rows — this demo has one Bank account, so there's no
  // per-officer actor to attribute an action to; "Bank" is the honest label for that.
  const entries: AuditEntry[] = useMemo(() =>
    [...transactions]
      .sort((a, b) => (b.processedAt ?? '').localeCompare(a.processedAt ?? ''))
      .map(t => ({
        id: t.id,
        action: t.status === 'released' ? 'Cash Released' : 'Token Rejected',
        tokenCode: t.tokenCode,
        amount: t.amount,
        timestamp: t.processedAt,
        outcome: t.status === 'released' ? 'success' : 'error',
      })),
    [transactions]
  )

  return (
    <>
      <PageHeader title="Audit Report" actions={<Button variant="secondary"><Icon name="download" size={14} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">

        <div className="mb-[28px] grid grid-cols-2 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Actions',  value: entries.length,                                       color: 'text-[#111]' },
            { label: 'Errors',         value: entries.filter(e => e.outcome === 'error').length,     color: 'text-[#de3d36]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-[14px] text-[17px] font-bold text-[#111]">Activity Log</h2>

        <DataTable columns={columns} data={entries} rowKey={r => r.id} emptyMessage="No activity yet." />
      </div>
    </>
  )
}
