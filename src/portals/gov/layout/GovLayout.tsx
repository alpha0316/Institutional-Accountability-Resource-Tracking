import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { GovRoleProvider, useGovRole, GOV_ROLES } from '../GovRoleContext'

const commonNav = [
  { label: 'Overview',      to: '/gov',            icon: 'layout-dashboard', end: true },
  { label: 'Claims Queue',  to: '/gov/claims',      icon: 'clipboard-list' },
]

function GovLayout() {
  const { user, logout } = useAuthStore()
  const { roleDef } = useGovRole()
  const initial = user?.name ? user.name.trim()[0]?.toUpperCase() : 'A'

  const navItems = [...commonNav, ...roleDef.navigation.filter(n => !commonNav.some(c => c.to === n.to))]

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
          <div className="mb-[22px]">
            <p className="mb-[6px] px-[8px] text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
              {roleDef.focus}
            </p>
            <ul className="space-y-[2px]">
              {navItems.map((item) => {
                const end = 'end' in item ? (item as any).end : false
                return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
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
                          name={item.icon}
                          size={14}
                          className={isActive ? 'text-white' : 'text-[#555]'}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Role Switcher */}
        <div className="px-[12px] pb-[16px]">
          <p className="mb-[6px] px-[8px] text-[11px] font-semibold uppercase tracking-wider text-[#4a4a4a]">
            Active Role
          </p>
          <RoleSelector />
        </div>

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

function RoleSelector() {
  const { role, setRole } = useGovRole()
  const [open, setOpen] = useState(false)

  const current = GOV_ROLES.find(r => r.value === role)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-[8px] rounded-[8px] bg-[#1c1c1c] px-[8px] py-[8px] text-left transition-colors hover:bg-[#252525]"
      >
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] bg-[#3b82f6]">
          <span className="text-[11px] font-semibold text-white">{current?.label[0] ?? 'C'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium leading-[15px] text-[#ccc]">{current?.label ?? 'Claims Officer'}</p>
          <p className="truncate text-[10px] leading-[13px] text-[#555]">{current?.dept ?? ''}</p>
        </div>
        <Icon name="chevron-down" size={12} className="shrink-0 text-[#555]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-40 mb-[6px] w-[220px] overflow-hidden rounded-[10px] border border-[#333] bg-[#1c1c1c] py-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            {GOV_ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setOpen(false) }}
                className={clsx(
                  'flex w-full items-start gap-[8px] px-[12px] py-[9px] text-left transition-colors',
                  role === r.value ? 'bg-[#3b82f6]/15' : 'hover:bg-[#252525]'
                )}
              >
                <div className={clsx(
                  'mt-[2px] flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[5px] text-[10px] font-semibold',
                  role === r.value ? 'bg-[#3b82f6] text-white' : 'bg-[#333] text-[#888]'
                )}>
                  {r.label[0]}
                </div>
                <div className="min-w-0">
                  <p className={clsx('text-[12px] font-medium leading-[15px]', role === r.value ? 'text-white' : 'text-[#aaa]')}>
                    {r.label}
                  </p>
                  <p className="text-[10px] leading-[13px] text-[#555]">{r.dept}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function GovLayoutWrapper() {
  return (
    <GovRoleProvider>
      <GovLayout />
    </GovRoleProvider>
  )
}
