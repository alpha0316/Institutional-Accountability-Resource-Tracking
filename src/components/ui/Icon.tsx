import { clsx } from 'clsx'

// Universal Tabler icon component — uses webfont classes
// Usage: <Icon name="plus" size={14} />
// Reference: https://tabler.io/icons

interface IconProps {
  name: string
  size?: number
  className?: string
  stroke?: number
  color?: string
  filled?: boolean
}

export function Icon({ name, size = 16, className, stroke, color, filled }: IconProps) {
  const iconClass = filled ? `ti ti-${name}-filled` : `ti ti-${name}`
  return (
    <i
      className={clsx(iconClass, className)}
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        ...(color ? { color } : {}),
        ...(stroke ? { '--ti-stroke-width': `${stroke}px` } as React.CSSProperties : {}),
      }}
    />
  )
}
