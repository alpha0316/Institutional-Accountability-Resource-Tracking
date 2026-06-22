import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: { id: '1', name: 'Essandoh Prince', email: 'Princeessandoh@gmail.com', role: 'school_admin', schoolId: 'SCH-001' },
      token: 'dev-token',
      isAuthenticated: true,
      login: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'iarts-auth' }
  )
)

// Role-to-portal route map
export const roleHomeRoute: Record<UserRole, string> = {
  school_admin: '/admin',
  government:   '/gov',
  supplier:     '/supplier',
  bank:         '/bank',
}
