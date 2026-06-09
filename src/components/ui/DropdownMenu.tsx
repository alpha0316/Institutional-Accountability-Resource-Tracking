import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

export interface DropdownMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

export function DropdownMenu({ items, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-[#686868] transition-colors hover:bg-[#f0f0f0]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round">
          <circle cx="9" cy="3" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="9" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open && (
        <div
          className={clsx(
            'absolute top-full z-50 mt-[4px] min-w-[180px] overflow-hidden rounded-[10px] border border-[#efefef] bg-white py-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                item.onClick()
              }}
              className={clsx(
                'flex w-full items-center gap-[10px] px-[14px] py-[9px] text-left text-[13px] leading-none transition-colors',
                item.destructive
                  ? 'text-[#de3d36] hover:bg-[#fff1f0]'
                  : 'text-[#3f3f3f] hover:bg-[#f5f5f5]',
                item.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
