import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'

const portals = [
  { to: '/admin/login',    label: 'School Admin', description: 'Manage students & dining hall',            color: 'bg-blue-50 border-blue-200 hover:border-blue-400',       initial: 'A' },
  { to: '/gov/login',      label: 'Government',   description: 'Regional, financial & audit oversight',    color: 'bg-violet-50 border-violet-200 hover:border-violet-400', initial: 'G' },
  { to: '/supplier/login', label: 'Supplier',      description: 'Track tokens & deliveries',                color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', initial: 'S' },
  { to: '/bank/login',     label: 'Bank',          description: 'Validate tokens & release cash',           color: 'bg-amber-50 border-amber-200 hover:border-amber-400',    initial: 'B' },
]

export default function PortalSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-4">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-3">
            <Icon name="shield" size={24} className="text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900">IARTS</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Institutional Accountability & Resource Tracking</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Select Your Portal</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {portals.map(({ to, label, description, color, initial }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
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
              <Icon name="device-desktop" size={15} className="text-gray-700" />
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
