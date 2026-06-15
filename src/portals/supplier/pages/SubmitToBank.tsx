import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
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

        <div className="mb-[24px] overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-[6%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px]" />
                <th className="w-[28%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Token ID</th>
                <th className="w-[22%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Institution</th>
                <th className="w-[20%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Amount</th>
                <th className="w-[16%] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Issued</th>
                <th className="w-[8%] rounded-tr-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666]">Status</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => (
                <tr key={t.id} onClick={() => toggle(t.id)} className="h-[55px] cursor-pointer hover:bg-[#fbfbfb] transition-colors">
                  <td className="px-[16px]">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)}
                      className="h-[16px] w-[16px] cursor-pointer accent-[#4ea4ff]" onClick={e => e.stopPropagation()} />
                  </td>
                  <td className="px-[16px] text-[13px] font-medium text-[#4ea4ff] underline underline-offset-2">{t.code}</td>
                  <td className="px-[16px] text-[14px] text-[#3f3f3f]">{t.institution}</td>
                  <td className="px-[16px] text-[14px] text-[#3f3f3f]">GH₵{t.amount.toLocaleString()}</td>
                  <td className="px-[16px] text-[13px] text-[#555]">{new Date(t.issuedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                  <td className="px-[16px]"><Badge variant="orange">Unsubmitted</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
