import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, ArrowRight, Monitor } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import type { User } from '../../../types'

const portalDefs: {
  role: User['role']
  label: string
  description: string
  color: string
  initial: string
}[] = [
  {
    role:        'school_admin',
    label:       'School Admin',
    description: 'Manage students & dining hall',
    color:       'bg-blue-50 border-blue-200 hover:border-blue-400',
    initial:     'A',
  },
  {
    role:        'government',
    label:       'Government',
    description: 'Review reports & issue tokens',
    color:       'bg-violet-50 border-violet-200 hover:border-violet-400',
    initial:     'G',
  },
  {
    role:        'supplier',
    label:       'Supplier',
    description: 'Track tokens & deliveries',
    color:       'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    initial:     'S',
  },
  {
    role:        'bank',
    label:       'Bank',
    description: 'Validate tokens & release cash',
    color:       'bg-amber-50 border-amber-200 hover:border-amber-400',
    initial:     'B',
  },
]

const mockUsers: Record<User['role'], User> = {
  school_admin: { id: '1', name: 'Essandoh Prince', email: 'Princeessandoh@gmail.com', role: 'school_admin', schoolId: 'SCH-001' },
  government:   { id: '2', name: 'Gov Official',    email: 'official@gov.gh',              role: 'government' },
  supplier:     { id: '3', name: 'Supply Co.',       email: 'ops@supplyco.gh',              role: 'supplier',  supplierId: 'SUP-001' },
  bank:         { id: '4', name: 'Bank Officer',     email: 'officer@bank.gh',              role: 'bank' },
}

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const enterAs = (role: User['role']) => {
    login(mockUsers[role], 'dev-token')
    // PublicRoute redirects automatically — no navigate() needed
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    // placeholder — wire to POST /api/v1/auth/login later
    login(mockUsers['school_admin'], 'dev-token')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-4">

        {/* brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-3">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">IARTS</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Institutional Accountability & Resource Tracking</p>
        </div>

        {/* sign-in card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Sign in to your account</h2>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-600">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@institution.gh"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
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
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors mt-1"
            >
              Sign In
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* quick portal access */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick Portal Access</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {portalDefs.map(({ role, label, description, color, initial }) => (
              <button
                key={role}
                onClick={() => enterAs(role)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${color}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-bold text-gray-700">{initial}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-900 truncate">{label}</p>
                  <p className="text-[10px] text-gray-400 truncate leading-tight">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* scanner — full width */}
          <button
            onClick={() => navigate('/scanner')}
            className="mt-2.5 w-full flex items-center gap-3 p-3 rounded-xl border bg-orange-50 border-orange-200 hover:border-orange-400 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
              <Monitor size={15} className="text-gray-700" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-gray-900">Scanner Kiosk</p>
              <p className="text-[10px] text-gray-400 leading-tight">Dining hall QR scanner terminal</p>
            </div>
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400">
          IARTS v1.0 · Final Year Project
        </p>
      </div>
    </div>
  )
}
