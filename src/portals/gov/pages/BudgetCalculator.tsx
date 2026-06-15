import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { clsx } from 'clsx'

const MEAL_COST_PER_STUDENT_PER_DAY = 12.5 // GH₵
const ACADEMIC_DAYS_PER_SEMESTER = 85

function NumInput({
  label, hint, value, onChange, prefix,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; prefix?: string
}) {
  return (
    <div>
      <div className="mb-[6px] flex items-center gap-[6px]">
        <label className="text-[13px] font-semibold text-[#333]">{label}</label>
        {hint && (
          <div className="group relative">
            <Icon name="info-circle" size={13} className="cursor-pointer text-[#bbb]" />
            <div className="pointer-events-none absolute -top-[36px] left-1/2 z-10 hidden -translate-x-1/2 rounded-[6px] bg-[#111] px-[8px] py-[5px] text-[11px] text-white group-hover:block whitespace-nowrap">
              {hint}
            </div>
          </div>
        )}
      </div>
      <div className="flex h-[38px] items-center overflow-hidden rounded-[10px] border border-[#e3e3e3] bg-white focus-within:border-[#4ea4ff] transition-colors">
        {prefix && <span className="border-r border-[#e3e3e3] bg-[#fafafa] px-[12px] py-[10px] text-[13px] text-[#888]">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-[12px] text-[14px] text-[#111] outline-none"
        />
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={clsx(
      'rounded-[14px] border p-[20px]',
      highlight ? 'border-[#4ea4ff]/30 bg-[#f0f7ff]' : 'border-[#f0f0f0] bg-[#fafafa]'
    )}>
      <p className="text-[12px] font-medium text-[#888]">{label}</p>
      <p className={clsx('mt-[6px] text-[22px] font-bold', highlight ? 'text-[#4ea4ff]' : 'text-[#111]')}>{value}</p>
      {sub && <p className="mt-[4px] text-[11px] text-[#aaa]">{sub}</p>}
    </div>
  )
}

interface InstRow {
  name: string
  students: number
  days: number
  rateOverride?: number
}

export default function BudgetCalculator() {
  const [students, setStudents] = useState('284320')
  const [days, setDays] = useState(String(ACADEMIC_DAYS_PER_SEMESTER))
  const [rate, setRate] = useState(String(MEAL_COST_PER_STUDENT_PER_DAY))
  const [coverage, setCoverage] = useState('100')

  const s = Number(students) || 0
  const d = Number(days) || 0
  const r = Number(rate) || 0
  const cov = Math.min(100, Math.max(0, Number(coverage) || 0))

  const total       = s * d * r
  const covered     = total * (cov / 100)
  const gap         = total - covered
  const tokensNeeded = Math.ceil(covered / 420000)

  const breakdown: InstRow[] = [
    { name: 'Opoku Ware SHS',     students: 42000,  days: d },
    { name: 'Achimota SHS',  students: 38500,  days: d },
    { name: 'Mfantsipim SHS',       students: 28000,  days: d },
    { name: 'Tamale SHS',       students: 18500,  days: d },
    { name: 'Wesley Girls SHS',       students: 22000,  days: d },
    { name: 'Other',     students: s - (42000 + 38500 + 28000 + 18500 + 22000), days: d },
  ].filter(i => i.students > 0)

  const fmt = (n: number) => n < 0 ? '—' : `GH₵${Math.round(n).toLocaleString()}`

  return (
    <>
      <PageHeader title="Budget Calculator" />
      <div className="px-[36px] pb-[40px]">
        <p className="mb-[28px] text-[13px] text-[#888]">
          Estimate total token budget required based on enrolment and meal costs.
        </p>

        <div className="grid grid-cols-[380px_1fr] gap-[24px] items-start">

          {/* Inputs */}
          <div className="rounded-[16px] border border-[#f0f0f0] bg-white p-[24px]">
            <div className="flex items-center gap-[8px] mb-[20px]">
              <Icon name="calculator" size={16} className="text-[#4ea4ff]" />
              <h2 className="text-[15px] font-bold text-[#111]">Parameters</h2>
            </div>
            <div className="space-y-[16px]">
              <NumInput
                label="Total Students Enrolled"
                hint="Verified active enrolments"
                value={students}
                onChange={setStudents}
              />
              <NumInput
                label="Academic Days"
                hint="Days meals are served per semester"
                value={days}
                onChange={setDays}
              />
              <NumInput
                label="Meal Cost Per Student Per Day"
                prefix="GH₵"
                value={rate}
                onChange={setRate}
              />
              <NumInput
                label="Government Coverage"
                hint="% of total cost covered by government tokens"
                prefix="%"
                value={coverage}
                onChange={setCoverage}
              />
            </div>
            <Button className="mt-[20px] w-full justify-center" onClick={() => {}}>
              Recalculate
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-[14px]">
            <div className="grid grid-cols-2 gap-[12px]">
              <ResultCard label="Total Meal Cost"       value={fmt(total)}        sub="Before government support" />
              <ResultCard label="Government Contribution" value={fmt(covered)}    sub={`${cov}% coverage`} highlight />
              <ResultCard label="Funding Gap"           value={fmt(gap)}          sub="Requires alternative funding" />
              <ResultCard label="Tokens Required"       value={tokensNeeded.toLocaleString()} sub="@ GH₵420,000 per token" />
            </div>

            {/* Per-institution breakdown */}
            <div className="overflow-hidden rounded-[16px] border-[0.5px] border-black/[0.06]">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="rounded-tl-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666] w-[35%]">Institution</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666] w-[20%]">Students</th>
                    <th className="bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666] w-[25%]">Est. Cost</th>
                    <th className="rounded-tr-[16px] bg-[#fbfbfb] px-[16px] py-[10px] text-left text-[13px] font-semibold text-[#666] w-[20%]">Govt. Share</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map(row => {
                    const rowCost = row.students * row.days * r
                    return (
                      <tr key={row.name} className="h-[50px] hover:bg-[#fbfbfb]">
                        <td className="px-[16px] text-[13px] font-medium text-[#111]">{row.name}</td>
                        <td className="px-[16px] text-[13px] text-[#555]">{row.students.toLocaleString()}</td>
                        <td className="px-[16px] text-[13px] text-[#555]">{fmt(rowCost)}</td>
                        <td className="px-[16px] text-[13px] text-[#4ea4ff]">{fmt(rowCost * cov / 100)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
