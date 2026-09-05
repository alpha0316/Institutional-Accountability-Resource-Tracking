import type { User, UserRole } from '../types'

export interface DemoAccount {
  role: UserRole
  label: string
  email: string
  password: string
  user: User
}

// Presentation-only credentials — dev-login authenticates by role, the
// password here is cosmetic and shown via the login screen's help panel.
const DEMO_PASSWORD = 'Demo@1234'

export const DEMO_ACCOUNTS: Record<UserRole, DemoAccount> = {
  school_admin: {
    role: 'school_admin', label: 'School Admin', email: 'admin@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '1', name: 'Essandoh Prince', email: 'admin@shsdining.gh', role: 'school_admin', schoolId: 'SCH-001' },
  },
  regional_officer: {
    role: 'regional_officer', label: 'Regional Officer', email: 'regional@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '2', name: 'Kwabena Asante', email: 'regional@shsdining.gh', role: 'regional_officer' },
  },
  financial_officer: {
    role: 'financial_officer', label: 'Financial Officer', email: 'financial@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '5', name: 'Dr. Ama Boateng', email: 'financial@shsdining.gh', role: 'financial_officer' },
  },
  audit_officer: {
    role: 'audit_officer', label: 'Audit & Risk Officer', email: 'audit@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '6', name: 'Yaw Owusu', email: 'audit@shsdining.gh', role: 'audit_officer' },
  },
  supplier: {
    role: 'supplier', label: 'Supplier', email: 'supplier@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '3', name: 'Golden Harvest', email: 'supplier@shsdining.gh', role: 'supplier', supplierId: 'SUP-001' },
  },
  bank: {
    role: 'bank', label: 'Bank', email: 'bank@shsdining.gh', password: DEMO_PASSWORD,
    user: { id: '4', name: 'Ghana Comm Bank', email: 'bank@shsdining.gh', role: 'bank' },
  },
}
