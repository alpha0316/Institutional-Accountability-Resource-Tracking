import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { usePaymentSessions } from '../hooks/usePaymentSessions'
import type { PaymentSession } from '../../../types'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

export default function CashRelease() {
  const { processing, release } = usePaymentSessions()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [releasing, setReleasing] = useState(false)
  const [justReleased, setJustReleased] = useState(0)

  const toggle = (id: string) => setSelected(s => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })
  const totalSelected = processing.filter(t => selected.has(t.id)).reduce((a, t) => a + t.amount, 0)

  async function handleRelease() {
    const ids = [...selected]
    setReleasing(true)
    try {
      await Promise.all(ids.map(id => release(id)))
      toast.success(`${ids.length} token${ids.length > 1 ? 's' : ''} — cash released`)
      setJustReleased(ids.length)
      setSelected(new Set())
    } catch {
      toast.error('Could not release cash for one or more tokens')
    } finally {
      setReleasing(false)
    }
  }

  const columns: Column<PaymentSession>[] = [
    {
      key: 'select',
      label: '',
      icon: 'square-check',
      width: '5%',
      render: (t) => (
        <input
          type="checkbox"
          checked={selected.has(t.id)}
          onChange={() => toggle(t.id)}
          className="h-[16px] w-[16px] accent-[#4ea4ff]"
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    { key: 'code',        label: 'Token Code',  width: '19%', primaryKey: true, render: t => t.tokenCode },
    { key: 'supplier',    label: 'Supplier',    width: '20%', render: t => t.supplierName },
    { key: 'institution', label: 'Institution', width: '20%', render: t => t.institutionName },
    { key: 'amount',      label: 'Amount',      width: '14%', render: t => `GH₵${t.amount.toLocaleString()}` },
    { key: 'validated',   label: 'Submitted',   width: '12%', render: t => fmtDate(t.createdAt) },
    { key: 'status',      label: 'Status',      width: '10%', render: () => <Badge variant="blue">Validated</Badge> },
  ]

  return (
    <>
      <PageHeader title="Cash Release" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">
          Live — validated tokens below are ready for cash disbursement to suppliers.
        </p>

        <DataTable
          columns={columns}
          data={processing}
          rowKey={t => t.id}
          onRowClick={t => toggle(t.id)}
          emptyMessage="No tokens ready for release."
        />

        <div className="flex items-center justify-between rounded-[14px] border border-[#f0f0f0] bg-[#fafafa] px-[20px] py-[16px]">
          <div>
            <p className="text-[13px] text-[#888]">{selected.size} token{selected.size !== 1 ? 's' : ''} selected</p>
            <p className="text-[20px] font-bold text-[#111]">GH₵{totalSelected.toLocaleString()}</p>
          </div>
          <Button disabled={selected.size === 0 || releasing} onClick={handleRelease}>
            <Icon name="cash-banknote" size={14} />
            {releasing ? 'Releasing…' : 'Release Cash'}
          </Button>
        </div>

        {justReleased > 0 && (
          <div className="mt-[24px] flex items-center gap-[10px] rounded-[12px] border border-[#98e9bd] bg-[#eefbf4] px-[16px] py-[12px]">
            <Icon name="circle-check" size={16} className="text-[#0f9f5d]" />
            <p className="text-[13px] font-medium text-[#0f9f5d]">
              {justReleased} token{justReleased > 1 ? 's' : ''} — cash successfully released to suppliers.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
