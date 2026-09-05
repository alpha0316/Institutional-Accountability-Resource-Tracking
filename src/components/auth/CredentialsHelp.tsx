import { useState } from 'react'
import { Icon } from '../ui/Icon'
import type { DemoAccount } from '../../lib/demoAccounts'

interface CredentialsHelpProps {
  credentials: DemoAccount[]
  onUse: (cred: DemoAccount) => void
  accentClass: string
}

/** Floating bottom-right helper exposing demo sign-in credentials for presentation/demo purposes. */
export function CredentialsHelp({ credentials, onUse, accentClass }: CredentialsHelpProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 w-72 bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] font-semibold text-gray-900">Demo credentials</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <Icon name="x" size={14} />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mb-3 leading-snug">
            For presentation purposes only. Tap an account to autofill the form.
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {credentials.map(cred => (
              <button
                key={cred.role}
                type="button"
                onClick={() => { onUse(cred); setOpen(false) }}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <p className="text-[11.5px] font-medium text-gray-900">{cred.label}</p>
                <p className="text-[10.5px] text-gray-400 font-mono mt-0.5 truncate">{cred.email}</p>
                <p className="text-[10.5px] text-gray-400 font-mono">{cred.password}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center transition-colors ${accentClass}`}
        title="Demo credentials"
      >
        <Icon name={open ? 'x' : 'help-circle'} size={19} />
      </button>
    </div>
  )
}
