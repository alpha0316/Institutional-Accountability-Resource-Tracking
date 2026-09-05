import toast from 'react-hot-toast'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { usePaymentSessions } from '../hooks/usePaymentSessions'
import type { PaymentSession } from '../../../types'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

export default function PendingTokens() {
  const { pending, validate, reject } = usePaymentSessions()

  async function handleValidate(session: PaymentSession) {
    try {
      await validate(session.id)
      toast.success(`${session.tokenCode} validated`)
    } catch {
      toast.error('Could not validate')
    }
  }

  async function handleValidateAll() {
    let ok = 0
    for (const s of pending) {
      try { await validate(s.id); ok++ } catch { /* keep going */ }
    }
    if (ok > 0) toast.success(`${ok} token${ok > 1 ? 's' : ''} validated`)
  }

  async function handleReject(session: PaymentSession) {
    try {
      await reject(session.id)
      toast.success(`${session.tokenCode} rejected`)
    } catch {
      toast.error('Could not reject')
    }
  }

  const columns: Column<PaymentSession>[] = [
    { key: 'code',        label: 'Token ID',    width: '24%', primaryKey: true, render: r => r.tokenCode },
    { key: 'supplier',    label: 'Supplier',    width: '22%', render: r => r.supplierName },
    { key: 'institution', label: 'Institution', width: '18%', render: r => r.institutionName },
    { key: 'amount',      label: 'Amount',      width: '16%', render: r => `GH₵${r.amount.toLocaleString()}` },
    { key: 'submitted',   label: 'Submitted',   width: '14%', render: r => fmtDate(r.createdAt) },
    { key: 'status',      label: 'Status',      width: '6%',  render: () => <Badge variant="orange">Pending</Badge> },
  ]

  return (
    <>
      <PageHeader title="Pending Tokens" actions={<Button onClick={handleValidateAll} disabled={pending.length === 0}>Validate All</Button>} />
      <div className="px-[36px] pb-[40px]">
        <div className="mb-[28px] grid grid-cols-2 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Pending',     value: pending.length, color: 'text-[#df6b13]' },
            { label: 'Total Value', value: `GH₵${pending.reduce((a, t) => a + t.amount, 0).toLocaleString()}`, color: 'text-[#111]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns} data={pending} rowKey={r => r.id}
          emptyMessage="No pending tokens."
          rowActions={r => [
            { label: 'Validate Token', onClick: () => handleValidate(r) },
            { label: 'Reject Token',   onClick: () => handleReject(r), destructive: true },
          ]}
        />
      </div>
    </>
  )
}
