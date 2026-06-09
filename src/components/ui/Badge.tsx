import { clsx } from 'clsx'

export type BadgeVariant = 'green' | 'orange' | 'red' | 'blue' | 'gray'

const variants: Record<BadgeVariant, string> = {
  green:  'bg-[#eefbf4] text-[#0f9f5d] border-[#98e9bd]',
  orange: 'bg-[#fff8ea] text-[#df6b13] border-[#ffd26b]',
  red:    'bg-[#fff1f0] text-[#de3d36] border-[#ffb9b4]',
  blue:   'bg-[#f0f7ff] text-[#4ea4ff] border-[#d7eaff]',
  gray:   'bg-[#f5f5f5] text-[#777] border-[#e5e5e5]',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-[7px] py-[1px] text-[12px] font-semibold leading-[18px]',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
