import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { GovRoleProvider, useGovRole } from '../GovRoleContext'

/** /gov's index route — sends each officer straight to their own dashboard, not a shared overview. */
export function GovIndexRedirect() {
  const { roleDef } = useGovRole()
  return <Navigate to={roleDef.navigation[0].to} replace />
}

function GovLayout() {
  const { user, logout } = useAuthStore()
  const { roleDef } = useGovRole()
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

        {/* Nav — scoped to the logged-in officer's own role */}
        <nav className="flex-1 overflow-y-auto px-[12px] pb-4 pt-[4px]">
          <div className="mb-[22px]">
            <p className="mb-[6px] px-[8px] text-[11px] font-semibold uppercase tracking-wider text-white/80">
              {roleDef.label}
            </p>
            <ul className="space-y-[2px]">
              {roleDef.navigation.map(({ label, to, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/gov'}
                    className={({ isActive }) =>
                      clsx(
                        'flex h-[32px] items-center gap-[9px] rounded-[8px] px-[9px] text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-[#252525] text-white'
                          : 'text-[#999] hover:bg-[#1c1c1c] hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          name={icon}
                          size={14}
                          className={isActive ? 'text-white' : 'text-[#888]'}
                        />
                        {label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-[12px] pb-[20px]">
          <button className="mb-[14px] flex h-[32px] w-full items-center gap-[9px] rounded-[8px] px-[9px] text-[13px] font-medium text-white/80 transition-colors hover:bg-[#1c1c1c] hover:text-white">
            <Icon name="settings" size={14} className="text-white/80" />
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
              <p className="truncate text-[10px] leading-[14px] text-white/60">{roleDef.dept}</p>
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

export default function GovLayoutWrapper() {
  return (
    <GovRoleProvider>
      <GovLayout />
    </GovRoleProvider>
  )
}
