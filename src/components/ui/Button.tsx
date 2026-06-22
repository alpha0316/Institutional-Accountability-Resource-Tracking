import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-[#51a8ff] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#419cf6]',
  secondary: 'border border-[#e3e3e3] bg-white text-[#555] shadow-sm hover:bg-[#fafafa]',
  ghost:     'bg-transparent text-[#686868] hover:bg-[#f4f4f4]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-[30px] px-3 text-[12px] rounded-[9px]',
  md: 'h-[35px] px-[15px] text-[14px] rounded-[12px]',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center gap-[7px] whitespace-nowrap font-semibold leading-none transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
