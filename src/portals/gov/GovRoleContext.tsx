import { createContext, useContext, useState, type ReactNode } from 'react'

export type GovRole = 'regional_officer' | 'financial_officer' | 'audit_officer'

export interface GovRoleDefinition {
  value: GovRole
  label: string
  dept: string
  focus: string
  stage: string
  canApprove: boolean
  canReject: boolean
  canFreeze: boolean
  permissions: string[]
  restrictions: string[]
  navigation: { label: string; to: string; icon: string }[]
}

export const GOV_ROLES: GovRoleDefinition[] = [
  {
    value: 'regional_officer',
    label: 'Regional Officer',
    dept: 'Ashanti Regional Education',
    focus: 'School Operations',
    stage: 'regional',
    canApprove: true,
    canReject: true,
    canFreeze: false,
    permissions: ['View school claims', 'View attendance analytics', 'View dining hall reports', 'View supply summaries', 'Request clarification', 'Return claim to school', 'Approve regional review'],
    restrictions: ['Cannot modify financial values', 'Cannot generate tokens', 'Cannot release payments', 'Cannot adjust claim amounts', 'Cannot override audit findings'],
    navigation: [
      { label: 'Regional Overview',    to: '/gov/dashboard/regional',    icon: 'building-community' },
      { label: 'Claims Queue',         to: '/gov/claims',                icon: 'clipboard-list' },
      { label: 'Attendance Analytics', to: '/gov/attendance',            icon: 'calendar-check' },
      { label: 'School Profiles',      to: '/gov/schools/sac',           icon: 'school' },
    ],
  },
  {
    value: 'financial_officer',
    label: 'Financial Officer',
    dept: 'Financial Assessment',
    focus: 'Money & Calculations',
    stage: 'financial',
    canApprove: true,
    canReject: true,
    canFreeze: false,
    permissions: ['View all financial calculations', 'Review reimbursement values', 'Review deductions', 'Apply approved adjustments', 'Approve financial assessment', 'Return for recalculation'],
    restrictions: ['Cannot modify attendance records', 'Cannot modify student data', 'Cannot generate payment tokens', 'Cannot close investigations'],
    navigation: [
      { label: 'Financial Dashboard',  to: '/gov/dashboard/financial',   icon: 'coin' },
      { label: 'Claims Queue',         to: '/gov/claims',                icon: 'clipboard-list' },
      { label: 'Rate Verification',    to: '/gov/tokens/issue',          icon: 'calculator' },
      { label: 'Token Ledger',         to: '/gov/tokens/ledger',         icon: 'book' },
    ],
  },
  {
    value: 'audit_officer',
    label: 'Audit & Risk Officer',
    dept: 'Audit & Compliance',
    focus: 'Fraud & Compliance',
    stage: 'audit',
    canApprove: true,
    canReject: true,
    canFreeze: true,
    permissions: ['View all claims', 'View risk analytics', 'Open investigations', 'Freeze claims', 'Escalate cases', 'Request evidence', 'Approve audit review', 'Reject claims'],
    restrictions: ['Cannot generate payment tokens', 'Cannot release payments', 'Cannot modify financial calculations'],
    navigation: [
      { label: 'Risk Center',          to: '/gov/dashboard/audit',       icon: 'shield-exclamation' },
      { label: 'Claims Queue',         to: '/gov/claims',                icon: 'clipboard-list' },
      { label: 'Fraud Reports',        to: '/gov/fraud',                 icon: 'shield-check' },
      { label: 'Investigations',       to: '/gov/reimbursements',        icon: 'zoom-question' },
    ],
  },
]

export const stageRoleMap: Record<string, GovRole> = {
  regional: 'regional_officer',
  financial: 'financial_officer',
  audit: 'audit_officer',
}

interface GovRoleContextType {
  role: GovRole
  setRole: (r: GovRole) => void
  roleDef: GovRoleDefinition
}

const GovRoleContext = createContext<GovRoleContextType>({
  role: 'regional_officer',
  setRole: () => {},
  roleDef: GOV_ROLES[0],
})

export function GovRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<GovRole>('regional_officer')
  const roleDef = GOV_ROLES.find(r => r.value === role) ?? GOV_ROLES[0]
  return <GovRoleContext.Provider value={{ role, setRole, roleDef }}>{children}</GovRoleContext.Provider>
}

export function useGovRole() {
  return useContext(GovRoleContext)
}
