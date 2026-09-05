import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/Icon'
import { useNotifications } from '../../hooks/useNotifications'

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', close)
      return () => document.removeEventListener('mousedown', close)
    }
  }, [open])

  return (
    <div className="sticky top-0 z-10 bg-white">
      <div className="flex h-[88px] items-center gap-[12px] pl-[36px] pr-[20px]">
        <h1 className="text-[17px] font-semibold leading-none text-black">{title}</h1>
        <div className="flex-1" />

        {/* search */}
        <div className="flex h-[34px] w-[204px] items-center gap-[10px] rounded-[13px] border border-[#ededed] bg-[#fcfcfc] px-[13px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.01)]">
          <Icon name="search" size={16} className="shrink-0 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#555] outline-none placeholder:text-[#8d8d8d]"
          />
        </div>

        {/* icon buttons */}
        <button className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fafafa] text-[#8f8f8f] transition-colors hover:bg-[#f2f2f2]">
          <Icon name="help-circle" size={17} />
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fafafa] text-[#8f8f8f] transition-colors hover:bg-[#f2f2f2]"
          >
            <Icon name="bell" size={17} />
            {unreadCount > 0 && (
              <span className="absolute right-[3px] top-[3px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#de3d36] px-[3px] text-[9px] font-bold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-[8px] w-[360px] overflow-hidden rounded-[14px] border border-[#efefef] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between border-b border-[#f2f2f2] px-[16px] py-[12px]">
                <p className="text-[13px] font-semibold text-black">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={() => markAllRead()} className="text-[11.5px] font-medium text-[#4ea4ff] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-[16px] py-[28px] text-center text-[12.5px] text-[#aaa]">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className="flex w-full flex-col items-start gap-[3px] border-b border-[#f7f7f7] px-[16px] py-[11px] text-left transition-colors last:border-0 hover:bg-[#fafafa]"
                    >
                      <div className="flex w-full items-center gap-[7px]">
                        {!n.read && <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#4ea4ff]" />}
                        <p className={`flex-1 truncate text-[12.5px] ${n.read ? 'font-medium text-[#666]' : 'font-semibold text-black'}`}>{n.title}</p>
                        <span className="shrink-0 text-[10.5px] text-[#aaa]">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-[12px] leading-snug text-[#888]">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {actions}
      </div>
    </div>
  )
}
