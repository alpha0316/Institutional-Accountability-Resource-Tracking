// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'school_admin' | 'government' | 'supplier' | 'bank'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  schoolId?: string
  supplierId?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Student & Card ──────────────────────────────────────────────────────────
export interface Student {
  id: string
  uniqueCode: string
  fullName: string
  enrollmentStatus: 'active' | 'inactive'
  schoolId: string
  year: number
  department: string
  createdAt: string
}

export interface Card {
  id: string
  studentId: string
  cardNumber: string
  qrCode: string
  isActive: boolean
  issuedAt: string
}

// ─── Meal Validation ─────────────────────────────────────────────────────────
export interface MealValidation {
  id: string
  cardNumber: string
  studentName: string
  diningHallId: string
  scanTime: string
  served: boolean
  isDuplicate: boolean
  isFlagged: boolean
}

export type ScanResult =
  | { status: 'served';    studentName: string }
  | { status: 'unknown_card' }
  | { status: 'duplicate_scan' }
  | { status: 'inactive_student' }

// ─── Token ───────────────────────────────────────────────────────────────────
export interface GovernmentToken {
  id: string
  tokenCode: string
  supplierId: string
  supplierName: string
  institutionName: string
  value: number
  issuedDate: string
  expiryDate: string
  status: 'active' | 'redeemed' | 'expired' | 'rejected' | 'pending'
}

// ─── Supply ──────────────────────────────────────────────────────────────────
export interface SupplyOrder {
  id: string
  itemType: string
  quantity: number
  unit: string
  orderDate: string
  supplierId: string
  schoolId: string
  tokenRef: string
  status: 'pending' | 'delivered' | 'in_transit'
}

export interface ReorderLevel {
  id: string
  itemType: string
  unit: string
  currentStock: number
  minStock: number
  status: 'ok' | 'low' | 'critical'
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface DailyReport {
  id: string
  schoolId: string
  schoolName: string
  reportDate: string
  mealsServed: number
  enrolledCount: number
  fraudFlags: number
  status: 'draft' | 'submitted' | 'approved' | 'flagged'
}

export interface ReimbursementClaim {
  id: string
  reportId: string
  institutionName: string
  amountClaimed: number
  amountApproved: number | null
  status: 'pending' | 'approved' | 'rejected' | 'partial'
  submittedAt: string
}

// ─── Bank ─────────────────────────────────────────────────────────────────────
export interface BankTransaction {
  id: string
  tokenId: string
  tokenCode: string
  supplierName: string
  amount: number
  processedAt: string
  status: 'released' | 'rejected' | 'pending'
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}
