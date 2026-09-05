import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { Icon } from '../ui/Icon'
import { CredentialsHelp } from './CredentialsHelp'
import { useAuthStore } from '../../store/authStore'
import { DEMO_ACCOUNTS } from '../../lib/demoAccounts'
import api from '../../lib/axios'
import type { ApiResponse } from '../../lib/axios'
import type { User, UserRole } from '../../types'

type Theme = 'blue' | 'violet' | 'emerald' | 'amber'

const THEME_CLASSES: Record<Theme, { iconBg: string; button: string; ring: string; chipActive: string }> = {
  blue:    { iconBg: 'bg-blue-600',    button: 'bg-blue-600 hover:bg-blue-700',       ring: 'focus:border-blue-400 focus:ring-blue-100',       chipActive: 'bg-blue-600 text-white' },
  violet:  { iconBg: 'bg-violet-600',  button: 'bg-violet-600 hover:bg-violet-700',   ring: 'focus:border-violet-400 focus:ring-violet-100',   chipActive: 'bg-violet-600 text-white' },
  emerald: { iconBg: 'bg-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus:border-emerald-400 focus:ring-emerald-100', chipActive: 'bg-emerald-600 text-white' },
  amber:   { iconBg: 'bg-amber-600',   button: 'bg-amber-600 hover:bg-amber-700',     ring: 'focus:border-amber-400 focus:ring-amber-100',     chipActive: 'bg-amber-600 text-white' },
}

export interface RoleOption {
  role: UserRole
  label: string
}

interface PortalLoginScreenProps {
  theme: Theme
  icon: string
  portalName: string
  tagline: string
  /** A single entry hides the role selector; multiple entries render a segmented switch (used by Government). */
  roles: RoleOption[]
}

export function PortalLoginScreen({ theme, icon, portalName, tagline, roles }: PortalLoginScreenProps) {
  const { login } = useAuthStore()
  const t = THEME_CLASSES[theme]

  const [activeRole, setActiveRole] = useState<UserRole>(roles[0].role)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const credentials = roles.map(r => DEMO_ACCOUNTS[r.role])

  const handleFillCredential = (cred: (typeof credentials)[number]) => {
    setActiveRole(cred.role)
    setEmail(cred.email)
    setPassword(cred.password)
    setError('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password })
      login(res.data.data.user, res.data.data.token)
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        // Real response from the server — wrong email/password. Do not sign in.
        setError(err.response.data?.message || 'Invalid email or password.')
      } else {
        // No response at all — backend unreachable. Do not sign in either; only a
        // verified credential check may authenticate someone.
        setError('Backend unreachable. Try again once the server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-4">

        <div className="text-center mb-2">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors mb-4">
            <Icon name="arrow-left" size={12} /> All portals
          </Link>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${t.iconBg} mb-3`}>
            <Icon name={icon} size={24} className="text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">{portalName}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{tagline}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {roles.length > 1 && (
            <div className="grid mb-5 gap-1.5" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }}>
              {roles.map(r => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => { setActiveRole(r.role); setError('') }}
                  className={`px-2 py-2 rounded-lg text-[11px] font-medium border transition-colors ${
                    activeRole === r.role ? `${t.chipActive} border-transparent` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Sign in to your account</h2>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-600">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.gh"
                className={`w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${t.ring}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${t.ring}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <Icon name="eye-off" size={15} /> : <Icon name="eye" size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors mt-1 ${t.button}`}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              <Icon name="arrow-right" size={15} />
            </button>
          </form>

          {error && <p className="text-center text-[12px] text-red-500 mt-3">{error}</p>}
        </div>

        <p className="text-center text-[11px] text-gray-400">
          IARTS v1.0 · Final Year Project
        </p>
      </div>

      <CredentialsHelp credentials={credentials} onUse={handleFillCredential} accentClass={t.button} />
    </div>
  )
}
