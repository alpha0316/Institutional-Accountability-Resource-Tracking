import { useState } from 'react'
import { ShieldCheck, ShieldX, Search } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { clsx } from 'clsx'

type ValidationState = 'idle' | 'loading' | 'valid' | 'invalid'

interface TokenResult {
  code: string; supplier: string; institution: string; amount: number
  issuedDate: string; expiryDate: string; issuedBy: string
}

const MOCK_TOKENS: Record<string, TokenResult> = {
  'GOV-SAC-SEM1-005': { code: 'GOV-SAC-SEM1-005', supplier: 'Golden Harvest Foods', institution: 'St. Augustine College', amount: 620000, issuedDate: '2026-03-01', expiryDate: '2026-09-01', issuedBy: 'Ministry of Education' },
  'GOV-SAC-SEM1-002': { code: 'GOV-SAC-SEM1-002', supplier: 'SunGold Oils',          institution: 'St. Augustine College', amount: 180000, issuedDate: '2026-01-15', expiryDate: '2026-07-15', issuedBy: 'Ministry of Education' },
  'GOV-SAC-SEM1-004': { code: 'GOV-SAC-SEM1-004', supplier: 'National School Foods', institution: 'St. Augustine College', amount:  95000, issuedDate: '2026-02-05', expiryDate: '2026-08-05', issuedBy: 'Ministry of Education' },
  'GOV-OWS-SEM1-002': { code: 'GOV-OWS-SEM1-002', supplier: 'Northern Foods Ltd',   institution: 'Opoku Ware SHS',        amount: 215000, issuedDate: '2026-02-12', expiryDate: '2026-08-12', issuedBy: 'Ministry of Education' },
}

export default function ValidateToken() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<ValidationState>('idle')
  const [result, setResult] = useState<TokenResult | null>(null)

  function handleValidate() {
    if (!query.trim()) return
    setState('loading')
    setTimeout(() => {
      const found = MOCK_TOKENS[query.trim().toUpperCase()]
      if (found) { setResult(found); setState('valid') }
      else { setResult(null); setState('invalid') }
    }, 600)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <PageHeader title="Validate Token" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[24px] text-[13px] text-[#888]">Enter a Token ID to verify authenticity and eligibility for cash release.</p>

        {/* Search */}
        <div className="mb-[32px] flex gap-[10px]">
          <div className="flex h-[42px] flex-1 max-w-[460px] items-center gap-[10px] rounded-[12px] border border-[#e3e3e3] bg-white px-[14px] focus-within:border-[#4ea4ff] transition-colors">
            <Search size={16} strokeWidth={2.2} className="shrink-0 text-[#aaa]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleValidate()}
              placeholder="e.g. GOV-SAC-SEM1-005"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb] uppercase"
            />
          </div>
          <Button onClick={handleValidate} disabled={state === 'loading' || !query.trim()}>
            <ShieldCheck size={14} strokeWidth={2.5} />
            {state === 'loading' ? 'Checking…' : 'Validate'}
          </Button>
        </div>

        {/* Result */}
        {state === 'valid' && result && (
          <div className="max-w-[560px] overflow-hidden rounded-[16px] border border-[#98e9bd] bg-[#eefbf4]">
            <div className="flex items-center gap-[12px] border-b border-[#98e9bd]/60 px-[20px] py-[16px]">
              <ShieldCheck size={20} strokeWidth={2.2} className="text-[#0f9f5d]" />
              <p className="text-[15px] font-bold text-[#0f9f5d]">Token Valid</p>
              <Badge variant="green">Eligible for release</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-[24px] gap-y-[14px] px-[20px] py-[20px]">
              {[
                ['Token Code',  result.code],
                ['Institution', result.institution],
                ['Supplier',    result.supplier],
                ['Amount',      `GH₵${result.amount.toLocaleString()}`],
                ['Issued',      fmtDate(result.issuedDate)],
                ['Expires',     fmtDate(result.expiryDate)],
                ['Issued By',   result.issuedBy],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#888]">{label}</p>
                  <p className="mt-[2px] text-[14px] font-medium text-[#111]">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-[8px] border-t border-[#98e9bd]/60 px-[20px] py-[14px]">
              <Button>Release Cash</Button>
              <Button variant="secondary" onClick={() => setState('idle')}>Check Another</Button>
            </div>
          </div>
        )}

        {state === 'invalid' && (
          <div className="max-w-[460px] overflow-hidden rounded-[16px] border border-[#ffb9b4] bg-[#fff1f0] px-[20px] py-[20px]">
            <div className="flex items-center gap-[12px] mb-[8px]">
              <ShieldX size={20} strokeWidth={2.2} className="text-[#de3d36]" />
              <p className="text-[15px] font-bold text-[#de3d36]">Token Not Found</p>
            </div>
            <p className="text-[13px] text-[#de3d36]/80">
              No token matching <span className="font-mono font-bold">{query}</span> was found. Please verify the token code and try again.
            </p>
            <Button variant="secondary" className="mt-[14px]" onClick={() => setState('idle')}>Try Again</Button>
          </div>
        )}

        {state === 'idle' && (
          <div className={clsx('flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#e5e5e5] bg-[#fafafa] py-[48px] max-w-[560px]')}>
            <ShieldCheck size={32} strokeWidth={1.5} className="text-[#ccc]" />
            <p className="mt-[12px] text-[14px] font-medium text-[#bbb]">Enter a token ID to validate</p>
          </div>
        )}
      </div>
    </>
  )
}
