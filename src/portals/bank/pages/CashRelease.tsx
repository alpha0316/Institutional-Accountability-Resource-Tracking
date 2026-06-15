import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'

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

  return (
    <>
      <PageHeader title="Cash Release" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">
          Validated tokens below are ready for cash disbursement to suppliers.
        </p>

        <div className="mb-[24px] overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-[5%] rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px]" />
                {['Token Code','Supplier','Institution','Amount','Validated','Status'].map((h, i, arr) => (
                  <th key={h} className={`bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666] ${i === arr.length - 1 ? 'rounded-tr-[16px]' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={7} className="py-[40px] text-center text-[14px] text-[#aaa]">All tokens have been released.</td></tr>
              ) : pending.map(t => (
                <tr key={t.id} onClick={() => toggle(t.id)} className="h-[55px] cursor-pointer hover:bg-[#fbfbfb] transition-colors">
                  <td className="px-[16px]">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)}
                      className="h-[16px] w-[16px] accent-[#4ea4ff]" onClick={e => e.stopPropagation()} />
                  </td>
                  <td className="px-[16px] text-[13px] font-medium text-[#4ea4ff] underline underline-offset-2">{t.code}</td>
                  <td className="px-[16px] text-[14px] text-[#3f3f3f]">{t.supplier}</td>
                  <td className="px-[16px] text-[14px] text-[#3f3f3f]">{t.institution}</td>
                  <td className="px-[16px] text-[14px] text-[#3f3f3f]">GH₵{t.amount.toLocaleString()}</td>
                  <td className="px-[16px] text-[13px] text-[#555]">{fmtDate(t.validatedAt)}</td>
                  <td className="px-[16px]"><Badge variant="blue">Validated</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
