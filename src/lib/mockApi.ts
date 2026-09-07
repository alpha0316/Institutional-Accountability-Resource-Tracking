import { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type {
  User, GovernmentToken, SupplyOrder, SupplyConsumption, BankTransaction, MealValidation, ScanResult,
} from '../types'
import type {
  ApiClaimDetail, ClaimStage, ApiAttendanceMonth, ApiSupplyItem, ApiClaimApprovalLog,
} from './api/claims'
import { DEMO_ACCOUNTS } from './demoAccounts'
import { MOCK_CARDS } from './mockData'

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001'
const ADMIN_SCHOOL_ID = 'SCH-001'

type Envelope = { data: unknown; message: string | null; status: number }

// ── In-memory stores (seeded once per page load) ──────────────────────────────

let tokens: GovernmentToken[] = [
  { id: '1', tokenCode: 'GOV-SAC-SEM1-001', supplierId: 'SUP-001', supplierName: 'Golden Harvest Foods',  institutionName: 'St. Augustine SHS', value: 420000, issuedDate: '2026-01-10', expiryDate: '2026-07-10', status: 'redeemed' },
  { id: '2', tokenCode: 'GOV-SAC-SEM1-005', supplierId: 'SUP-001', supplierName: 'Golden Harvest Foods',  institutionName: 'St. Augustine SHS', value: 620000, issuedDate: '2026-03-01', expiryDate: '2026-09-01', status: 'active' },
  { id: '3', tokenCode: 'GOV-SAC-SEM1-002', supplierId: 'SUP-002', supplierName: 'SunGold Oils',          institutionName: 'St. Augustine SHS', value: 180000, issuedDate: '2026-01-15', expiryDate: '2026-07-15', status: 'active' },
  { id: '4', tokenCode: 'GOV-SAC-SEM1-003', supplierId: 'SUP-003', supplierName: 'Ashanti Agro Supplies', institutionName: 'St. Augustine SHS', value: 210000, issuedDate: '2026-01-20', expiryDate: '2026-07-20', status: 'active' },
  { id: '5', tokenCode: 'GOV-SAC-SEM1-004', supplierId: 'SUP-004', supplierName: 'National School Foods', institutionName: 'St. Augustine SHS', value: 95000,  issuedDate: '2026-02-05', expiryDate: '2026-08-05', status: 'active' },
  { id: '6', tokenCode: 'GOV-OWS-SEM1-001', supplierId: 'SUP-005', supplierName: 'Ghana Foods Co.',       institutionName: 'Opoku Ware SHS',      value: 396000, issuedDate: '2026-01-08', expiryDate: '2026-07-08', status: 'redeemed' },
  { id: '7', tokenCode: 'GOV-OWS-SEM1-002', supplierId: 'SUP-006', supplierName: 'Northern Foods Ltd',    institutionName: 'Opoku Ware SHS',      value: 215000, issuedDate: '2026-02-12', expiryDate: '2026-08-12', status: 'active' },
  { id: '8', tokenCode: 'GOV-MFS-SEM1-001', supplierId: 'SUP-007', supplierName: 'Fresh Mart Ltd',        institutionName: 'Mfantsipim SHS',      value: 287500, issuedDate: '2026-01-18', expiryDate: '2026-07-18', status: 'pending' },
]

const suppliers = [
  { id: 'SUP-001', name: 'Golden Harvest Foods',  contactEmail: 'golden@harvest.gh',  azaConfigured: true,  createdAt: '2026-01-05T00:00:00Z' },
  { id: 'SUP-002', name: 'SunGold Oils',          contactEmail: 'sunoil@supply.gh',   azaConfigured: true,  createdAt: '2026-01-06T00:00:00Z' },
  { id: 'SUP-003', name: 'Ashanti Agro Supplies', contactEmail: 'ashanti@agro.gh',     azaConfigured: false, createdAt: '2026-01-07T00:00:00Z' },
  { id: 'SUP-004', name: 'National School Foods', contactEmail: 'national@foods.gh',   azaConfigured: true,  createdAt: '2026-01-08T00:00:00Z' },
  { id: 'SUP-005', name: 'Ghana Foods Co.',       contactEmail: 'ghfoods@co.gh',       azaConfigured: true,  createdAt: '2026-01-09T00:00:00Z' },
  { id: 'SUP-006', name: 'Northern Foods Ltd',    contactEmail: 'northern@foods.gh',   azaConfigured: false, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'SUP-007', name: 'Fresh Mart Ltd',        contactEmail: 'fresh@mart.gh',       azaConfigured: true,  createdAt: '2026-01-11T00:00:00Z' },
]

let supplyOrders: SupplyOrder[] = [
  { id: 'SO-1', itemType: 'Rice',         quantity: 200, unit: 'Bags',   orderDate: '2026-03-12', supplierId: 'SUP-001', schoolId: ADMIN_SCHOOL_ID, status: 'delivered', receivedQuantity: 200 },
  { id: 'SO-2', itemType: 'Cooking Oil',  quantity: 60,  unit: 'Litres', orderDate: '2026-03-10', supplierId: 'SUP-002', schoolId: ADMIN_SCHOOL_ID, status: 'delivered', receivedQuantity: 60 },
  { id: 'SO-3', itemType: 'Beans',        quantity: 80,  unit: 'Bags',   orderDate: '2026-03-14', supplierId: 'SUP-003', schoolId: ADMIN_SCHOOL_ID, status: 'in_transit' },
  { id: 'SO-4', itemType: 'Fish (Frozen)',quantity: 40,  unit: 'Cartons',orderDate: '2026-03-11', supplierId: 'SUP-001', schoolId: SCHOOL_ID, status: 'delivered', receivedQuantity: 40 },
  { id: 'SO-5', itemType: 'Maize',        quantity: 120, unit: 'Bags',   orderDate: '2026-03-08', supplierId: 'SUP-004', schoolId: SCHOOL_ID, status: 'pending' },
]

let consumptions: SupplyConsumption[] = [
  { id: 'SC-1', schoolId: ADMIN_SCHOOL_ID, itemType: 'Rice',        quantity: 10, unit: 'Bags',  mealSession: 'Breakfast', studentsServed: 1120, consumedAt: '2026-03-15T06:30:00Z' },
  { id: 'SC-2', schoolId: ADMIN_SCHOOL_ID, itemType: 'Rice',        quantity: 12, unit: 'Bags',  mealSession: 'Lunch',     studentsServed: 1187, consumedAt: '2026-03-15T10:45:00Z' },
  { id: 'SC-3', schoolId: ADMIN_SCHOOL_ID, itemType: 'Beans',       quantity: 5,  unit: 'Bags',  mealSession: 'Lunch',     studentsServed: 1187, consumedAt: '2026-03-15T10:45:00Z' },
]

interface MockSession {
  id: string
  govTokenId: string
  supplierId: string
  bankTransactionId?: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reference: string
  createdAt: string
  completedAt?: string
}

let paymentSessions: MockSession[] = [
  { id: 'PS-1', govTokenId: '3', supplierId: 'SUP-002', amount: 180000, status: 'pending',   reference: 'PAY-GOV-SAC-SEM1-002', createdAt: '2026-03-14T10:00:00Z' },
  { id: 'PS-2', govTokenId: '4', supplierId: 'SUP-003', amount: 210000, status: 'pending',   reference: 'PAY-GOV-SAC-SEM1-003', createdAt: '2026-03-13T09:30:00Z' },
  { id: 'PS-3', govTokenId: '5', supplierId: 'SUP-004', amount: 95000,  status: 'failed',    reference: 'PAY-GOV-SAC-SEM1-004', createdAt: '2026-03-10T11:00:00Z', bankTransactionId: 'BTX-3', completedAt: '2026-03-11T08:00:00Z' },
  { id: 'PS-4', govTokenId: '1', supplierId: 'SUP-001', amount: 420000, status: 'completed', reference: 'PAY-GOV-SAC-SEM1-001', createdAt: '2026-01-24T09:00:00Z', bankTransactionId: 'BTX-1', completedAt: '2026-01-25T10:00:00Z' },
]

let bankTransactions: BankTransaction[] = [
  { id: 'BTX-1', tokenId: '1', tokenCode: 'GOV-SAC-SEM1-001', supplierName: 'Golden Harvest Foods', amount: 420000, processedAt: '2026-01-25T10:00:00Z', status: 'released' },
  { id: 'BTX-2', tokenId: '6', tokenCode: 'GOV-OWS-SEM1-001', supplierName: 'Ghana Foods Co.',      amount: 396000, processedAt: '2026-01-12T10:00:00Z', status: 'released' },
  { id: 'BTX-3', tokenId: '5', tokenCode: 'GOV-SAC-SEM1-004', supplierName: 'National School Foods',amount: 95000,  processedAt: '2026-03-11T08:00:00Z', status: 'rejected', reason: 'Supplier documentation expired' },
]

interface MockNotification {
  id: string
  type: string
  title: string
  message: string
  relatedId?: string
  read: boolean
  createdAt: string
}

let notifications: MockNotification[] = [
  { id: 'N-1', type: 'claim_submitted', title: 'Claim submitted', message: 'St. Augustine SHS submitted a semester claim.', read: false, createdAt: '2026-03-15T08:00:00Z' },
  { id: 'N-2', type: 'token_issued',    title: 'New token issued', message: 'Government issued GOV-SAC-SEM1-005 to Golden Harvest Foods.', read: false, createdAt: '2026-03-01T09:00:00Z' },
  { id: 'N-3', type: 'payment_submitted', title: 'Payout submitted', message: 'SunGold Oils submitted a token to the bank.', read: true, createdAt: '2026-03-14T10:00:00Z' },
]

const mealValidations: MealValidation[] = MOCK_CARDS.slice(0, 6).map((c, i) => ({
  id: `MV-${i}`,
  cardNumber: c.cardUid,
  studentName: c.studentName,
  diningHallId: 'hall-a',
  scanTime: new Date(Date.now() - i * 7 * 60_000).toISOString(),
  served: true,
  isDuplicate: false,
  isFlagged: i === 4,
}))

const scannedThisSession = new Set<string>()

// ── Claim seed ────────────────────────────────────────────────────────────────

function makeClaim(over: Partial<ApiClaimDetail>): ApiClaimDetail {
  const months: ApiAttendanceMonth[] = [
    { month: 'Jan 2026', meals: 48200, eligible: 54100 },
    { month: 'Feb 2026', meals: 46900, eligible: 52900 },
    { month: 'Mar 2026', meals: 49720, eligible: 56000 },
  ]
  const supplyBreakdown: ApiSupplyItem[] = [
    { itemType: 'Rice', totalQuantity: 340 },
    { itemType: 'Cooking Oil', totalQuantity: 90 },
    { itemType: 'Beans', totalQuantity: 120 },
  ]
  const history: ApiClaimApprovalLog[] = [
    { createdAt: over.submittedAt ?? '2026-03-15T08:00:00Z', action: 'Claim Submitted', actor: 'School Admin', notes: null },
  ]
  return {
    id: 'CLM-1', claimCode: 'CLM-2026-S1-001', schoolId: SCHOOL_ID, schoolName: 'St. Augustine SHS',
    semesterLabel: 'Semester 1, 2026', verifiedStudents: 2845, claimValue: 113710, riskScore: 0,
    fraudFlags: 0, stage: 'regional', frozen: false, rejected: false,
    submittedAt: '2026-03-15T08:00:00Z', updatedAt: '2026-03-15T08:00:00Z',
    governmentNotes: null, attendancePct: 89, attendanceHistory: months,
    supplyBreakdown, policyDeductions: [], supportingDocs: [], approvalHistory: history,
    ...over,
  }
}

const claims: ApiClaimDetail[] = [
  makeClaim({ id: 'CLM-1', claimCode: 'CLM-2026-S1-001', schoolName: 'St. Augustine SHS', stage: 'regional', claimValue: 113710, riskScore: 62, fraudFlags: 3 }),
  makeClaim({ id: 'CLM-2', claimCode: 'CLM-2026-S1-012', schoolName: 'Mfantsipim SHS', stage: 'regional', claimValue: 287500, riskScore: 0, fraudFlags: 0, submittedAt: '2026-03-14T09:00:00Z' }),
  makeClaim({ id: 'CLM-3', claimCode: 'CLM-2026-S1-011', schoolName: 'Opoku Ware SHS', stage: 'financial', claimValue: 396000, riskScore: 8, fraudFlags: 1, submittedAt: '2026-03-12T09:00:00Z' }),
  makeClaim({ id: 'CLM-4', claimCode: 'CLM-2026-S1-013', schoolName: 'Wesley Girls SHS', stage: 'audit', claimValue: 215000, riskScore: 52, fraudFlags: 2, submittedAt: '2026-03-11T09:00:00Z' }),
  makeClaim({ id: 'CLM-5', claimCode: 'CLM-2026-S1-014', schoolName: 'Achimota SHS', stage: 'budget', claimValue: 178000, riskScore: 0, fraudFlags: 0, submittedAt: '2026-03-08T09:00:00Z' }),
  makeClaim({ id: 'CLM-6', claimCode: 'CLM-2025-S2-005', schoolName: 'St. Augustine SHS', semesterLabel: 'Semester 2, 2025', stage: 'token_generated', claimValue: 1765000, riskScore: 0, fraudFlags: 0, submittedAt: '2025-12-15T09:00:00Z' }),
  makeClaim({ id: 'CLM-7', claimCode: 'CLM-2025-S2-008', schoolName: 'Mfantsipim SHS', semesterLabel: 'Semester 2, 2025', stage: 'closed', rejected: true, claimValue: 1450000, riskScore: 40, fraudFlags: 4, submittedAt: '2025-12-20T09:00:00Z' }),
]

const NEXT_STAGE: Partial<Record<ClaimStage, ClaimStage>> = {
  regional: 'financial', financial: 'audit', audit: 'budget',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseBody(data: unknown): Record<string, unknown> {
  if (data == null) return {}
  if (typeof data === 'string') {
    try { return JSON.parse(data) as Record<string, unknown> } catch { return {} }
  }
  return data as Record<string, unknown>
}

function ok(config: AxiosRequestConfig, data: unknown, status = 200): Promise<AxiosResponse> {
  const envelope: Envelope = { data, message: null, status }
  return Promise.resolve({
    data: envelope, status, statusText: 'OK', headers: {}, config: config as InternalAxiosRequestConfig, request: {},
  } as AxiosResponse)
}

function fail(config: AxiosRequestConfig, status: number, message: string): Promise<never> {
  const envelope: Envelope = { data: null, message, status }
  const response = {
    data: envelope, status, statusText: '', headers: {}, config: config as InternalAxiosRequestConfig,
  } as AxiosResponse
  return Promise.reject(new AxiosError(message, String(status), config as InternalAxiosRequestConfig, undefined, response))
}

function sessionToDto(s: MockSession) {
  const t = tokens.find(x => x.id === s.govTokenId)
  return {
    id: s.id, govTokenId: s.govTokenId, tokenCode: t?.tokenCode ?? '—',
    supplierId: s.supplierId, supplierName: t?.supplierName ?? '—', institutionName: t?.institutionName ?? '—',
    amount: s.amount, status: s.status, reference: s.reference,
    bankTransactionId: s.bankTransactionId ?? null, createdAt: s.createdAt, completedAt: s.completedAt ?? null,
  }
}

function nowIso() { return new Date().toISOString() }

// ── Router ────────────────────────────────────────────────────────────────────

export function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? 'get').toLowerCase()
  const url = (config.url ?? '').replace(/^\/api\/v1/, '').split('?')[0]
  const params = (config.params ?? {}) as Record<string, string | undefined>
  const body = parseBody(config.data)

  // Auth
  if (method === 'post' && url === '/auth/login') {
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    const account = Object.values(DEMO_ACCOUNTS).find(a => a.email === email && a.password === password)
    if (!account) return fail(config, 401, 'Invalid email or password.')
    const user: User = account.user
    return ok(config, { user, token: `mock-${account.role}-${Date.now()}` })
  }

  // Notifications
  if (url.startsWith('/notifications')) {
    if (method === 'get') return ok(config, notifications.map(n => ({ ...n })))
    if (method === 'post' && url.endsWith('/read-all')) {
      notifications = notifications.map(n => ({ ...n, read: true }))
      return ok(config, null)
    }
    const readMatch = url.match(/^\/notifications\/([^/]+)\/read$/)
    if (method === 'post' && readMatch) {
      notifications = notifications.map(n => n.id === readMatch[1] ? { ...n, read: true } : n)
      return ok(config, null)
    }
    return fail(config, 404, 'Not found')
  }

  // Claims
  if (url.startsWith('/claims')) {
    if (method === 'get' && url === '/claims/preview') {
      return ok(config, { verifiedStudents: 2845, fraudFlags: 3, attendancePct: 89 })
    }
    if (method === 'get' && url === '/claims') {
      const stage = params.stage as ClaimStage | undefined
      const list = stage ? claims.filter(c => c.stage === stage) : claims
      return ok(config, list)
    }
    if (method === 'post' && url === '/claims') {
      const claim = makeClaim({
        id: `CLM-${Date.now()}`, claimCode: String(body.claimCode ?? 'CLM-NEW'),
        schoolId: String(body.schoolId ?? SCHOOL_ID), schoolName: String(body.schoolName ?? 'St. Augustine SHS'),
        semesterLabel: String(body.semesterLabel ?? 'Semester 1, 2026'),
        verifiedStudents: Number(body.verifiedStudents ?? 0), claimValue: Number(body.claimValue ?? 0),
        riskScore: Number(body.riskScore ?? 0), fraudFlags: Number(body.fraudFlags ?? 0),
        stage: 'regional', submittedAt: nowIso(), updatedAt: nowIso(),
      })
      claims.unshift(claim)
      notifications.unshift({ id: `N-${Date.now()}`, type: 'claim_submitted', title: 'Claim submitted', message: `${claim.schoolName} submitted ${claim.claimCode}.`, read: false, createdAt: nowIso() })
      return ok(config, claim, 201)
    }
    const actionMatch = url.match(/^\/claims\/([^/]+)\/(approve|return|reject|escalate|freeze)$/)
    if (method === 'post' && actionMatch) {
      const claim = claims.find(c => c.id === actionMatch[1])
      if (!claim) return fail(config, 404, 'Claim not found')
      const action = actionMatch[2]
      if (action === 'approve') {
        const next = NEXT_STAGE[claim.stage]
        if (!next) return fail(config, 400, 'Claim cannot be advanced')
        claim.stage = next
      } else if (action === 'return') {
        claim.stage = 'received'
      } else if (action === 'reject') {
        claim.stage = 'closed'; claim.rejected = true
      } else if (action === 'freeze') {
        claim.frozen = true
      }
      claim.updatedAt = nowIso()
      claim.approvalHistory.push({ createdAt: nowIso(), action, actor: 'Officer', notes: null })
      return ok(config, claim)
    }
    const detailMatch = url.match(/^\/claims\/([^/]+)$/)
    if (method === 'get' && detailMatch) {
      const claim = claims.find(c => c.id === detailMatch[1])
      return claim ? ok(config, claim) : fail(config, 404, 'Claim not found')
    }
    return fail(config, 404, 'Not found')
  }

  // Tokens
  if (url.startsWith('/tokens')) {
    if (method === 'get' && url === '/tokens') {
      let list = tokens
      if (params.supplierId) list = list.filter(t => t.supplierId === params.supplierId)
      else if (params.status) list = list.filter(t => t.status === params.status)
      return ok(config, list)
    }
    if (method === 'post' && url === '/tokens') {
      const token: GovernmentToken = {
        id: String(Date.now()), tokenCode: String(body.tokenCode ?? 'GOV-NEW'),
        supplierId: String(body.supplierId ?? ''), supplierName: String(body.supplierName ?? ''),
        institutionName: String(body.institutionName ?? ''), value: Number(body.value ?? 0),
        issuedDate: String(body.issuedDate ?? '2026-01-01'), expiryDate: String(body.expiryDate ?? '2026-12-31'),
        status: (body.status as GovernmentToken['status']) ?? 'pending',
      }
      tokens.push(token)
      notifications.unshift({ id: `N-${Date.now()}`, type: 'token_issued', title: 'New token issued', message: `Government issued ${token.tokenCode}.`, read: false, createdAt: nowIso() })
      return ok(config, token, 201)
    }
    const tokenMatch = url.match(/^\/tokens\/([^/]+)$/)
    if (tokenMatch) {
      const token = tokens.find(t => t.id === tokenMatch[1])
      if (!token) return fail(config, 404, 'Token not found')
      if (method === 'get') return ok(config, token)
      if (method === 'put') {
        token.status = (body.status as GovernmentToken['status']) ?? token.status
        return ok(config, token)
      }
    }
    return fail(config, 404, 'Not found')
  }

  // Suppliers
  if (method === 'get' && url === '/suppliers') {
    return ok(config, suppliers)
  }

  // Supply orders & consumptions
  if (url.startsWith('/supply-orders')) {
    if (method === 'get' && url === '/supply-orders') {
      let list = supplyOrders
      if (params.supplierId) list = list.filter(o => o.supplierId === params.supplierId)
      if (params.schoolId) list = list.filter(o => o.schoolId === params.schoolId)
      return ok(config, list)
    }
    if (method === 'post' && url === '/supply-orders') {
      const order: SupplyOrder = {
        id: `SO-${Date.now()}`, itemType: String(body.itemType ?? ''), quantity: Number(body.quantity ?? 0),
        unit: String(body.unit ?? ''), orderDate: String(body.orderDate ?? '2026-01-01'),
        supplierId: String(body.supplierId ?? ''), schoolId: String(body.schoolId ?? ''),
        status: (body.status as SupplyOrder['status']) ?? 'pending', receivedQuantity: body.receivedQuantity as number | undefined,
      }
      supplyOrders.push(order)
      return ok(config, order, 201)
    }
    const orderMatch = url.match(/^\/supply-orders\/([^/]+)$/)
    if (method === 'put' && orderMatch) {
      const order = supplyOrders.find(o => o.id === orderMatch[1])
      if (!order) return fail(config, 404, 'Order not found')
      if (body.status) order.status = body.status as SupplyOrder['status']
      if (body.receivedQuantity != null) order.receivedQuantity = Number(body.receivedQuantity)
      return ok(config, order)
    }
    return fail(config, 404, 'Not found')
  }

  if (url.startsWith('/supply-consumptions')) {
    if (method === 'get' && url === '/supply-consumptions') {
      let list = consumptions
      if (params.schoolId) list = list.filter(c => c.schoolId === params.schoolId)
      return ok(config, list)
    }
    if (method === 'post' && url === '/supply-consumptions') {
      const c: SupplyConsumption = {
        id: `SC-${Date.now()}`, schoolId: String(body.schoolId ?? ''), itemType: String(body.itemType ?? ''),
        quantity: Number(body.quantity ?? 0), unit: String(body.unit ?? ''), mealSession: String(body.mealSession ?? ''),
        studentsServed: Number(body.studentsServed ?? 0), consumedAt: nowIso(),
      }
      consumptions.push(c)
      return ok(config, c, 201)
    }
    return fail(config, 404, 'Not found')
  }

  // Payment sessions
  if (url.startsWith('/payment-sessions')) {
    if (method === 'get' && url === '/payment-sessions') {
      let list = paymentSessions.map(sessionToDto)
      if (params.supplierId) list = list.filter(s => s.supplierId === params.supplierId)
      else if (params.status) list = list.filter(s => s.status === params.status)
      return ok(config, list)
    }
    if (method === 'post' && url === '/payment-sessions') {
      const token = tokens.find(t => t.id === String(body.governmentTokenId ?? ''))
      if (!token) return fail(config, 404, 'Token not found')
      if (token.status !== 'active') return fail(config, 400, 'Token is not active')
      const session: MockSession = {
        id: `PS-${Date.now()}`, govTokenId: token.id, supplierId: token.supplierId, amount: token.value,
        status: 'pending', reference: `PAY-${token.tokenCode}`, createdAt: nowIso(),
      }
      paymentSessions.push(session)
      notifications.unshift({ id: `N-${Date.now()}`, type: 'payment_submitted', title: 'Payout submitted', message: `${token.supplierName} submitted ${token.tokenCode}.`, read: false, createdAt: nowIso() })
      return ok(config, sessionToDto(session), 201)
    }
    const sessionAction = url.match(/^\/payment-sessions\/([^/]+)\/(validate|release|reject)$/)
    if (method === 'post' && sessionAction) {
      const session = paymentSessions.find(s => s.id === sessionAction[1])
      if (!session) return fail(config, 404, 'Session not found')
      const token = tokens.find(t => t.id === session.govTokenId)
      const action = sessionAction[2]
      if (action === 'validate') {
        if (session.status !== 'pending') return fail(config, 400, 'Only a pending session can be validated')
        session.status = 'processing'
      } else if (action === 'release') {
        if (session.status !== 'processing') return fail(config, 400, 'Only a validated session can have cash released')
        session.status = 'completed'
        session.completedAt = nowIso()
        if (token) token.status = 'redeemed'
        const tx: BankTransaction = {
          id: `BTX-${Date.now()}`, tokenId: token?.id ?? '', tokenCode: token?.tokenCode ?? '—',
          supplierName: token?.supplierName ?? '—', amount: session.amount, processedAt: nowIso(), status: 'released',
        }
        bankTransactions.push(tx)
        session.bankTransactionId = tx.id
      } else {
        if (session.status !== 'pending' && session.status !== 'processing') return fail(config, 400, 'Cannot reject')
        session.status = 'failed'
        session.completedAt = nowIso()
        const tx: BankTransaction = {
          id: `BTX-${Date.now()}`, tokenId: token?.id ?? '', tokenCode: token?.tokenCode ?? '—',
          supplierName: token?.supplierName ?? '—', amount: session.amount, processedAt: nowIso(), status: 'rejected',
          reason: body.reason ? String(body.reason) : undefined,
        }
        bankTransactions.push(tx)
        session.bankTransactionId = tx.id
      }
      return ok(config, sessionToDto(session))
    }
    return fail(config, 404, 'Not found')
  }

  // Bank transactions
  if (method === 'get' && url === '/bank/transactions') {
    return ok(config, bankTransactions)
  }

  // Scanner
  if (method === 'get' && url === '/scanner/feed') {
    return ok(config, mealValidations)
  }
  if (method === 'post' && url === '/scanner/scan') {
    const qr = String(body.qrCode ?? '')
    const card = MOCK_CARDS.find(c => c.studentId === qr)
    if (!card) {
      const result: ScanResult = { status: 'unknown_card' }
      return ok(config, result)
    }
    if (scannedThisSession.has(qr)) {
      const result: ScanResult = { status: 'duplicate_scan' }
      return ok(config, result)
    }
    scannedThisSession.add(qr)
    if (card.studentStatus === 'inactive') {
      const result: ScanResult = { status: 'inactive_student' }
      return ok(config, result)
    }
    const result: ScanResult = { status: 'served', studentName: card.studentName }
    return ok(config, result)
  }

  return fail(config, 404, `No mock handler for ${method.toUpperCase()} ${url}`)
}
