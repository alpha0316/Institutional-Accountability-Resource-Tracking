import { clsx } from 'clsx'

interface StatCardProps {
  label: string
  value: string | number
  sub?: React.ReactNode
  accent?: string
  badge?: React.ReactNode
  onClick?: () => void
}

export function StatCard({ label, value, sub, accent, badge, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={clsx(
        'relative flex-1 overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-white px-[24px] py-[20px] text-left transition-[filter]',
        accent,
        onClick && 'cursor-pointer hover:brightness-[0.97]'
      )}
      {...(onClick ? { onClick } : {})}
    >
      <p className="text-[13px] font-medium text-[#888]">{label}</p>
      <div className="mt-[10px] flex items-end justify-between gap-2">
        <p className="text-[28px] font-bold leading-none tracking-tight text-[#111]">{value}</p>
        {badge}
      </div>
      {sub !== undefined && (
        <div className="mt-[8px] text-[13px] text-[#888]">{sub}</div>
      )}
    </Tag>
  )
}

export function StatCardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-[1px] overflow-hidden rounded-[16px] border border-[#f0f0f0] bg-[#f0f0f0]">
      {children}
    </div>
  )
}
