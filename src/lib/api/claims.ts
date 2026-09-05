import api, { type ApiResponse } from '../axios'

/** Mirrors backend ClaimStage.java's lowercase-snake wire format exactly. */
export type ClaimStage =
  | 'received' | 'intake' | 'regional' | 'financial' | 'audit' | 'budget'
  | 'token_generated' | 'supplier_redemption' | 'bank_settlement' | 'closed'

/** List shape — mirrors ClaimDto.java. */
export interface ApiClaim {
  id: string
  claimCode: string
  schoolId: string
  schoolName: string
  semesterLabel: string
  verifiedStudents: number
  claimValue: number
  riskScore: number
  fraudFlags: number
  stage: ClaimStage
  frozen: boolean
  rejected: boolean
  submittedAt: string
  updatedAt: string
}

export interface ApiAttendanceMonth {
  month: string
  meals: number
  eligible: number
}

/** Cost is intentionally absent — SupplyOrder carries no unit-price data on the backend. */
export interface ApiSupplyItem {
  itemType: string
  totalQuantity: number
}

export interface ApiClaimDeduction {
  reason: string
  amount: number
}

export interface ApiClaimDocument {
  name: string
  type: string
}

export interface ApiClaimApprovalLog {
  createdAt: string
  action: string
  actor: string
  notes: string | null
}

/** Detail shape — mirrors ClaimDetailDto.java. */
export interface ApiClaimDetail extends ApiClaim {
  governmentNotes: string | null
  attendancePct: number
  attendanceHistory: ApiAttendanceMonth[]
  supplyBreakdown: ApiSupplyItem[]
  policyDeductions: ApiClaimDeduction[]
  supportingDocs: ApiClaimDocument[]
  approvalHistory: ApiClaimApprovalLog[]
}

export interface ClaimPreview {
  verifiedStudents: number
  fraudFlags: number
  attendancePct: number
}

export async function fetchClaimPreview(schoolId: string, semesterStart: string, semesterEnd: string): Promise<ClaimPreview> {
  const res = await api.get<ApiResponse<ClaimPreview>>('/claims/preview', { params: { schoolId, semesterStart, semesterEnd } })
  return res.data.data
}

export interface CreateClaimInput {
  claimCode: string
  schoolId: string
  schoolName: string
  semesterLabel: string
  semesterStart: string
  semesterEnd: string
  verifiedStudents: number
  claimValue: number
  riskScore: number
  fraudFlags: number
  governmentNotes?: string
}

export async function createClaim(input: CreateClaimInput): Promise<ApiClaimDetail> {
  const res = await api.post<ApiResponse<ApiClaimDetail>>('/claims', input)
  return res.data.data
}

export async function fetchClaims(stage?: ClaimStage): Promise<ApiClaim[]> {
  const res = await api.get<ApiResponse<ApiClaim[]>>('/claims', { params: stage ? { stage } : undefined })
  return res.data.data
}

export async function fetchClaim(id: string): Promise<ApiClaimDetail> {
  const res = await api.get<ApiResponse<ApiClaimDetail>>(`/claims/${id}`)
  return res.data.data
}

async function postAction(id: string, action: string): Promise<ApiClaimDetail> {
  const res = await api.post<ApiResponse<ApiClaimDetail>>(`/claims/${id}/${action}`)
  return res.data.data
}

export const approveClaim = (id: string) => postAction(id, 'approve')
export const returnClaim = (id: string) => postAction(id, 'return')
export const rejectClaim = (id: string) => postAction(id, 'reject')
export const escalateClaim = (id: string) => postAction(id, 'escalate')
export const freezeClaim = (id: string) => postAction(id, 'freeze')
