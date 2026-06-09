import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  FileCheck2,
  BriefcaseBusiness,
  ClipboardCheck,
  PackageCheck,
  ShieldAlert,
  FileText,
  Settings,
  ChevronDown,
  PanelLeft,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import crestUrl from '../../assets/school/st-augustine-crest.png'

const navGroups = [
  {
    section: 'General',
    items: [
      { label: 'Overview',        to: '/admin',          icon: Home,              end: true },
      { label: 'Students',        to: '/admin/students', icon: FileCheck2 },
      { label: 'Card Management', to: '/admin/cards',    icon: BriefcaseBusiness },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Dining Hall Feed', to: '/admin/feed',    icon: ClipboardCheck },
      { label: 'Supply Logger',    to: '/admin/supply',  icon: PackageCheck },
      { label: 'Fraud Alerts',     to: '/admin/fraud',   icon: ShieldAlert },
      { label: 'Daily Report',     to: '/admin/reports', icon: FileText },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  const initial = user?.name ? user.name.trim()[0]?.toUpperCase() : 'U'
  const displayEmail = user?.role === 'school_admin'
    ? 'Princeessandoh@gmail.com'
    : (user?.email || '')

  return (
    <div className="w-[258px] h-screen flex shrink-0 flex-col border-r border-[#f3f3f3] bg-[#fbfbfb]">

      {/* school selector */}
      <div className="flex h-[80px] items-center px-[21px]">
        <img
          src={crestUrl}
          alt=""
          className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
        />
        <span className="ml-[10px] text-[17px] font-semibold leading-none text-[#3f3f3f]">
          St. Augustine SHS
        </span>
        <ChevronDown size={16} strokeWidth={2.2} className="ml-[7px] shrink-0 text-[#909090]" />
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#8d8d8d] transition-colors hover:bg-[#f0f0f0]"
        >
          <PanelLeft size={17} strokeWidth={2} />
        </button>
      </div>

      {/* navigation */}
      <nav className="flex-1 overflow-y-auto px-[20px] pb-4 pt-[5px]">
        {navGroups.map(({ section, items }) => (
          <div key={section} className="mb-[29px] last:mb-0">
            <p className="mb-[9px] text-[14px] font-semibold leading-5 text-[#8e8e8e]">
              {section}
            </p>
            <ul className="space-y-[4px]">
              {items.map(({ label, to, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      clsx(
                        'flex h-[29px] items-center gap-[12px] rounded-[8px] px-[9px] text-[15px] font-normal transition-colors',
                        isActive
                          ? 'bg-[#f4f4f4] text-[#4ea4ff]'
                          : 'text-[#9a9a9a] hover:bg-[#f2f2f2] hover:text-[#686868]'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={15}
                          strokeWidth={2.2}
                          className={isActive ? 'text-[#4ea4ff]' : 'text-[#9a9a9a]'}
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className="px-[20px] pb-[24px]">
        <button className="mb-[22px] flex h-[29px] w-full items-center gap-[12px] rounded-[8px] px-[9px] text-[15px] text-[#9a9a9a] transition-colors hover:bg-[#f2f2f2]">
          <Settings size={15} strokeWidth={2.2} className="text-[#9a9a9a]" />
          Settings
        </button>
        <button
          onClick={logout}
          className="flex w-full cursor-default items-center gap-[11px] rounded-[8px] px-[6px] py-0 text-left"
        >
          <div className="relative flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full bg-[#52aaff]">
            <span className="text-[18px] font-medium leading-none text-white">{initial}</span>
            <span className="absolute -bottom-[1px] -right-[1px] h-[7px] w-[7px] rounded-full border border-[#fbfbfb] bg-[#57d45e]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-[16px] text-[#3f3f3f]">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-[10px] leading-[14px] text-[#a7a7a7]">{displayEmail}</p>
          </div>
        </button>
      </div>
    </div>
  )
}
