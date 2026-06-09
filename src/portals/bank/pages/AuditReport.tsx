import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'

interface AuditEntry {
  id: string; action: string; actor: string; tokenCode: string | null; amount: number | null
  timestamp: string; outcome: 'success' | 'warning' | 'error'
}

const entries: AuditEntry[] = [
  { id: 'a1',  action: 'Cash Released',       actor: 'Dr. Ama Boateng', tokenCode: 'TKN-2025-00891', amount: 420000, timestamp: '2025-04-01T09:14:00', outcome: 'success' },
  { id: 'a2',  action: 'Token Validated',      actor: 'Kwame Asante',    tokenCode: 'TKN-2025-00893', amount: 210000, timestamp: '2025-04-01T08:52:00', outcome: 'success' },
  { id: 'a3',  action: 'Token Rejected',       actor: 'Dr. Ama Boateng', tokenCode: 'TKN-2025-00880', amount: 290000, timestamp: '2025-03-28T15:37:00', outcome: 'error' },
  { id: 'a4',  action: 'Duplicate Submission', actor: 'System',           tokenCode: 'TKN-2025-00871', amount: 210000, timestamp: '2025-03-25T11:20:00', outcome: 'warning' },
  { id: 'a5',  action: 'Cash Released',        actor: 'Kwame Asante',    tokenCode: 'TKN-2025-00860', amount: 175000, timestamp: '2025-03-20T14:05:00', outcome: 'success' },
  { id: 'a6',  action: 'Token Validated',      actor: 'Dr. Ama Boateng', tokenCode: 'TKN-2025-00855', amount: 320000, timestamp: '2025-03-18T10:44:00', outcome: 'success' },
  { id: 'a7',  action: 'Token Rejected',       actor: 'System',           tokenCode: 'TKN-2025-00840', amount:  98000, timestamp: '2025-03-15T16:22:00', outcome: 'error' },
]

const outcomeBadge: Record<AuditEntry['outcome'], React.ReactNode> = {
  success: <Badge variant="green">Success</Badge>,
  warning: <Badge variant="orange">Warning</Badge>,
  error:   <Badge variant="red">Error</Badge>,
}

const fmtTs = (ts: string) => {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const columns: Column<AuditEntry>[] = [
  { key: 'action',    label: 'Action',      width: '22%', render: r => <span className="font-medium text-[#111]">{r.action}</span> },
  { key: 'actor',     label: 'Actor',       width: '20%', render: r => r.actor },
  { key: 'token',     label: 'Token',       width: '20%', primaryKey: true, render: r => r.tokenCode || '—' },
  { key: 'amount',    label: 'Amount',      width: '16%', render: r => r.amount ? `GH₵${r.amount.toLocaleString()}` : '—' },
  { key: 'timestamp', label: 'Time',        width: '16%', render: r => fmtTs(r.timestamp) },
  { key: 'outcome',   label: 'Outcome',     width: '16%', render: r => outcomeBadge[r.outcome] },
]

export default function AuditReport() {
  const [period] = useState('April 2025')

  return (
    <>
      <PageHeader title="Audit Report" actions={<Button variant="secondary"><Download size={14} strokeWidth={2.2} />Export</Button>} />
      <div className="px-[36px] pb-[40px]">

        <div className="mb-[28px] grid grid-cols-3 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Total Actions',  value: entries.length,                                       color: 'text-[#111]' },
            { label: 'Warnings',       value: entries.filter(e => e.outcome === 'warning').length,   color: 'text-[#df6b13]' },
            { label: 'Errors',         value: entries.filter(e => e.outcome === 'error').length,     color: 'text-[#de3d36]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-[14px] flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#111]">Activity Log</h2>
          <button className="flex h-[32px] items-center gap-[6px] rounded-[8px] border border-[#e5e5e5] bg-white px-[12px] text-[13px] text-[#555] hover:bg-[#fafafa]">
            {period}
            <ChevronDown size={13} strokeWidth={2} className="text-[#aaa]" />
          </button>
        </div>

        <DataTable columns={columns} data={entries} rowKey={r => r.id} />
      </div>
    </>
  )
}
