import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'

import { BANK_CASH_READY, type BankReadyToken } from '../../../lib/mockData'

type ReadyToken = BankReadyToken

const readyTokens: ReadyToken[] = BANK_CASH_READY

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })

export default function CashRelease() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [released, setReleased] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const pending = readyTokens.filter(t => !released.has(t.id))
  const totalSelected = readyTokens.filter(t => selected.has(t.id)).reduce((a, t) => a + t.amount, 0)

  function handleRelease() {
    setReleased(prev => new Set([...prev, ...selected]))
    setSelected(new Set())
  }

  const columns: Column<ReadyToken>[] = [
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
    { key: 'code',        label: 'Token Code',  width: '19%', primaryKey: true, render: t => t.code },
    { key: 'supplier',    label: 'Supplier',    width: '20%', render: t => t.supplier },
    { key: 'institution', label: 'Institution', width: '20%', render: t => t.institution },
    { key: 'amount',      label: 'Amount',      width: '14%', render: t => `GH₵${t.amount.toLocaleString()}` },
    { key: 'validated',   label: 'Validated',   width: '12%', render: t => fmtDate(t.validatedAt) },
    { key: 'status',      label: 'Status',      width: '10%', render: () => <Badge variant="blue">Validated</Badge> },
  ]

  return (
    <>
      <PageHeader title="Cash Release" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">
          Validated tokens below are ready for cash disbursement to suppliers.
        </p>

        <DataTable
          columns={columns}
          data={pending}
          rowKey={t => t.id}
          onRowClick={t => toggle(t.id)}
          emptyMessage="All tokens have been released."
        />

        <div className="flex items-center justify-between rounded-[14px] border border-[#f0f0f0] bg-[#fafafa] px-[20px] py-[16px]">
          <div>
            <p className="text-[13px] text-[#888]">{selected.size} token{selected.size !== 1 ? 's' : ''} selected</p>
            <p className="text-[20px] font-bold text-[#111]">GH₵{totalSelected.toLocaleString()}</p>
          </div>
          <Button disabled={selected.size === 0} onClick={handleRelease}>
            <Icon name="cash-banknote" size={14} />
            Release Cash
          </Button>
        </div>

        {released.size > 0 && (
          <div className="mt-[24px] flex items-center gap-[10px] rounded-[12px] border border-[#98e9bd] bg-[#eefbf4] px-[16px] py-[12px]">
            <Icon name="circle-check" size={16} className="text-[#0f9f5d]" />
            <p className="text-[13px] font-medium text-[#0f9f5d]">
              {released.size} token{released.size > 1 ? 's' : ''} — cash successfully released to suppliers.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
