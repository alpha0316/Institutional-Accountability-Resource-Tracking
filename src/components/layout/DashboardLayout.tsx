import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  )
}
