import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { clsx } from 'clsx'

interface SubmittableToken { id: string; code: string; institution: string; amount: number; issuedDate: string }

const tokens: SubmittableToken[] = [
  { id: '1', code: 'GOV-SAC-SEM1-005', institution: 'St. Augustine College', amount: 620000, issuedDate: '2026-03-01' },
]

export default function SubmitToBank() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const toggle = (id: string) => setSelected(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const totalSelected = tokens.filter(t => selected.has(t.id)).reduce((a, t) => a + t.amount, 0)

  function handleSubmit() {
    if (selected.size === 0) return
    setSubmitted(true)
  }

  const columns: Column<SubmittableToken>[] = [
    {
      key: 'select',
      label: '',
      icon: 'square-check',
      width: '6%',
      render: (t) => (
        <input
          type="checkbox"
          checked={selected.has(t.id)}
          onChange={() => toggle(t.id)}
          className="h-[16px] w-[16px] cursor-pointer accent-[#4ea4ff]"
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    { key: 'code',        label: 'Token ID',    width: '28%', primaryKey: true, render: t => t.code },
    { key: 'institution', label: 'Institution', width: '22%', render: t => t.institution },
    { key: 'amount',      label: 'Amount',      width: '20%', render: t => `GH₵${t.amount.toLocaleString()}` },
    {
      key: 'issued',
      label: 'Issued',
      width: '16%',
      render: t => new Date(t.issuedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }),
    },
    { key: 'status', label: 'Status', width: '8%', render: () => <Badge variant="orange">Unsubmitted</Badge> },
  ]

  if (submitted) {
    return (
      <>
        <PageHeader title="Submit to Bank" />
        <div className="px-[36px] pt-[60px] flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#eefbf4]">
            <Icon name="circle-check" size={32} className="text-[#0f9f5d]" />
          </div>
          <h2 className="mt-[16px] text-[20px] font-bold text-[#111]">Tokens Submitted</h2>
          <p className="mt-[6px] text-[14px] text-[#888]">
            {selected.size} token{selected.size > 1 ? 's' : ''} totalling GH₵{totalSelected.toLocaleString()} have been submitted to Ghana Commercial Bank for processing.
          </p>
          <Button className="mt-[24px]" variant="secondary" onClick={() => { setSubmitted(false); setSelected(new Set()) }}>
            Submit More Tokens
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Submit to Bank" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">
          Select unsubmitted tokens below and submit them to Ghana Commercial Bank for cash release.
        </p>

        <DataTable
          columns={columns}
          data={tokens}
          rowKey={t => t.id}
          onRowClick={t => toggle(t.id)}
        />

        <div className={clsx('flex items-center justify-between rounded-[14px] border border-[#f0f0f0] bg-[#fafafa] px-[20px] py-[16px]', selected.size === 0 && 'opacity-50')}>
          <div>
            <p className="text-[13px] text-[#888]">{selected.size} token{selected.size !== 1 ? 's' : ''} selected</p>
            <p className="text-[20px] font-bold text-[#111]">GH₵{totalSelected.toLocaleString()}</p>
          </div>
          <Button disabled={selected.size === 0} onClick={handleSubmit}>
            <Icon name="send" size={14} />
            Submit to Bank
          </Button>
        </div>
      </div>
    </>
  )
}
