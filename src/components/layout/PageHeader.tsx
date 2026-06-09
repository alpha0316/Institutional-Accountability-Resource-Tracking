import { Search, HelpCircle, Bell } from 'lucide-react'

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white">
      <div className="flex h-[88px] items-center gap-[12px] pl-[36px] pr-[20px]">
        <h1 className="text-[17px] font-semibold leading-none text-black">{title}</h1>
        <div className="flex-1" />

        {/* search */}
        <div className="flex h-[34px] w-[204px] items-center gap-[10px] rounded-[13px] border border-[#ededed] bg-[#fcfcfc] px-[13px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.01)]">
          <Search size={16} strokeWidth={2.2} className="shrink-0 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#555] outline-none placeholder:text-[#8d8d8d]"
          />
        </div>

        {/* icon buttons */}
        <button className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fafafa] text-[#8f8f8f] transition-colors hover:bg-[#f2f2f2]">
          <HelpCircle size={17} strokeWidth={2.1} />
        </button>
        <button className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#fafafa] text-[#8f8f8f] transition-colors hover:bg-[#f2f2f2]">
          <Bell size={17} strokeWidth={2.1} fill="currentColor" />
        </button>

        {actions}
      </div>
    </div>
  )
}
