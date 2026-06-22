import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: React.ReactNode
  accent?: string
  valueClassName?: string
  badge?: React.ReactNode
  onClick?: () => void
}

function textToneFromAccent(accent?: string) {
  return accent
    ?.split(' ')
    .filter((token) => token.startsWith('text-'))
    .join(' ')
}

export function StatCard({ label, value, sub, accent, valueClassName, badge, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div'
  const legacyValueTone = textToneFromAccent(accent)

  return (
    <Tag
      className={clsx(
        'relative min-w-0 flex-1 bg-transparent px-[18px] py-[18px] text-left transition-colors md:px-[24px]',
        onClick && 'cursor-pointer hover:brightness-[0.97]'
      )}
      {...(onClick ? { onClick } : {})}
    >
      <p className="truncate text-[14px] font-bold uppercase leading-none text-[#858585]">{label}</p>
      <div className="mt-[26px] flex min-h-[25px] items-end gap-[9px]">
        <p className={clsx('min-w-0 text-[24px] font-bold leading-none text-[#050505]', legacyValueTone, valueClassName)}>
          {value}
        </p>
        {badge && (
          <div className="mb-[1px] shrink-0 text-[13px] font-medium leading-none text-[#25b96f]">
            {badge}
          </div>
        )}
      </div>
      {sub !== undefined && (
        <div className="mt-[8px] truncate text-[13px] leading-[18px] text-[#8b8b8b]">{sub}</div>
      )}
    </Tag>
  )
}

export function StatCardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden rounded-[16px] border border-[#f5f5f5] bg-[#fbfbfb] shadow-[0_1px_0_rgba(0,0,0,0.02)] [&>*+*]:border-l [&>*+*]:border-dashed [&>*+*]:border-[#dedede]">
      {children}
    </div>
  )
}
