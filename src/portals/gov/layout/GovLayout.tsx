import { Outlet, NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'

const navGroups = [
  {
    section: 'Intelligence',
    items: [
      { label: 'Overview',           to: '/gov',                  icon: 'layout-dashboard', end: true },
      { label: 'Attendance Review',  to: '/gov/attendance',       icon: 'calendar-check' },
    ],
  },
  {
    section: 'Token Management',
    items: [
      { label: 'Issue Tokens',       to: '/gov/tokens/issue',     icon: 'coin' },
      { label: 'Token Ledger',       to: '/gov/tokens/ledger',    icon: 'book' },
      { label: 'Reimbursements',     to: '/gov/reimbursements',   icon: 'arrows-left-right' },
    ],
  },
  {
    section: 'Oversight',
    items: [
      { label: 'Fraud Reports',      to: '/gov/fraud',            icon: 'shield-check' },
    ],
  },
]

export default function GovLayout() {
  const { user, logout } = useAuthStore()
  const initial = user?.name ? user.name.trim()[0]?.toUpperCase() : 'A'

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-[230px] h-screen shrink-0 flex flex-col bg-[#111111]">

        {/* Brand */}
        <div className="flex items-start gap-[10px] px-[18px] py-[22px]">
          <div className="mt-[2px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] bg-[#3b82f6]">
            <Icon name="building" size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-[17px] text-white">Ministry of Education</p>
            <p className="text-[11px] leading-[15px] text-[#666]">Resource Oversight</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-[12px] pb-4 pt-[4px]">
          {navGroups.map(({ section, items }) => (
            <div key={section} className="mb-[22px] last:mb-0">
              <p className="mb-[6px] px-[8px] text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
                {section}
              </p>
              <ul className="space-y-[2px]">
                {items.map(({ label, to, icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        clsx(
                          'flex h-[32px] items-center gap-[9px] rounded-[8px] px-[9px] text-[13px] font-medium transition-colors',
                          isActive
                            ? 'bg-[#252525] text-white'
                            : 'text-[#666] hover:bg-[#1c1c1c] hover:text-[#aaa]'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            name={icon}
                            size={14}
                            className={isActive ? 'text-white' : 'text-[#555]'}
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

        {/* Footer */}
        <div className="px-[12px] pb-[20px]">
          <button className="mb-[14px] flex h-[32px] w-full items-center gap-[9px] rounded-[8px] px-[9px] text-[13px] font-medium text-[#666] transition-colors hover:bg-[#1c1c1c] hover:text-[#aaa]">
            <Icon name="settings" size={14} className="text-[#555]" />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-[10px] rounded-[8px] px-[6px] py-0 text-left"
          >
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#3b82f6]">
              <span className="text-[14px] font-semibold text-white">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold leading-[16px] text-[#ccc]">
                {user?.name || 'Dr. Ama Boateng'}
              </p>
              <p className="truncate text-[10px] leading-[14px] text-[#555]">Senior Policy Analyst</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  )
}
