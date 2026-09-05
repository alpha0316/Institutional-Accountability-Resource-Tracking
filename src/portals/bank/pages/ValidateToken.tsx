import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { clsx } from 'clsx'
import { usePaymentSessions } from '../hooks/usePaymentSessions'
import type { PaymentSession } from '../../../types'

type ValidationState = 'idle' | 'valid' | 'invalid'

export default function ValidateToken() {
  const navigate = useNavigate()
  const { sessions, validate } = usePaymentSessions()
  const [query, setQuery] = useState('')
  const [state, setState] = useState<ValidationState>('idle')
  const [result, setResult] = useState<PaymentSession | null>(null)
  const [validating, setValidating] = useState(false)

  function handleValidate() {
    if (!query.trim()) return
    const found = sessions.find(s =>
      s.tokenCode.toUpperCase() === query.trim().toUpperCase() && (s.status === 'pending' || s.status === 'processing')
    )
    if (found) { setResult(found); setState('valid') }
    else { setResult(null); setState('invalid') }
  }

  async function confirmValidate() {
    if (!result) return
    setValidating(true)
    try {
      await validate(result.id)
      toast.success(`${result.tokenCode} validated — ready for cash release`)
      setResult({ ...result, status: 'processing' })
    } catch {
      toast.error('Could not validate — it may no longer be pending')
    } finally {
      setValidating(false)
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <PageHeader title="Validate Token" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">Enter a Token ID to verify a live submission and validate it for cash release.</p>

        {/* Search */}
        <div className="mb-[32px] flex gap-[10px]">
          <div className="flex h-[42px] flex-1 max-w-[460px] items-center gap-[10px] rounded-[12px] border border-[#e3e3e3] bg-white px-[14px] focus-within:border-[#4ea4ff] transition-colors">
            <Icon name="search" size={16} className="shrink-0 text-[#aaa]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleValidate()}
              placeholder="e.g. GOV-SAC-SEM1-005"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb] uppercase"
            />
          </div>
          <Button onClick={handleValidate} disabled={!query.trim()}>
            <Icon name="shield-check" size={14} />
            Look Up
          </Button>
        </div>

        {/* Result */}
        {state === 'valid' && result && (
          <div className={clsx(
            'max-w-[560px] overflow-hidden rounded-[16px] border',
            result.status === 'pending' ? 'border-[#98e9bd] bg-[#eefbf4]' : 'border-[#bfdbfe] bg-[#eff6ff]'
          )}>
            <div className={clsx('flex items-center gap-[12px] border-b px-[20px] py-[16px]', result.status === 'pending' ? 'border-[#98e9bd]/60' : 'border-[#bfdbfe]/60')}>
              <Icon name="shield-check" size={20} className={result.status === 'pending' ? 'text-[#0f9f5d]' : 'text-[#3b82f6]'} />
              <p className={clsx('text-[15px] font-bold', result.status === 'pending' ? 'text-[#0f9f5d]' : 'text-[#3b82f6]')}>
                {result.status === 'pending' ? 'Submission Found — Awaiting Validation' : 'Already Validated'}
              </p>
              <Badge variant={result.status === 'pending' ? 'green' : 'blue'}>
                {result.status === 'pending' ? 'Eligible' : 'Ready for release'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-[24px] gap-y-[14px] px-[20px] py-[20px]">
              {[
                ['Token Code',  result.tokenCode],
                ['Institution', result.institutionName],
                ['Supplier',    result.supplierName],
                ['Amount',      `GH₵${result.amount.toLocaleString()}`],
                ['Submitted',   fmtDate(result.createdAt)],
                ['Reference',   result.reference],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">{label}</p>
                  <p className="mt-[2px] text-[14px] font-medium text-[#111]">{value}</p>
                </div>
              ))}
            </div>
            <div className={clsx('flex gap-[8px] border-t px-[20px] py-[14px]', result.status === 'pending' ? 'border-[#98e9bd]/60' : 'border-[#bfdbfe]/60')}>
              {result.status === 'pending' ? (
                <Button onClick={confirmValidate} disabled={validating}>{validating ? 'Validating…' : 'Validate'}</Button>
              ) : (
                <Button onClick={() => navigate('/bank/cash-release')}>Go to Cash Release</Button>
              )}
              <Button variant="secondary" onClick={() => setState('idle')}>Check Another</Button>
            </div>
          </div>
        )}

        {state === 'invalid' && (
          <div className="max-w-[460px] overflow-hidden rounded-[16px] border border-[#ffb9b4] bg-[#fff1f0] px-[20px] py-[20px]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <Icon name="shield-x" size={20} className="text-[#de3d36]" />
              <p className="text-[15px] font-bold text-[#de3d36]">No Pending Submission Found</p>
            </div>
            <p className="text-[13px] text-[#de3d36]/80">
              No token matching <span className="font-mono font-bold">{query}</span> is currently awaiting validation. It may not have been submitted yet, or may already be resolved.
            </p>
            <Button variant="secondary" className="mt-[14px]" onClick={() => setState('idle')}>Try Again</Button>
          </div>
        )}

        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#e5e5e5] bg-[#fafafa] py-[48px] max-w-[560px]">
            <Icon name="shield-check" size={32} className="text-[#ccc]" />
            <p className="mt-[12px] text-[14px] font-medium text-[#bbb]">Enter a token ID to look it up</p>
          </div>
        )}
      </div>
    </>
  )
}
