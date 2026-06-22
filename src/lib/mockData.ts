// ─── Mock Data — Central registry for all modules ──────────────────────────────
// Each module has data covering all possible case scenarios (statuses, edge cases)
// Single source of truth — every portal imports from here so token codes, supplier
// names, and institution names are consistent across the entire application.
import type { GovernmentToken, ReimbursementClaim, BankTransaction } from '../types'

// ────────────────────────────────────────────────────────────────────────────────
// 1. STUDENTS (Master Registry)
// ────────────────────────────────────────────────────────────────────────────────
export type StudentStatus = 'active' | 'pending' | 'suspended' | 'inactive'
export type CardStatus = 'issued' | 'pending' | 'suspended' | 'deactivated'
export type DiningEligibility = 'enabled' | 'disabled'
export type EnrollmentSource = 'ges' | 'manual'
export type Programme = 'General Science' | 'General Arts' | 'Home Economics' | 'Visual Arts' | 'Business' | 'Agricultural Science'
export type House = 'St Augustine House' | 'St Theresa House' | 'St Francis House' | 'St Monica House'

export interface MockStudent {
  id: string
  studentId: string
  beceNumber: string
  admissionNumber: string
  fullName: string
  photograph: string
  form: string
  className: string
  programme: Programme
  house: House
  academicYear: string
  diningEligibility: DiningEligibility
  cardStatus: CardStatus
  studentStatus: StudentStatus
  enrollmentSource: EnrollmentSource
  reportingDate: string
  joinedDate: string
  fraudFlags: number
  mealsThisWeek: number
  lastMealTime: string | null
  duplicateAttempts: number
  missedValidations: number
  auditLogs: MockAuditLog[]
}

export interface MockAuditLog {
  time: string
  event: string
}

export const MOCK_STUDENTS: MockStudent[] = [
  // ── Active, dining enabled, card issued — fully operational ──
  {
    id: '1',
    studentId: 'SAC-2026-01482',
    beceNumber: 'BECE-2024-GH-03921',
    admissionNumber: 'ADM-2026-00421',
    fullName: 'Abena Mensah',
    photograph: '',
    form: 'Form 1',
    className: '1 Science A',
    programme: 'General Science',
    house: 'St Augustine House',
    academicYear: '2025/2026',
    diningEligibility: 'enabled',
    cardStatus: 'issued',
    studentStatus: 'active',
    enrollmentSource: 'ges',
    reportingDate: '2026-01-12',
    joinedDate: '2026-01-12',
    fraudFlags: 0,
    mealsThisWeek: 18,
    lastMealTime: 'Today 7:15 AM',
    duplicateAttempts: 0,
    missedValidations: 0,
    auditLogs: [
      { time: '08:12 AM', event: 'Enrollment initiated' },
      { time: '08:13 AM', event: 'Imported from GES' },
      { time: '09:10 AM', event: 'Admission verified' },
      { time: '09:12 AM', event: 'Student marked as physically present' },
      { time: '09:14 AM', event: 'Student assigned to Form 1' },
      { time: '09:15 AM', event: 'Class allocation completed' },
      { time: '09:18 AM', event: 'Dining eligibility enabled' },
      { time: '09:20 AM', event: 'Validation card generated' },
      { time: '09:22 AM', event: 'Card issued successfully' },
      { time: '09:30 AM', event: 'Student activated' },
      { time: '09:31 AM', event: 'Student added to dining registry' },
    ],
  },
  {
    id: '2',
    studentId: 'SAC-2026-01483',
    beceNumber: 'BECE-2024-GH-04102',
    admissionNumber: 'ADM-2026-00422',
    fullName: 'Kofi Acheampong',
    photograph: '',
    form: 'Form 2',
    className: '2 Arts A',
    programme: 'General Arts',
    house: 'St Theresa House',
    academicYear: '2025/2026',
    diningEligibility: 'enabled',
    cardStatus: 'issued',
    studentStatus: 'active',
    enrollmentSource: 'ges',
    reportingDate: '2026-01-10',
    joinedDate: '2026-01-10',
    fraudFlags: 0,
    mealsThisWeek: 15,
    lastMealTime: 'Today 12:30 PM',
    duplicateAttempts: 0,
    missedValidations: 3,
    auditLogs: [
      { time: '08:30 AM', event: 'Imported from GES' },
      { time: '09:00 AM', event: 'Admission verified' },
      { time: '10:15 AM', event: 'Student activated' },
    ],
  },
  // ── Active, dining enabled, card pending — needs card issuance ──
  {
    id: '3',
    studentId: 'SAC-2026-01484',
    beceNumber: 'BECE-2024-GH-04563',
    admissionNumber: 'ADM-2026-00423',
    fullName: 'Ama Boateng',
    photograph: '',
    form: 'Form 3',
    className: '3 Home Ec A',
    programme: 'Home Economics',
    house: 'St Francis House',
    academicYear: '2025/2026',
    diningEligibility: 'enabled',
    cardStatus: 'pending',
    studentStatus: 'active',
    enrollmentSource: 'manual',
    reportingDate: '2026-02-01',
    joinedDate: '2026-02-01',
    fraudFlags: 1,
    mealsThisWeek: 0,
    lastMealTime: null,
    duplicateAttempts: 0,
    missedValidations: 18,
    auditLogs: [
      { time: '08:13 AM', event: 'Manual enrollment initiated' },
      { time: '08:15 AM', event: 'Manual enrollment — compliance flag created' },
      { time: '09:10 AM', event: 'Admission verified' },
      { time: '09:30 AM', event: 'Student activated' },
      { time: '10:00 AM', event: 'Dining eligibility enabled — card pending' },
    ],
  },
  // ── Active, dining disabled, card pending ──
  {
    id: '4',
    studentId: 'SAC-2026-01485',
    beceNumber: 'BECE-2024-GH-05120',
    admissionNumber: 'ADM-2026-00424',
    fullName: 'Yaw Darko',
    photograph: '',
    form: 'Form 1',
    className: '1 Business A',
    programme: 'Business',
    house: 'St Augustine House',
    academicYear: '2025/2026',
    diningEligibility: 'disabled',
    cardStatus: 'pending',
    studentStatus: 'active',
    enrollmentSource: 'ges',
    reportingDate: '2026-01-15',
    joinedDate: '2026-01-15',
    fraudFlags: 0,
    mealsThisWeek: 0,
    lastMealTime: null,
    duplicateAttempts: 0,
    missedValidations: 18,
    auditLogs: [
      { time: '08:12 AM', event: 'Imported from GES' },
      { time: '09:10 AM', event: 'Admission verified' },
      { time: '09:15 AM', event: 'Dining eligibility disabled — pending review' },
    ],
  },
  // ── Suspended student — card suspended ──
  {
    id: '5',
    studentId: 'SAC-2026-01486',
    beceNumber: 'BECE-2024-GH-03211',
    admissionNumber: 'ADM-2026-00425',
    fullName: 'Akua Serwaa',
    photograph: '',
    form: 'Form 2',
    className: '2 Science B',
    programme: 'General Science',
    house: 'St Monica House',
    academicYear: '2025/2026',
    diningEligibility: 'disabled',
    cardStatus: 'suspended',
    studentStatus: 'suspended',
    enrollmentSource: 'manual',
    reportingDate: '2026-01-08',
    joinedDate: '2026-01-08',
    fraudFlags: 3,
    mealsThisWeek: 0,
    lastMealTime: 'Mar 15, 2026',
    duplicateAttempts: 2,
    missedValidations: 45,
    auditLogs: [
      { time: '08:20 AM', event: 'Manual enrollment initiated' },
      { time: '10:00 AM', event: 'Student activated' },
      { time: 'Mar 10', event: 'Duplicate scan pattern detected' },
      { time: 'Mar 12', event: 'Student suspended — pending investigation' },
      { time: 'Mar 12', event: 'Card suspended' },
    ],
  },
  // ── Inactive student — graduated/withdrawn ──
  {
    id: '6',
    studentId: 'SAC-2026-01487',
    beceNumber: 'BECE-2023-GH-01872',
    admissionNumber: 'ADM-2025-00210',
    fullName: 'Kwesi Asare',
    photograph: '',
    form: 'Form 3',
    className: '3 Arts B',
    programme: 'Visual Arts',
    house: 'St Theresa House',
    academicYear: '2024/2025',
    diningEligibility: 'disabled',
    cardStatus: 'deactivated',
    studentStatus: 'inactive',
    enrollmentSource: 'ges',
    reportingDate: '2025-01-05',
    joinedDate: '2025-01-05',
    fraudFlags: 0,
    mealsThisWeek: 0,
    lastMealTime: 'Jun 20, 2025',
    duplicateAttempts: 0,
    missedValidations: 0,
    auditLogs: [
      { time: 'Jun 2025', event: 'Student completed programme' },
      { time: 'Jun 2025', event: 'Card deactivated' },
      { time: 'Jun 2025', event: 'Student marked inactive' },
    ],
  },
  // ── Active, dining enabled, card issued, latest enrollment ──
  {
    id: '7',
    studentId: 'SAC-2026-01488',
    beceNumber: 'BECE-2024-GH-06789',
    admissionNumber: 'ADM-2026-00426',
    fullName: 'Efua Dadzie',
    photograph: '',
    form: 'Form 1',
    className: '1 Agric A',
    programme: 'Agricultural Science',
    house: 'St Augustine House',
    academicYear: '2025/2026',
    diningEligibility: 'enabled',
    cardStatus: 'issued',
    studentStatus: 'active',
    enrollmentSource: 'ges',
    reportingDate: '2026-01-20',
    joinedDate: '2026-01-20',
    fraudFlags: 0,
    mealsThisWeek: 17,
    lastMealTime: 'Today 6:50 AM',
    duplicateAttempts: 0,
    missedValidations: 1,
    auditLogs: [
      { time: '08:10 AM', event: 'Imported from GES' },
      { time: '09:05 AM', event: 'Admission verified' },
      { time: '09:20 AM', event: 'Dining eligibility enabled' },
      { time: '09:25 AM', event: 'Student activated' },
    ],
  },
  // ── Pending admission — not yet verified ──
  {
    id: '8',
    studentId: 'SAC-2026-01489',
    beceNumber: 'BECE-2024-GH-07234',
    admissionNumber: 'ADM-2026-00427',
    fullName: 'Kwabena Nyarko',
    photograph: '',
    form: 'Form 1',
    className: '1 Science C',
    programme: 'General Science',
    house: 'St Francis House',
    academicYear: '2025/2026',
    diningEligibility: 'disabled',
    cardStatus: 'pending',
    studentStatus: 'pending',
    enrollmentSource: 'ges',
    reportingDate: '—',
    joinedDate: '2026-01-22',
    fraudFlags: 0,
    mealsThisWeek: 0,
    lastMealTime: null,
    duplicateAttempts: 0,
    missedValidations: 0,
    auditLogs: [
      { time: '08:12 AM', event: 'Enrollment initiated' },
      { time: '08:13 AM', event: 'Imported from GES' },
      { time: 'Note', event: 'Awaiting admission verification' },
    ],
  },
]

// Filters for Students page
export const STUDENT_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'inactive', label: 'Inactive' },
]

export const ACADEMIC_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Forms' },
  { key: 'Form 1', label: 'Form 1' },
  { key: 'Form 2', label: 'Form 2' },
  { key: 'Form 3', label: 'Form 3' },
]

// ────────────────────────────────────────────────────────────────────────────────
// 2. CARDS
// ────────────────────────────────────────────────────────────────────────────────

export interface MockCard {
  id: string
  studentId: string
  studentName: string
  cardUid: string
  issueDate: string
  status: CardStatus
  lastUsed: string | null
  validationsToday: number
  studentStatus: 'active' | 'inactive'
  form: string
  scanHistory: { time: string; hall: string; result: string }[]
  cardLogs: { time: string; event: string }[]
  diningEligibility: 'enabled' | 'disabled'
}

export const MOCK_CARDS: MockCard[] = [
  { id: '1', studentId: 'SAC-2026-01482', studentName: 'Kwesi Mensah',   cardUid: 'CARD-8832', issueDate: '2026-01-12', status: 'issued',   lastUsed: 'Today 7:12 AM',  validationsToday: 3, studentStatus: 'active',  form: 'Form 1', diningEligibility: 'enabled', scanHistory: [
    { time: '7:12 AM',  hall: 'Main Refectory',  result: 'Success' },
    { time: '12:03 PM', hall: 'Main Refectory',  result: 'Success' },
    { time: '6:05 PM',  hall: 'Annex Refectory', result: 'Success' },
  ], cardLogs: [
    { time: '09:10', event: 'Card generated' },
    { time: '09:12', event: 'Card activated' },
    { time: '07:15', event: 'Meal validated' },
  ]},
  { id: '2', studentId: 'SAC-2026-01483', studentName: 'Daniel Ofori',   cardUid: '—',           issueDate: '—',           status: 'pending',  lastUsed: '—',              validationsToday: 0, studentStatus: 'active',  form: 'Form 2', diningEligibility: 'enabled', scanHistory: [], cardLogs: [] },
  { id: '3', studentId: 'SAC-2026-01484', studentName: 'Michael Asare',  cardUid: 'CARD-8834', issueDate: '2026-01-10', status: 'suspended',lastUsed: 'Yesterday 2:14 PM', validationsToday: 0, studentStatus: 'active',  form: 'Form 1', diningEligibility: 'enabled', scanHistory: [
    { time: '7:18 AM',  hall: 'Main Refectory', result: 'Success' },
    { time: '2:14 PM',  hall: 'Main Refectory', result: 'Duplicate' },
  ], cardLogs: [
    { time: '09:10', event: 'Card generated' },
    { time: '09:12', event: 'Card activated' },
    { time: '07:15', event: 'Meal validated' },
    { time: '12:01', event: 'Duplicate scan rejected' },
    { time: '02:14', event: 'Card suspended' },
  ]},
  { id: '4', studentId: 'SAC-2026-01485', studentName: 'Ama Serwaa',    cardUid: '—',           issueDate: '—',           status: 'pending',  lastUsed: '—',              validationsToday: 0, studentStatus: 'active',  form: 'Form 3', diningEligibility: 'disabled', scanHistory: [], cardLogs: [] },
  { id: '5', studentId: 'SAC-2026-01486', studentName: 'Kofi Badu',     cardUid: 'CARD-8836', issueDate: '2025-09-05', status: 'deactivated',lastUsed: 'Jun 20, 2025',  validationsToday: 0, studentStatus: 'inactive',form: 'Form 3', diningEligibility: 'disabled', scanHistory: [], cardLogs: [
    { time: '09:10', event: 'Card generated' },
    { time: '09:12', event: 'Card activated' },
    { time: '03:42', event: 'Replacement card issued' },
    { time: '03:43', event: 'Old card deactivated' },
  ]},
  { id: '6', studentId: 'SAC-2026-01487', studentName: 'Yaw Bediako',   cardUid: 'CARD-8837', issueDate: '2026-01-15', status: 'issued',   lastUsed: 'Today 6:50 AM',  validationsToday: 2, studentStatus: 'active',  form: 'Form 2', diningEligibility: 'enabled', scanHistory: [
    { time: '6:50 AM',  hall: 'Annex Refectory', result: 'Success' },
    { time: '12:10 PM', hall: 'Annex Refectory', result: 'Success' },
  ], cardLogs: [
    { time: '10:00', event: 'Card generated' },
    { time: '10:02', event: 'Card activated' },
  ]},
  { id: '7', studentId: 'SAC-2026-01488', studentName: 'Esi Dadzie',    cardUid: 'CARD-8838', issueDate: '2026-01-20', status: 'issued',   lastUsed: 'Today 7:05 AM',  validationsToday: 3, studentStatus: 'active',  form: 'Form 1', diningEligibility: 'enabled', scanHistory: [
    { time: '7:05 AM',  hall: 'Main Refectory',  result: 'Success' },
    { time: '12:30 PM', hall: 'Main Refectory',  result: 'Success' },
    { time: '6:15 PM',  hall: 'Main Refectory',  result: 'Success' },
  ], cardLogs: [
    { time: '08:20', event: 'Card generated' },
    { time: '08:22', event: 'Card activated' },
  ]},
  { id: '8', studentId: 'SAC-2026-01489', studentName: 'Akosua Frimpong',cardUid: 'CARD-8839',issueDate: '2026-01-08', status: 'suspended',lastUsed: 'Mar 12, 2026',  validationsToday: 0, studentStatus: 'active',  form: 'Form 1', diningEligibility: 'enabled', scanHistory: [
    { time: '7:20 AM',  hall: 'Main Refectory', result: 'Success' },
    { time: '12:15 PM', hall: 'Main Refectory', result: 'Duplicate' },
  ], cardLogs: [
    { time: '08:30', event: 'Card generated' },
    { time: '08:32', event: 'Card activated' },
    { time: '09:00', event: 'Card suspended — disciplinary' },
  ]},
  { id: '9', studentId: 'SAC-2026-01490', studentName: 'Kojo Amoako',   cardUid: '—',           issueDate: '—',           status: 'pending',  lastUsed: '—',              validationsToday: 0, studentStatus: 'inactive',form: 'Form 3', diningEligibility: 'disabled', scanHistory: [], cardLogs: [] },
  { id: '10',studentId: 'SAC-2026-01491', studentName: 'Afia Nuamah',   cardUid: 'CARD-8841', issueDate: '2026-02-01', status: 'issued',   lastUsed: 'Today 7:22 AM',  validationsToday: 3, studentStatus: 'active',  form: 'Form 2', diningEligibility: 'enabled', scanHistory: [
    { time: '7:22 AM',  hall: 'Main Refectory', result: 'Success' },
  ], cardLogs: [
    { time: '09:40', event: 'Card generated' },
    { time: '09:42', event: 'Card activated' },
  ]},
  { id: '11',studentId: 'SAC-2026-01492', studentName: 'Nana Yaw Duah', cardUid: 'CARD-8842', issueDate: '2025-11-01', status: 'deactivated',lastUsed: 'Apr 5, 2026',  validationsToday: 0, studentStatus: 'inactive',form: 'Form 3', diningEligibility: 'disabled', scanHistory: [], cardLogs: [
    { time: '11:00', event: 'Card generated' },
    { time: '11:02', event: 'Card activated' },
    { time: '04:10', event: 'Card deactivated — student graduated' },
  ]},
  { id: '12',studentId: 'SAC-2026-01493', studentName: 'Abigail Tetteh',cardUid: '—',          issueDate: '—',           status: 'pending',  lastUsed: '—',              validationsToday: 0, studentStatus: 'active',  form: 'Form 1', diningEligibility: 'enabled', scanHistory: [], cardLogs: [] },
]

// ────────────────────────────────────────────────────────────────────────────────
// 3. MEAL VALIDATIONS / DINING HALL FEED
// ────────────────────────────────────────────────────────────────────────────────
export type ValidationStatus = 'served' | 'duplicate' | 'flagged' | 'invalid_card' | 'inactive_student'

export interface MockValidation {
  id: number
  studentName: string
  studentId: string
  scanPoint: string
  time: string
  date: string
  mealSession: string
  status: ValidationStatus
}

export const MOCK_VALIDATIONS: MockValidation[] = [
  { id: 1, studentName: 'Abena Mensah',    studentId: 'SAC-2026-01482', scanPoint: 'Main Refectory',  time: '07:15 AM', date: 'Today', mealSession: 'Breakfast', status: 'served' },
  { id: 2, studentName: 'Kofi Acheampong', studentId: 'SAC-2026-01483', scanPoint: 'Annex Refectory', time: '07:20 AM', date: 'Today', mealSession: 'Breakfast', status: 'served' },
  { id: 3, studentName: 'Efua Dadzie',     studentId: 'SAC-2026-01488', scanPoint: 'Main Refectory',  time: '07:18 AM', date: 'Today', mealSession: 'Breakfast', status: 'served' },
  { id: 4, studentName: 'Abena Mensah',    studentId: 'SAC-2026-01482', scanPoint: 'Main Refectory',  time: '07:45 AM', date: 'Today', mealSession: 'Breakfast', status: 'duplicate' },
  { id: 5, studentName: 'Kofi Acheampong', studentId: 'SAC-2026-01483', scanPoint: 'Main Refectory',  time: '12:35 PM', date: 'Today', mealSession: 'Lunch',     status: 'served' },
  { id: 6, studentName: 'Unknown Card',    studentId: '—',               scanPoint: 'Main Refectory',  time: '12:40 PM', date: 'Today', mealSession: 'Lunch',     status: 'invalid_card' },
  { id: 7, studentName: 'Abena Mensah',    studentId: 'SAC-2026-01482', scanPoint: 'Main Refectory',  time: '12:30 PM', date: 'Today', mealSession: 'Lunch',     status: 'served' },
  { id: 8, studentName: 'Efua Dadzie',     studentId: 'SAC-2026-01488', scanPoint: 'Annex Refectory', time: '12:45 PM', date: 'Today', mealSession: 'Lunch',     status: 'served' },
  { id: 9, studentName: 'Efua Dadzie',     studentId: 'SAC-2026-01488', scanPoint: 'Annex Refectory', time: '06:15 PM', date: 'Today', mealSession: 'Dinner',    status: 'served' },
  { id: 10, studentName: 'Abena Mensah',   studentId: 'SAC-2026-01482', scanPoint: 'Main Refectory',  time: '06:20 PM', date: 'Today', mealSession: 'Dinner',    status: 'served' },
  { id: 11, studentName: 'Kofi Acheampong',studentId: 'SAC-2026-01483', scanPoint: 'Main Refectory',  time: '06:25 PM', date: 'Today', mealSession: 'Dinner',    status: 'flagged' },
  { id: 12, studentName: 'Akua Serwaa',    studentId: 'SAC-2026-01486', scanPoint: 'Main Refectory',  time: '06:30 PM', date: 'Today', mealSession: 'Dinner',    status: 'inactive_student' },
]

// ────────────────────────────────────────────────────────────────────────────────
// 4. DAILY REPORTS
// ────────────────────────────────────────────────────────────────────────────────
export type ReportWorkflowStage = 'generated' | 'operational_review' | 'compliance_review' | 'claim_eligible'
export type ReportStatus = 'analyzing' | 'approved' | 'locked' | 'eligible'

export interface MockDailyReport {
  id: string
  reportId: string
  date: string
  mealsServed: number
  eligibleStudents: number
  fraudAlerts: number
  netEligible: string
  grossEstimate: string
  semesterAccrued: string
  policyAdjustments: string
  workflowStage: ReportWorkflowStage
  status: ReportStatus
  generatedBy: string
  updatedAt: string
  sessions: number
  // Attendance breakdown
  breakfastServed: number
  lunchServed: number
  dinnerServed: number
  // Supply consumed
  riceUsed: string
  oilUsed: string
  beansUsed: string
  // Financial chain: mealRevenue + supplyCost = grossEstimate
  mealRevenue: string
  supplyCost: string
  // Logs
  logs: { time: string; event: string }[]
  riskScore: number
  reviewFlag?: {
    type: string
    session?: string
    detail: string
  }
  riskAlerts?: { label: string; detail: string }[]
}

export const MOCK_DAILY_REPORTS: MockDailyReport[] = [
  {
    id: '1',
    reportId: 'DR-2026-0315',
    date: '15 Mar 2026',
    mealsServed: 2413,
    eligibleStudents: 2850,
    fraudAlerts: 3,
    netEligible: 'GHS 38,320',
    grossEstimate: 'GHS 41,820',
    semesterAccrued: 'GHS 812,400',
    policyAdjustments: '-GHS 3,500',
    workflowStage: 'generated',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: 'Today, 8:10 PM',
    riskScore: 58,
    sessions: 3,
    breakfastServed: 2352,
    lunchServed: 2418,
    dinnerServed: 2469,
    riceUsed: '33 Bags',
    oilUsed: '5 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 39,600',
    supplyCost: 'GHS 2,220',
    logs: [
      { time: '6:00 AM', event: 'Breakfast session opened' },
      { time: '7:32 AM', event: 'Breakfast session closed' },
      { time: '12:00 PM', event: 'Lunch session opened' },
      { time: '2:01 PM', event: 'Lunch session closed' },
      { time: '6:00 PM', event: 'Dinner session opened' },
      { time: '7:45 PM', event: 'Dinner session closed' },
      { time: '8:00 PM', event: 'Attendance reconciliation completed' },
      { time: '8:03 PM', event: 'Supply reconciliation completed' },
      { time: '8:05 PM', event: 'Fraud engine executed' },
      { time: '8:07 PM', event: 'Financial estimate generated' },
      { time: '8:10 PM', event: 'Daily report created' },
    ],
    riskAlerts: [
      { label: 'Scan Timing Anomaly',  detail: 'Scanner at Block C recorded 847 scans in 12 minutes during breakfast — physically impossible rate.' },
      { label: 'Duplicate Scan',       detail: 'Student SAC-1821 scanned at Dining Hall A and Hall B within 4 minutes — two halls, one student.' },
      { label: 'Supply Variance',      detail: 'Cooking oil usage 2.3× above daily average for the meals served today.' },
    ],
  },
  {
    id: '2',
    reportId: 'DR-2026-0314',
    date: '14 Mar 2026',
    mealsServed: 2387,
    eligibleStudents: 2850,
    fraudAlerts: 0,
    netEligible: 'GHS 40,810',
    grossEstimate: 'GHS 40,810',
    semesterAccrued: 'GHS 774,080',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '14 Mar, 8:12 PM',
    riskScore: 0,
    sessions: 3,
    breakfastServed: 2310,
    lunchServed: 2405,
    dinnerServed: 2445,
    riceUsed: '31 Bags',
    oilUsed: '4 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 39,180',
    supplyCost: 'GHS 1,630',
    logs: [
      { time: '6:00 AM', event: 'Breakfast session opened' },
      { time: '7:30 AM', event: 'Breakfast session closed' },
      { time: '12:00 PM', event: 'Lunch session opened' },
      { time: '2:00 PM', event: 'Lunch session closed' },
      { time: '6:00 PM', event: 'Dinner session opened' },
      { time: '7:40 PM', event: 'Dinner session closed' },
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:12 PM', event: 'Report approved and locked' },
      { time: '8:13 PM', event: 'Added to semester claim pool' },
    ],
  },
  {
    id: '3',
    reportId: 'DR-2026-0313',
    date: '13 Mar 2026',
    mealsServed: 2401,
    eligibleStudents: 2845,
    fraudAlerts: 1,
    netEligible: 'GHS 40,431',
    grossEstimate: 'GHS 40,931',
    semesterAccrued: 'GHS 736,170',
    policyAdjustments: '-GHS 500',
    workflowStage: 'claim_eligible',
    status: 'locked',
    generatedBy: 'Auto',
    updatedAt: '13 Mar, 9:05 PM',
    riskScore: 8,
    sessions: 3,
    breakfastServed: 2330,
    lunchServed: 2420,
    dinnerServed: 2450,
    riceUsed: '32 Bags',
    oilUsed: '5 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 39,401',
    supplyCost: 'GHS 1,530',
    logs: [
      { time: '6:00 AM', event: 'Breakfast session opened' },
      { time: '7:35 AM', event: 'Breakfast session closed' },
      { time: '12:00 PM', event: 'Lunch session opened' },
      { time: '2:05 PM', event: 'Lunch session closed' },
      { time: '6:00 PM', event: 'Dinner session opened' },
      { time: '7:50 PM', event: 'Dinner session closed' },
      { time: '8:10 PM', event: 'Daily report created' },
      { time: '8:30 PM', event: 'Operational review completed' },
      { time: '9:00 PM', event: 'Compliance review completed' },
      { time: '9:05 PM', event: 'Report locked — awaiting claim' },
    ],
    riskAlerts: [
      { label: 'Late-Entry Scan', detail: 'Student SAC-0847 scanned 90 seconds after supper session close — logged as late entry, flagged for review.' },
    ],
  },
  {
    id: '4',
    reportId: 'DR-2026-0312',
    date: '12 Mar 2026',
    mealsServed: 2395,
    eligibleStudents: 2845,
    fraudAlerts: 2,
    netEligible: 'GHS 40,413',
    grossEstimate: 'GHS 40,713',
    semesterAccrued: 'GHS 698,020',
    policyAdjustments: '-GHS 300',
    workflowStage: 'compliance_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '12 Mar, 8:30 PM',
    riskScore: 62,
    sessions: 3,
    breakfastServed: 2340,
    lunchServed: 2410,
    dinnerServed: 2430,
    riceUsed: '30 Bags',
    oilUsed: '4 Litres',
    beansUsed: '4 Bags',
    mealRevenue: 'GHS 39,293',
    supplyCost: 'GHS 1,420',
    reviewFlag: {
      type: 'Suspended Student Received Meal',
      session: 'Lunch Session',
      detail: 'Student SAC-2032 (status: Suspended) successfully validated at Dining Hall B during lunch.',
    },
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:12 PM', event: 'Compliance engine flagged suspended student validation — SAC-2032' },
      { time: '8:15 PM', event: 'Operational review cleared' },
      { time: '8:30 PM', event: 'Sent to compliance review — suspended student incident' },
    ],
    riskAlerts: [
      { label: 'Suspended Student Validated', detail: 'Student SAC-2032 (Kwame Owusu, Form 2 Science A) validated at Dining Hall B during lunch — account is suspended.' },
      { label: 'Unknown Card Scanned',        detail: 'Card SHC-5501 not in student registry — scanned 3 times during lunch without rejection.' },
    ],
  },
  {
    id: '5',
    reportId: 'DR-2026-0311',
    date: '11 Mar 2026',
    mealsServed: 2420,
    eligibleStudents: 2840,
    fraudAlerts: 0,
    netEligible: 'GHS 41,301',
    grossEstimate: 'GHS 41,301',
    semesterAccrued: 'GHS 660,220',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '11 Mar, 8:11 PM',
    riskScore: 0,
    sessions: 3,
    breakfastServed: 2355,
    lunchServed: 2425,
    dinnerServed: 2480,
    riceUsed: '34 Bags',
    oilUsed: '5 Litres',
    beansUsed: '6 Bags',
    mealRevenue: 'GHS 39,721',
    supplyCost: 'GHS 1,580',
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:11 PM', event: 'Report approved, locked, and added to claim pool' },
    ],
  },
  {
    id: '6',
    reportId: 'DR-2026-0310',
    date: '10 Mar 2026',
    mealsServed: 2105,
    eligibleStudents: 2840,
    fraudAlerts: 7,
    netEligible: 'GHS 30,961',
    grossEstimate: 'GHS 34,561',
    semesterAccrued: 'GHS 622,270',
    policyAdjustments: '-GHS 3,600',
    workflowStage: 'operational_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '10 Mar, 8:45 PM',
    riskScore: 85,
    sessions: 3,
    breakfastServed: 2000,
    lunchServed: 2150,
    dinnerServed: 2165,
    riceUsed: '41 Bags',
    oilUsed: '4 Litres',
    beansUsed: '4 Bags',
    mealRevenue: 'GHS 34,561',
    supplyCost: 'GHS 0',
    reviewFlag: {
      type: 'Dining Session Never Closed',
      session: 'Supper Session',
      detail: 'Supper session still active at 11:58 PM. Financial engine cannot reconcile totals until session is closed.',
    },
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:08 PM', event: 'Fraud engine flagged 7 suspicious scans' },
      { time: '8:10 PM', event: 'Supper session detected still active — reconciliation blocked' },
      { time: '8:45 PM', event: 'Sent to operational review — session close required' },
    ],
    riskAlerts: [
      { label: 'Session Not Closed',     detail: 'Supper session still active past midnight — financial engine blocked from reconciling totals.' },
      { label: 'Duplicate Card Use',     detail: 'Card SHC-4421 scanned at 3 different scan points within 7 minutes — physically impossible.' },
      { label: 'Unknown Card Scans',     detail: '2 scans from unregistered card credentials — not found in student registry.' },
      { label: 'Rice Over-Consumption',  detail: 'Rice usage 40% above expected threshold for the number of meals served — supply anomaly flagged.' },
      { label: 'Simultaneous Dual Scan', detail: 'Card SHC-3302 recorded at breakfast and lunch simultaneously at separate dining halls.' },
      { label: 'Mass Scan Spike',        detail: '312 scans recorded in a 4-minute window at Dining Hall B — rate exceeds physical scanning capacity.' },
      { label: 'Post-Session Records',   detail: 'Dining supervisor manually added 47 student entries after session close — justification required.' },
    ],
  },
  // Edge case: report with no fraud, no adjustments
  {
    id: '7',
    reportId: 'DR-2026-0309',
    date: '09 Mar 2026',
    mealsServed: 2390,
    eligibleStudents: 2840,
    fraudAlerts: 0,
    netEligible: 'GHS 40,799',
    grossEstimate: 'GHS 40,799',
    semesterAccrued: 'GHS 589,070',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '09 Mar, 8:08 PM',
    riskScore: 0,
    sessions: 3,
    breakfastServed: 2330,
    lunchServed: 2410,
    dinnerServed: 2430,
    riceUsed: '31 Bags',
    oilUsed: '5 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 39,239',
    supplyCost: 'GHS 1,560',
    logs: [
      { time: '8:04 PM', event: 'Daily report created' },
      { time: '8:08 PM', event: 'Clean report — auto-approved and locked' },
    ],
  },
  {
    id: '8',
    reportId: 'DR-2026-0228',
    date: '28 Feb 2026',
    mealsServed: 2360,
    eligibleStudents: 2845,
    fraudAlerts: 0,
    netEligible: 'GHS 38,901',
    grossEstimate: 'GHS 38,901',
    semesterAccrued: 'GHS 551,220',
    policyAdjustments: 'GHS 0',
    workflowStage: 'operational_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '28 Feb, 9:10 PM',
    riskScore: 42,
    sessions: 3,
    breakfastServed: 2305,
    lunchServed: 2380,
    dinnerServed: 2330,
    riceUsed: '31 Bags',
    oilUsed: '4 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 38,411',
    supplyCost: 'GHS 490',
    reviewFlag: {
      type: 'Missing Supply Logs',
      session: 'Lunch & Supper',
      detail: 'Students were served all 3 meals, but the storekeeper submitted only breakfast supply records. Lunch and supper consumption logs are absent — supply contribution is unverified.',
    },
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:12 PM', event: 'Missing supply records detected — Lunch and Supper logs absent' },
      { time: '9:10 PM', event: 'Sent to operational review — storekeeper action required' },
    ],
  },
  {
    id: '9',
    reportId: 'DR-2026-0226',
    date: '26 Feb 2026',
    mealsServed: 2380,
    eligibleStudents: 2845,
    fraudAlerts: 5,
    netEligible: 'GHS 39,767',
    grossEstimate: 'GHS 40,467',
    semesterAccrued: 'GHS 513,600',
    policyAdjustments: '-GHS 700',
    workflowStage: 'compliance_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '26 Feb, 9:30 PM',
    riskScore: 55,
    sessions: 3,
    breakfastServed: 2325,
    lunchServed: 2400,
    dinnerServed: 2415,
    riceUsed: '32 Bags',
    oilUsed: '5 Litres',
    beansUsed: '5 Bags',
    mealRevenue: 'GHS 39,077',
    supplyCost: 'GHS 1,390',
    reviewFlag: {
      type: 'Duplicate Meal Claims',
      session: 'Breakfast Session',
      detail: '128 duplicate validation attempts at Block A scanner — exceeds the acceptable threshold of 20.',
    },
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:15 PM', event: 'Operational review cleared' },
      { time: '8:40 PM', event: '128 duplicate scan attempts detected by fraud engine at Block A' },
      { time: '9:30 PM', event: 'Sent to compliance review — duplicate threshold exceeded' },
    ],
    riskAlerts: [
      { label: 'Duplicate Scan Burst',      detail: '128 duplicate validation attempts from the Block A breakfast scanner in under 8 minutes.' },
      { label: 'Repeated Card Use',         detail: 'Card SHC-2210 scanned 6 consecutive times at the same scanner — suspected card sharing.' },
      { label: 'Unknown Card Entries',      detail: '2 unregistered card scans recorded during breakfast — credentials not found in registry.' },
      { label: 'Replacement Card Spike',    detail: '37 card replacements processed today. Weekly average is 3 — far exceeds policy threshold.' },
      { label: 'Manual Enrollment Surge',   detail: '48 manual student enrollments added overnight. Reimbursement risk — enrollment count directly affects claim amount.' },
    ],
  },
]

// Kanban workflow columns
export const WORKFLOW_COLUMNS = [
  { id: 'generated',          label: 'Generated',          dot: 'bg-orange-400' },
  { id: 'operational_review', label: 'Operational Review', dot: 'bg-blue-500'   },
  { id: 'compliance_review',  label: 'Compliance Review',  dot: 'bg-red-500'    },
  { id: 'claim_eligible',     label: 'Claim Eligible',     dot: 'bg-green-500'  },
]

// ── Report Aggregation Hierarchy ─────────────────────────────────────────────
export interface WeeklyBatch {
  id: string
  weekLabel: string
  weekNumber: number
  daysRange: string
  days: { dayNum: number; reportId: string; date: string; meals: number; status: 'eligible' | 'pipeline' }[]
  totalMeals: number
  supplyRecords: number
  fraudCases: number
  netEligibleNum: number
  netEligible: string
  status: 'complete' | 'incomplete'
  studentValidations: { total: number; successful: number; rejected: number }
  supplyLogs: { item: string; qty: number; unit: string }[]
  fraudSummary: { duplicateCards: number; unknownCards: number; supplyAnomalies: number }
  financial: { gross: number; policyDeductions: number; netEligible: number }
}

export const WEEKLY_BATCHES: WeeklyBatch[] = [
  {
    id: 'wk-9',
    weekLabel: 'Week 9',
    weekNumber: 9,
    daysRange: 'Mar 2 – 8',
    days: [
      { dayNum: 1, reportId: 'DR-2026-0302', date: '2 Mar',  meals: 2388, status: 'eligible' },
      { dayNum: 2, reportId: 'DR-2026-0303', date: '3 Mar',  meals: 2415, status: 'eligible' },
      { dayNum: 3, reportId: 'DR-2026-0304', date: '4 Mar',  meals: 2402, status: 'eligible' },
      { dayNum: 4, reportId: 'DR-2026-0305', date: '5 Mar',  meals: 2390, status: 'eligible' },
      { dayNum: 5, reportId: 'DR-2026-0306', date: '6 Mar',  meals: 2420, status: 'eligible' },
      { dayNum: 6, reportId: 'DR-2026-0307', date: '7 Mar',  meals: 2397, status: 'eligible' },
      { dayNum: 7, reportId: 'DR-2026-0308', date: '8 Mar',  meals: 2390, status: 'eligible' },
    ],
    totalMeals: 16802,
    supplyRecords: 21,
    fraudCases: 1,
    netEligibleNum: 265200,
    netEligible: 'GHS 265,200',
    status: 'complete',
    studentValidations: { total: 16802, successful: 16775, rejected: 27 },
    supplyLogs: [
      { item: 'Rice',        qty: 224, unit: 'Bags'   },
      { item: 'Beans',       qty:  35, unit: 'Bags'   },
      { item: 'Cooking Oil', qty:  33, unit: 'Litres' },
    ],
    fraudSummary: { duplicateCards: 0, unknownCards: 1, supplyAnomalies: 0 },
    financial: { gross: 267500, policyDeductions: 2300, netEligible: 265200 },
  },
  {
    id: 'wk-10',
    weekLabel: 'Week 10',
    weekNumber: 10,
    daysRange: 'Mar 9 – 15',
    days: [
      { dayNum: 1, reportId: 'DR-2026-0309', date: '9 Mar',  meals: 2390, status: 'eligible' },
      { dayNum: 2, reportId: 'DR-2026-0310', date: '10 Mar', meals: 2105, status: 'pipeline' },
      { dayNum: 3, reportId: 'DR-2026-0311', date: '11 Mar', meals: 2420, status: 'eligible' },
      { dayNum: 4, reportId: 'DR-2026-0312', date: '12 Mar', meals: 2395, status: 'pipeline' },
      { dayNum: 5, reportId: 'DR-2026-0313', date: '13 Mar', meals: 2401, status: 'pipeline' },
      { dayNum: 6, reportId: 'DR-2026-0314', date: '14 Mar', meals: 2387, status: 'eligible' },
      { dayNum: 7, reportId: 'DR-2026-0315', date: '15 Mar', meals: 2413, status: 'pipeline' },
    ],
    totalMeals: 16511,
    supplyRecords: 21,
    fraudCases: 4,
    netEligibleNum: 0,
    netEligible: 'Pending',
    status: 'incomplete',
    studentValidations: { total: 9197, successful: 9188, rejected: 9 },
    supplyLogs: [
      { item: 'Rice',        qty:  94, unit: 'Bags'   },
      { item: 'Beans',       qty:  13, unit: 'Bags'   },
      { item: 'Cooking Oil', qty:  17, unit: 'Litres' },
    ],
    fraudSummary: { duplicateCards: 1, unknownCards: 2, supplyAnomalies: 1 },
    financial: { gross: 0, policyDeductions: 0, netEligible: 0 },
  },
]

export interface MonthlyBatch {
  id: string
  monthLabel: string
  weekLabels: string[]
  weekIds: string[]
  totalMeals: number
  supplyRecords: number
  fraudCases: number
  netEligibleNum: number
  netEligible: string
  status: 'complete' | 'incomplete'
  studentValidations: number
  supplyLogs: { item: string; qty: number; unit: string }[]
}

export const MONTHLY_BATCHES: MonthlyBatch[] = [
  {
    id: 'jan-2026',
    monthLabel: 'January 2026',
    weekLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    weekIds: ['wk-1', 'wk-2', 'wk-3', 'wk-4'],
    totalMeals: 66840,
    supplyRecords: 112,
    fraudCases: 3,
    netEligibleNum: 1048000,
    netEligible: 'GHS 1,048,000',
    status: 'complete',
    studentValidations: 66840,
    supplyLogs: [
      { item: 'Rice',        qty: 892, unit: 'Bags'   },
      { item: 'Beans',       qty: 138, unit: 'Bags'   },
      { item: 'Cooking Oil', qty: 133, unit: 'Litres' },
    ],
  },
  {
    id: 'feb-2026',
    monthLabel: 'February 2026',
    weekLabels: ['Week 5', 'Week 6', 'Week 7', 'Week 8'],
    weekIds: ['wk-5', 'wk-6', 'wk-7', 'wk-8'],
    totalMeals: 65100,
    supplyRecords: 108,
    fraudCases: 2,
    netEligibleNum: 1021000,
    netEligible: 'GHS 1,021,000',
    status: 'complete',
    studentValidations: 65100,
    supplyLogs: [
      { item: 'Rice',        qty: 870, unit: 'Bags'   },
      { item: 'Beans',       qty: 134, unit: 'Bags'   },
      { item: 'Cooking Oil', qty: 130, unit: 'Litres' },
    ],
  },
]

export interface SemesterPool {
  id: string
  semesterLabel: string
  monthsIncluded: string[]
  currentEligibleNum: number
  currentEligible: string
  studentValidations: number
  supplyLogs: { item: string; qty: number; unit: string }[]
  fraudOverview: { unknownCards: number; duplicateScans: number; supplyAnomalies: number }
  financial: { grossEstimate: number; policyAdjustments: number; netEligible: number }
}

export const SEMESTER_POOL: SemesterPool = {
  id: 'sem1-2026',
  semesterLabel: 'Semester One',
  monthsIncluded: ['January 2026', 'February 2026', 'March 2026 (partial)'],
  currentEligibleNum: 2334200,
  currentEligible: 'GHS 2,334,200',
  studentValidations: 148742,
  supplyLogs: [
    { item: 'Rice',        qty: 1986, unit: 'Bags'   },
    { item: 'Beans',       qty:  307, unit: 'Bags'   },
    { item: 'Cooking Oil', qty:  296, unit: 'Litres' },
  ],
  fraudOverview: { unknownCards: 6, duplicateScans: 8, supplyAnomalies: 1 },
  financial: { grossEstimate: 2365800, policyAdjustments: 31600, netEligible: 2334200 },
}

// Reimbursement breakdown
export const REIMBURSEMENT_BREAKDOWN = [
  { category: 'Breakfast Meals',      basis: '2,352 verified meals',  amount: 'GHS 12,840', type: 'normal' as const },
  { category: 'Lunch Meals',          basis: '2,418 verified meals',  amount: 'GHS 13,950', type: 'normal' as const },
  { category: 'Supper Meals',         basis: '2,469 verified meals',  amount: 'GHS 12,810', type: 'normal' as const },
  { category: 'Operational Supplies', basis: 'Approved consumables',  amount: 'GHS 2,220',  type: 'normal' as const },
  { category: 'Gross Daily Total',    basis: '—',                     amount: 'GHS 41,820', type: 'total' as const },
  { category: 'Policy Cap Adjustment',basis: 'Ceiling exceeded',      amount: '-GHS 3,500', type: 'adjustment' as const },
  { category: 'Net Claimable Total',  basis: '—',                     amount: 'GHS 38,320', type: 'final' as const },
]

// TODO: Supply-to-Claim bridge — shows how each supply item feeds into the reimbursement
// export const SUPPLY_CLAIM_BRIDGE = [
//   { item: 'Rice',           unit: 'Bags',   consumed: 33, unitCost: 'GHS 250',   totalCost: 'GHS 8,250',  mealsSupported: 'Breakfast + Lunch + Dinner', claimImpact: 'GHS 8,250'  },
//   { item: 'Cooking Oil',    unit: 'Litres', consumed: 5,  unitCost: 'GHS 180',   totalCost: 'GHS 900',   mealsSupported: 'Breakfast + Dinner',         claimImpact: 'GHS 900'   },
//   { item: 'Beans',          unit: 'Bags',   consumed: 5,  unitCost: 'GHS 320',   totalCost: 'GHS 1,600', mealsSupported: 'Lunch',                       claimImpact: 'GHS 1,600' },
//   { item: 'Tomato Paste',   unit: 'Cartons',consumed: 4,  unitCost: 'GHS 450',   totalCost: 'GHS 1,800', mealsSupported: 'Lunch + Dinner',              claimImpact: 'GHS 1,800' },
//   { item: 'Maize',          unit: 'Bags',   consumed: 6,  unitCost: 'GHS 200',   totalCost: 'GHS 1,200', mealsSupported: 'Breakfast',                   claimImpact: 'GHS 1,200' },
//   { item: 'Gas Cylinders',  unit: 'Units',  consumed: 2,  unitCost: 'GHS 300',   totalCost: 'GHS 600',   mealsSupported: 'All sessions (cooking fuel)',    claimImpact: 'GHS 600'  },
//   { item: 'Salt',           unit: 'Cartons',consumed: 1,  unitCost: 'GHS 150',   totalCost: 'GHS 150',   mealsSupported: 'All sessions (seasoning)',       claimImpact: 'GHS 150'  },
//   { item: 'Fish (Frozen)',  unit: 'Cartons',consumed: 3,  unitCost: 'GHS 800',   totalCost: 'GHS 2,400', mealsSupported: 'Lunch + Dinner',              claimImpact: 'GHS 2,400' },
// ]

// Attendance session data
export const ATTENDANCE_SESSIONS = [
  { session: 'Breakfast', served: 2352, eligible: 2850, utilization: '82.5%', rate: 'GHS 5.46/student' },
  { session: 'Lunch',     served: 2418, eligible: 2850, utilization: '84.8%', rate: 'GHS 5.77/student' },
  { session: 'Supper',    served: 2469, eligible: 2850, utilization: '86.6%', rate: 'GHS 5.19/student' },
]

// ────────────────────────────────────────────────────────────────────────────────
// 5. SUPPLY INVENTORY
// ────────────────────────────────────────────────────────────────────────────────
export type SupplyStatus = 'normal' | 'low_stock' | 'critical'

export interface MockSupplyLog {
  time: string
  event: string
  type: 'delivery' | 'consumption' | 'adjustment' | 'reorder' | 'reconciliation'
}

export interface MockDelivery {
  id: string
  supplier: string
  item: string
  quantity: string
  deliveredAt: string
  receivedBy: string
  tokenRef?: string
}

export interface MockConsumption {
  id: string
  mealSession: string
  item: string
  quantity: string
  consumedAt: string
  preparedBy: string
  studentsServed: number
}

export interface MockSupplier {
  name: string
  category: string
  contact: string
  totalDelivered: string
  tokensRedeemed: number
  status: 'approved' | 'active' | 'inactive'
}

export interface MockToken {
  code: string
  supplier: string
  value: string
  status: 'pending' | 'verified' | 'redeemed' | 'expired'
  issuedAt: string
}

export interface MockSupply {
  id: string
  item: string
  unit: string
  currentStock: number
  reorderLevel: number
  expectedWeekly: number
  actualWeekly: number
  semesterConsumption: number
  semesterValidations: number
  estimatedGovtExposure: string
  status: SupplyStatus
  lastRestocked: string
  supplier: string
  deliveries: MockDelivery[]
  consumptions: MockConsumption[]
  supplyLogs: MockSupplyLog[]
}

export const MOCK_DELIVERIES: MockDelivery[] = [
  { id: '1', supplier: 'Golden Harvest Foods',  item: 'Rice',         quantity: '500 Bags',   deliveredAt: '14 Mar 2026, 08:15 AM', receivedBy: 'Storekeeper',  tokenRef: 'GOV-SAC-SEM1-001' },
  { id: '2', supplier: 'SunGold Oils',           item: 'Cooking Oil',  quantity: '300 Litres', deliveredAt: '13 Mar 2026, 09:30 AM', receivedBy: 'Storekeeper',  tokenRef: 'GOV-SAC-SEM1-002' },
  { id: '3', supplier: 'Ashanti Agro Supplies',  item: 'Beans',        quantity: '200 Bags',   deliveredAt: '10 Mar 2026, 07:45 AM', receivedBy: 'Storekeeper',  tokenRef: 'GOV-SAC-SEM1-003' },
  { id: '4', supplier: 'FreshFoods Co.',         item: 'Tomato Paste', quantity: '60 Cartons',  deliveredAt: '07 Mar 2026, 10:00 AM', receivedBy: 'Storekeeper' },
  { id: '5', supplier: 'GasPro Ghana',           item: 'Gas Cylinders',quantity: '30 Units',   deliveredAt: '14 Mar 2026, 11:20 AM', receivedBy: 'Storekeeper' },
  { id: '6', supplier: 'National School Foods',  item: 'Maize',        quantity: '120 Bags',   deliveredAt: '08 Mar 2026, 08:00 AM', receivedBy: 'Storekeeper',  tokenRef: 'GOV-SAC-SEM1-004' },
]

export const MOCK_CONSUMPTIONS: MockConsumption[] = [
  { id: '1', mealSession: 'Breakfast', item: 'Rice',        quantity: '10 Bags',   consumedAt: 'Today, 6:30 AM',  preparedBy: 'Kitchen Staff', studentsServed: 1120 },
  { id: '2', mealSession: 'Breakfast', item: 'Cooking Oil', quantity: '2 Litres',  consumedAt: 'Today, 6:30 AM',  preparedBy: 'Kitchen Staff', studentsServed: 1120 },
  { id: '3', mealSession: 'Lunch',     item: 'Rice',        quantity: '12 Bags',   consumedAt: 'Today, 10:45 AM', preparedBy: 'Kitchen Staff', studentsServed: 1187 },
  { id: '4', mealSession: 'Lunch',     item: 'Beans',       quantity: '5 Bags',    consumedAt: 'Today, 10:45 AM', preparedBy: 'Kitchen Staff', studentsServed: 1187 },
  { id: '5', mealSession: 'Dinner',    item: 'Rice',        quantity: '11 Bags',   consumedAt: 'Today, 4:30 PM',  preparedBy: 'Kitchen Staff', studentsServed: 1098 },
  { id: '6', mealSession: 'Dinner',    item: 'Cooking Oil', quantity: '3 Litres',  consumedAt: 'Today, 4:30 PM',  preparedBy: 'Kitchen Staff', studentsServed: 1098 },
]

export const MOCK_SUPPLIERS: MockSupplier[] = [
  { name: 'Golden Harvest Foods',  category: 'Rice',         contact: '+233 24 412 3456', totalDelivered: '2,100 Bags',   tokensRedeemed: 3, status: 'active' },
  { name: 'Ashanti Agro Supplies', category: 'Beans',        contact: '+233 20 789 0123', totalDelivered: '840 Bags',    tokensRedeemed: 2, status: 'active' },
  { name: 'National School Foods', category: 'Cooking Oil',  contact: '+233 55 234 5678', totalDelivered: '420 Litres',  tokensRedeemed: 1, status: 'active' },
  { name: 'Clean Water Ghana',     category: 'Water',        contact: '+233 30 345 6789', totalDelivered: '1,500 Gallons',tokensRedeemed: 1, status: 'approved' },
  { name: 'FreshFoods Co.',        category: 'Tomato Paste', contact: '+233 26 111 2233', totalDelivered: '60 Cartons',  tokensRedeemed: 0, status: 'approved' },
]

export const MOCK_TOKENS: MockToken[] = [
  { code: 'GOV-SAC-SEM1-001', supplier: 'Golden Harvest Foods',  value: 'GHS 420,000', status: 'redeemed',  issuedAt: '10 Jan 2026' },
  { code: 'GOV-SAC-SEM1-002', supplier: 'SunGold Oils',          value: 'GHS 180,000', status: 'verified',  issuedAt: '15 Jan 2026' },
  { code: 'GOV-SAC-SEM1-003', supplier: 'Ashanti Agro Supplies', value: 'GHS 210,000', status: 'pending',   issuedAt: '20 Jan 2026' },
  { code: 'GOV-SAC-SEM1-004', supplier: 'National School Foods', value: 'GHS 95,000',  status: 'verified',  issuedAt: '05 Feb 2026' },
  { code: 'GOV-SAC-SEM1-005', supplier: 'Golden Harvest Foods',  value: 'GHS 620,000', status: 'pending',   issuedAt: '01 Mar 2026' },
]

export const MOCK_SUPPLIES: MockSupply[] = [
  {
    id: '1', item: 'Rice', unit: 'Bags', currentStock: 180, reorderLevel: 100, expectedWeekly: 450, actualWeekly: 420,
    semesterConsumption: 1920, semesterValidations: 232100, estimatedGovtExposure: 'GHS 384,000',
    status: 'normal', lastRestocked: '14 Mar 2026', supplier: 'Golden Harvest Foods',
    deliveries: [{ id: 'd1', supplier: 'Golden Harvest Foods', item: 'Rice', quantity: '500 Bags', deliveredAt: '14 Mar 2026, 08:15 AM', receivedBy: 'Storekeeper', tokenRef: 'GOV-SAC-SEM1-001' }],
    consumptions: [
      { id: 'c1', mealSession: 'Breakfast', item: 'Rice', quantity: '10 Bags', consumedAt: 'Today, 6:30 AM', preparedBy: 'Kitchen Staff', studentsServed: 1120 },
      { id: 'c2', mealSession: 'Lunch',     item: 'Rice', quantity: '12 Bags', consumedAt: 'Today, 10:45 AM', preparedBy: 'Kitchen Staff', studentsServed: 1187 },
      { id: 'c3', mealSession: 'Dinner',    item: 'Rice', quantity: '11 Bags', consumedAt: 'Today, 4:30 PM',  preparedBy: 'Kitchen Staff', studentsServed: 1098 },
    ],
    supplyLogs: [
      { time: '08:10', event: 'Rice delivered — 500 Bags', type: 'delivery' },
      { time: '08:15', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '10:40', event: 'Breakfast preparation — 10 Bags', type: 'consumption' },
      { time: '12:05', event: 'Lunch preparation — 12 Bags', type: 'consumption' },
      { time: '03:10', event: 'Inventory adjustment — -2 Bags (damaged)', type: 'adjustment' },
      { time: '04:20', event: 'Low stock threshold reached — reorder created', type: 'reorder' },
      { time: '06:30', event: 'Supply reconciliation completed', type: 'reconciliation' },
      { time: '08:05', event: 'Daily report updated', type: 'reconciliation' },
    ],
  },
  {
    id: '2', item: 'Cooking Oil', unit: 'Litres', currentStock: 310, reorderLevel: 80, expectedWeekly: 280, actualWeekly: 310,
    semesterConsumption: 1450, semesterValidations: 232100, estimatedGovtExposure: 'GHS 87,000',
    status: 'normal', lastRestocked: '13 Mar 2026', supplier: 'SunGold Oils',
    deliveries: [{ id: 'd2', supplier: 'SunGold Oils', item: 'Cooking Oil', quantity: '300 Litres', deliveredAt: '13 Mar 2026, 09:30 AM', receivedBy: 'Storekeeper', tokenRef: 'GOV-SAC-SEM1-002' }],
    consumptions: [
      { id: 'c4', mealSession: 'Breakfast', item: 'Cooking Oil', quantity: '2 Litres', consumedAt: 'Today, 6:30 AM',  preparedBy: 'Kitchen Staff', studentsServed: 1120 },
      { id: 'c5', mealSession: 'Dinner',    item: 'Cooking Oil', quantity: '3 Litres', consumedAt: 'Today, 4:30 PM',  preparedBy: 'Kitchen Staff', studentsServed: 1098 },
    ],
    supplyLogs: [
      { time: '09:30', event: 'Cooking Oil delivered — 300 Litres', type: 'delivery' },
      { time: '09:35', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '10:40', event: 'Breakfast preparation — 2 Litres', type: 'consumption' },
      { time: '04:30', event: 'Dinner preparation — 3 Litres', type: 'consumption' },
    ],
  },
  {
    id: '3', item: 'Beans', unit: 'Bags', currentStock: 75, reorderLevel: 100, expectedWeekly: 100, actualWeekly: 75,
    semesterConsumption: 840, semesterValidations: 232100, estimatedGovtExposure: 'GHS 168,000',
    status: 'low_stock', lastRestocked: '10 Mar 2026', supplier: 'Ashanti Agro Supplies',
    deliveries: [{ id: 'd3', supplier: 'Ashanti Agro Supplies', item: 'Beans', quantity: '200 Bags', deliveredAt: '10 Mar 2026, 07:45 AM', receivedBy: 'Storekeeper', tokenRef: 'GOV-SAC-SEM1-003' }],
    consumptions: [
      { id: 'c6', mealSession: 'Lunch', item: 'Beans', quantity: '5 Bags', consumedAt: 'Today, 10:45 AM', preparedBy: 'Kitchen Staff', studentsServed: 1187 },
    ],
    supplyLogs: [
      { time: '07:45', event: 'Beans delivered — 200 Bags', type: 'delivery' },
      { time: '07:50', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '12:05', event: 'Lunch preparation — 5 Bags', type: 'consumption' },
      { time: '03:00', event: 'Reorder threshold reached', type: 'reorder' },
    ],
  },
  {
    id: '4', item: 'Tomato Paste', unit: 'Cartons', currentStock: 12, reorderLevel: 20, expectedWeekly: 50, actualWeekly: 48,
    semesterConsumption: 240, semesterValidations: 232100, estimatedGovtExposure: 'GHS 36,000',
    status: 'critical', lastRestocked: '07 Mar 2026', supplier: 'FreshFoods Co.',
    deliveries: [{ id: 'd4', supplier: 'FreshFoods Co.', item: 'Tomato Paste', quantity: '60 Cartons', deliveredAt: '07 Mar 2026, 10:00 AM', receivedBy: 'Storekeeper' }],
    consumptions: [],
    supplyLogs: [
      { time: '10:00', event: 'Tomato Paste delivered — 60 Cartons', type: 'delivery' },
      { time: '10:05', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '02:30', event: 'Critical stock alert triggered', type: 'reorder' },
    ],
  },
  {
    id: '5', item: 'Gas Cylinders', unit: 'Units', currentStock: 45, reorderLevel: 15, expectedWeekly: 20, actualWeekly: 18,
    semesterConsumption: 80, semesterValidations: 232100, estimatedGovtExposure: 'GHS 24,000',
    status: 'normal', lastRestocked: '14 Mar 2026', supplier: 'GasPro Ghana',
    deliveries: [{ id: 'd5', supplier: 'GasPro Ghana', item: 'Gas Cylinders', quantity: '30 Units', deliveredAt: '14 Mar 2026, 11:20 AM', receivedBy: 'Storekeeper' }],
    consumptions: [],
    supplyLogs: [
      { time: '11:20', event: 'Gas Cylinders delivered — 30 Units', type: 'delivery' },
      { time: '11:25', event: 'Storekeeper confirmed receipt', type: 'delivery' },
    ],
  },
  {
    id: '6', item: 'Maize', unit: 'Bags', currentStock: 55, reorderLevel: 50, expectedWeekly: 80, actualWeekly: 72,
    semesterConsumption: 360, semesterValidations: 232100, estimatedGovtExposure: 'GHS 54,000',
    status: 'low_stock', lastRestocked: '08 Mar 2026', supplier: 'National School Foods',
    deliveries: [{ id: 'd6', supplier: 'National School Foods', item: 'Maize', quantity: '120 Bags', deliveredAt: '08 Mar 2026, 08:00 AM', receivedBy: 'Storekeeper', tokenRef: 'GOV-SAC-SEM1-004' }],
    consumptions: [],
    supplyLogs: [
      { time: '08:00', event: 'Maize delivered — 120 Bags', type: 'delivery' },
      { time: '08:05', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '06:00', event: 'Reorder reminder created', type: 'reorder' },
    ],
  },
  {
    id: '7', item: 'Salt', unit: 'Cartons', currentStock: 80, reorderLevel: 25, expectedWeekly: 30, actualWeekly: 28,
    semesterConsumption: 140, semesterValidations: 232100, estimatedGovtExposure: 'GHS 14,000',
    status: 'normal', lastRestocked: '01 Mar 2026', supplier: 'Essentials Ltd',
    deliveries: [{ id: 'd7', supplier: 'Essentials Ltd', item: 'Salt', quantity: '100 Cartons', deliveredAt: '01 Mar 2026, 12:00 PM', receivedBy: 'Storekeeper' }],
    consumptions: [],
    supplyLogs: [
      { time: '12:00', event: 'Salt delivered — 100 Cartons', type: 'delivery' },
      { time: '12:05', event: 'Storekeeper confirmed receipt', type: 'delivery' },
    ],
  },
  {
    id: '8', item: 'Fish (Frozen)', unit: 'Cartons', currentStock: 8, reorderLevel: 15, expectedWeekly: 40, actualWeekly: 42,
    semesterConsumption: 210, semesterValidations: 232100, estimatedGovtExposure: 'GHS 63,000',
    status: 'critical', lastRestocked: '05 Mar 2026', supplier: 'ColdChain Fisheries',
    deliveries: [{ id: 'd8', supplier: 'ColdChain Fisheries', item: 'Fish (Frozen)', quantity: '50 Cartons', deliveredAt: '05 Mar 2026, 06:00 AM', receivedBy: 'Storekeeper' }],
    consumptions: [],
    supplyLogs: [
      { time: '06:00', event: 'Frozen Fish delivered — 50 Cartons', type: 'delivery' },
      { time: '06:05', event: 'Storekeeper confirmed receipt', type: 'delivery' },
      { time: '05:20', event: 'Critical stock — immediate reorder needed', type: 'reorder' },
    ],
  },
]

// ────────────────────────────────────────────────────────────────────────────────
// 6. FRAUD ALERTS
// ────────────────────────────────────────────────────────────────────────────────
export type SeverityLevel = 'critical' | 'high' | 'medium'
export type AlertCategory = 'Dining Hall' | 'Supply' | 'Enrollment' | 'Card' | 'Financial'

export interface MockFraudAlert {
  id: string
  alertId: string
  category: AlertCategory
  title: string
  description: string
  severity: SeverityLevel
  detectedAt: string
  status: 'open' | 'investigating' | 'resolved'
  affectedStudents: number
  potentialExposure: string
  assignedTo: string
}

export const MOCK_FRAUD_ALERTS: MockFraudAlert[] = [
  {
    id: '1',
    alertId: 'FRA-2026-001',
    category: 'Dining Hall',
    title: 'Unknown card scanned at Annex Refectory',
    description: 'A card not registered in the system was scanned three times during lunch session at the Annex Refectory.',
    severity: 'critical',
    detectedAt: 'Today, 12:40 PM',
    status: 'open',
    affectedStudents: 0,
    potentialExposure: 'GHS 17.31',
    assignedTo: 'Compliance Officer',
  },
  {
    id: '2',
    alertId: 'FRA-2026-002',
    category: 'Supply',
    title: 'Rice usage 22% above benchmark',
    description: 'Daily rice consumption exceeded operational ceiling by 22%. Variance of 30 bags detected.',
    severity: 'high',
    detectedAt: 'Today, 8:03 PM',
    status: 'investigating',
    affectedStudents: 0,
    potentialExposure: 'GHS 6,500',
    assignedTo: 'Storekeeper',
  },
  {
    id: '3',
    alertId: 'FRA-2026-003',
    category: 'Enrollment',
    title: 'Duplicate active student records detected',
    description: 'Two active profiles share the same BECE number (BECE-2024-GH-03921). Possible duplicate enrollment.',
    severity: 'high',
    detectedAt: '14 Mar 2026, 10:15 AM',
    status: 'investigating',
    affectedStudents: 1,
    potentialExposure: 'GHS 1,800',
    assignedTo: 'Admissions Officer',
  },
  {
    id: '4',
    alertId: 'FRA-2026-004',
    category: 'Dining Hall',
    title: 'Attendance spike: 280 scans in 5 minutes',
    description: 'Main Refectory recorded an unusual burst of 280 validations within a 5-minute window during breakfast.',
    severity: 'critical',
    detectedAt: 'Today, 7:20 AM',
    status: 'open',
    affectedStudents: 0,
    potentialExposure: 'GHS 1,528',
    assignedTo: 'Dining Supervisor',
  },
  {
    id: '5',
    alertId: 'FRA-2026-005',
    category: 'Card',
    title: 'Suspended card used at Main Refectory',
    description: 'Card CARD-0004828 (Akua Serwaa) was presented at Main Refectory dinner session. Card is suspended.',
    severity: 'high',
    detectedAt: 'Today, 6:30 PM',
    status: 'open',
    affectedStudents: 1,
    potentialExposure: 'GHS 5.77',
    assignedTo: 'Card Officer',
  },
  {
    id: '6',
    alertId: 'FRA-2026-006',
    category: 'Financial',
    title: 'Policy adjustment exceeds daily threshold',
    description: 'Cumulative policy adjustments (-GHS 3,500) have exceeded the daily allowance of GHS 3,000.',
    severity: 'medium',
    detectedAt: 'Today, 8:07 PM',
    status: 'investigating',
    affectedStudents: 0,
    potentialExposure: 'GHS 500',
    assignedTo: 'School Administrator',
  },
  {
    id: '7',
    alertId: 'FRA-2026-007',
    category: 'Supply',
    title: 'Cooking oil consumption exceeds procurement',
    description: 'Actual oil usage (310 litres) exceeds the procurement threshold. Possible miscount or pilferage.',
    severity: 'medium',
    detectedAt: 'Today, 8:03 PM',
    status: 'investigating',
    affectedStudents: 0,
    potentialExposure: 'GHS 1,200',
    assignedTo: 'Storekeeper',
  },
]

// ────────────────────────────────────────────────────────────────────────────────
// 7. REIMBURSEMENT CLAIMS
// ────────────────────────────────────────────────────────────────────────────────
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'partial'

export interface MockClaim {
  id: string
  claimId: string
  reportIds: string[]
  institutionName: string
  semester: string
  amountClaimed: string
  amountApproved: string | null
  status: ClaimStatus
  submittedAt: string
  verifiedBy: string | null
  notes: string
}

export const MOCK_CLAIMS: MockClaim[] = [
  {
    id: '1',
    claimId: 'CLM-2026-S1-001',
    reportIds: ['DR-2026-0314', 'DR-2026-0311', 'DR-2026-0309'],
    institutionName: 'St. Augustine SHS',
    semester: 'Semester 1, 2026',
    amountClaimed: 'GHS 114,680',
    amountApproved: null,
    status: 'pending',
    submittedAt: '15 Mar 2026',
    verifiedBy: null,
    notes: 'Accumulated from 3 claim-eligible daily reports.',
  },
  {
    id: '2',
    claimId: 'CLM-2025-S2-005',
    reportIds: ['DR-2025-0120...DR-2025-0180'],
    institutionName: 'St. Augustine SHS',
    semester: 'Semester 2, 2025',
    amountClaimed: 'GHS 1,765,000',
    amountApproved: 'GHS 1,720,500',
    status: 'approved',
    submittedAt: '15 Dec 2025',
    verifiedBy: 'Gov. Auditor',
    notes: 'Approved after government verification. Supplier tokens issued.',
  },
  {
    id: '3',
    claimId: 'CLM-2026-S1-002',
    reportIds: ['DR-2026-0308...DR-2026-0310'],
    institutionName: 'St. Augustine SHS',
    semester: 'Semester 1, 2026',
    amountClaimed: 'GHS 41,200',
    amountApproved: 'GHS 39,400',
    status: 'partial',
    submittedAt: '10 Mar 2026',
    verifiedBy: 'Gov. Auditor',
    notes: 'Partially approved — GHS 1,800 deducted due to duplicate scan patterns.',
  },
]

// ────────────────────────────────────────────────────────────────────────────────
// 8. ENROLLMENT SIDEBAR — Multi-step form data
// ────────────────────────────────────────────────────────────────────────────────
export const ENROLLMENT_STEPS = [
  { step: 1, label: 'Student Lookup',        description: 'Verify against GES database' },
  { step: 2, label: 'Academic Assignment',    description: 'Form, Programme, Class, House' },
  { step: 3, label: 'Card Generation',        description: 'Auto-generate validation card with QR' },
  { step: 4, label: 'Student Activation',     description: 'Finalize enrollment' },
]

// ────────────────────────────────────────────────────────────────────────────────
// Helper: get badge variant map by module
// ────────────────────────────────────────────────────────────────────────────────
export type BadgeTone = 'green' | 'orange' | 'red' | 'blue' | 'gray'

export const STUDENT_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  active:    { label: 'Active',    variant: 'green' },
  pending:   { label: 'Pending',   variant: 'orange' },
  suspended: { label: 'Suspended', variant: 'red' },
  inactive:  { label: 'Inactive',  variant: 'gray' },
}

export const CARD_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  issued:      { label: 'Issued',      variant: 'green' },
  pending:     { label: 'Pending',     variant: 'orange' },
  suspended:   { label: 'Suspended',   variant: 'red' },
  deactivated: { label: 'Deactivated', variant: 'gray' },
}

export const VALIDATION_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  served:           { label: 'Served',           variant: 'green' },
  duplicate:        { label: 'Duplicate',        variant: 'orange' },
  flagged:          { label: 'Flagged',          variant: 'red' },
  invalid_card:     { label: 'Invalid Card',     variant: 'red' },
  inactive_student: { label: 'Inactive Student', variant: 'gray' },
}

export const REPORT_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  analyzing: { label: 'Auto-Analyzing', variant: 'orange' },
  approved:  { label: 'Approved',       variant: 'green' },
  locked:    { label: 'Locked',         variant: 'blue' },
  eligible:  { label: 'Claim Eligible', variant: 'green' },
}

export const SUPPLY_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  normal:    { label: 'Normal',    variant: 'green' },
  low_stock: { label: 'Low Stock', variant: 'orange' },
  critical:  { label: 'Critical',  variant: 'red' },
}

export const SEVERITY_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  critical: { label: 'Critical', variant: 'red' },
  high:     { label: 'High',     variant: 'orange' },
  medium:   { label: 'Medium',   variant: 'gray' },
}

export const CLAIM_STATUS_MAP: Record<string, { label: string; variant: BadgeTone }> = {
  pending:  { label: 'Pending',  variant: 'orange' },
  approved: { label: 'Approved', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
  partial:  { label: 'Partial',  variant: 'blue' },
}

// ────────────────────────────────────────────────────────────────────────────────
// 9. GOV PORTAL — Cross-institution token and claim registry
//    These tie back to MOCK_TOKENS: GOV-SAC-SEM1-001 through 005 are the same
//    tokens as in the school-admin supply view. Other schools share the universe.
// ────────────────────────────────────────────────────────────────────────────────

// Full national token ledger (Gov IssueTokens + TokenLedger pages)
export const GOV_ALL_TOKENS: GovernmentToken[] = [
  // St. Augustine College, Kumasi — 2025/2026 Semester 1
  { id: '1',  tokenCode: 'GOV-SAC-SEM1-001', supplierId: 'SUP-001', supplierName: 'Golden Harvest Foods',  institutionName: 'St. Augustine College', value: 420000, issuedDate: '2026-01-10', expiryDate: '2026-07-10', status: 'redeemed' },
  { id: '2',  tokenCode: 'GOV-SAC-SEM1-002', supplierId: 'SUP-002', supplierName: 'SunGold Oils',          institutionName: 'St. Augustine College', value: 180000, issuedDate: '2026-01-15', expiryDate: '2026-07-15', status: 'active'   },
  { id: '3',  tokenCode: 'GOV-SAC-SEM1-003', supplierId: 'SUP-003', supplierName: 'Ashanti Agro Supplies', institutionName: 'St. Augustine College', value: 210000, issuedDate: '2026-01-20', expiryDate: '2026-07-20', status: 'rejected' },
  { id: '4',  tokenCode: 'GOV-SAC-SEM1-004', supplierId: 'SUP-004', supplierName: 'National School Foods', institutionName: 'St. Augustine College', value:  95000, issuedDate: '2026-02-05', expiryDate: '2026-08-05', status: 'active'   },
  { id: '5',  tokenCode: 'GOV-SAC-SEM1-005', supplierId: 'SUP-001', supplierName: 'Golden Harvest Foods',  institutionName: 'St. Augustine College', value: 620000, issuedDate: '2026-03-01', expiryDate: '2026-09-01', status: 'pending'  },
  // Opoku Ware SHS, Kumasi
  { id: '6',  tokenCode: 'GOV-OWS-SEM1-001', supplierId: 'SUP-005', supplierName: 'Ghana Foods Co.',       institutionName: 'Opoku Ware SHS',         value: 396000, issuedDate: '2026-01-08', expiryDate: '2026-07-08', status: 'redeemed' },
  { id: '7',  tokenCode: 'GOV-OWS-SEM1-002', supplierId: 'SUP-006', supplierName: 'Northern Foods Ltd',    institutionName: 'Opoku Ware SHS',         value: 215000, issuedDate: '2026-02-12', expiryDate: '2026-08-12', status: 'active'   },
  // Mfantsipim SHS, Cape Coast
  { id: '8',  tokenCode: 'GOV-MFS-SEM1-001', supplierId: 'SUP-007', supplierName: 'Fresh Mart Ltd',        institutionName: 'Mfantsipim SHS',         value: 287500, issuedDate: '2026-01-18', expiryDate: '2026-07-18', status: 'pending'  },
  // Wesley Girls High School, Cape Coast
  { id: '9',  tokenCode: 'GOV-WGS-SEM1-001', supplierId: 'SUP-005', supplierName: 'Ghana Foods Co.',       institutionName: 'Wesley Girls SHS',       value: 215000, issuedDate: '2026-01-22', expiryDate: '2026-07-22', status: 'active'   },
  // Achimota SHS — expired prior-semester token
  { id: '10', tokenCode: 'GOV-ACH-SEM2-001', supplierId: 'SUP-006', supplierName: 'Northern Foods Ltd',    institutionName: 'Achimota SHS',           value: 178000, issuedDate: '2025-09-01', expiryDate: '2026-03-01', status: 'expired'  },
]

// Gov Overview — multi-institution claims summary
export interface GovClaim {
  id: string
  institution: string
  claimed: number
  approved: number | null
  status: 'approved' | 'pending' | 'flagged'
}

export const GOV_CLAIMS: GovClaim[] = [
  // SAC claim = DR-0314 (37,910) + DR-0311 (37,950) + DR-0309 (37,850) = 113,710
  { id: '1', institution: 'St. Augustine College', claimed: 113710, approved: null,   status: 'pending'  },
  { id: '2', institution: 'Opoku Ware SHS',         claimed: 396000, approved: 388000, status: 'approved' },
  { id: '3', institution: 'Mfantsipim SHS',          claimed: 287500, approved: null,   status: 'flagged'  },
  { id: '4', institution: 'Wesley Girls SHS',        claimed: 215000, approved: 210000, status: 'approved' },
  { id: '5', institution: 'Achimota SHS',            claimed: 178000, approved: null,   status: 'pending'  },
]

// Gov Overview — 3 most recently issued tokens
export interface GovOverviewToken {
  id: string   // token code used as display ID
  amount: number
  supplier: string
  institution: string
  status: 'redeemed' | 'active' | 'held'
}

export const GOV_RECENT_TOKENS: GovOverviewToken[] = [
  // 'held' = issued but not yet submitted to bank (matches MOCK_TOKENS pending status)
  { id: 'GOV-SAC-SEM1-005', amount: 620000, supplier: 'Golden Harvest Foods',  institution: 'St. Augustine College', status: 'held'     },
  { id: 'GOV-SAC-SEM1-002', amount: 180000, supplier: 'SunGold Oils',          institution: 'St. Augustine College', status: 'active'   },
  { id: 'GOV-SAC-SEM1-001', amount: 420000, supplier: 'Golden Harvest Foods',  institution: 'St. Augustine College', status: 'redeemed' },
]

// Gov Reimbursements page — full claim list across all institutions
export const GOV_REIMBURSEMENTS: (ReimbursementClaim & { institution: string; period: string })[] = [
  { id: 'CLM-2026-S1-001', reportId: 'DR-0314, DR-0311, DR-0309', institutionName: 'St. Augustine College', institution: 'St. Augustine College', amountClaimed:  113710, amountApproved:  null,    status: 'pending',  submittedAt: '2026-03-15', period: 'Sem 1, 2026' },
  { id: 'CLM-2026-S1-002', reportId: 'DR-0308, DR-0309, DR-0310', institutionName: 'St. Augustine College', institution: 'St. Augustine College', amountClaimed:   41200, amountApproved:  39400,   status: 'partial',  submittedAt: '2026-03-10', period: 'Sem 1, 2026' },
  { id: 'CLM-2025-S2-005', reportId: 'DR-2025-0120..0180',        institutionName: 'St. Augustine College', institution: 'St. Augustine College', amountClaimed: 1765000, amountApproved: 1720500,  status: 'approved', submittedAt: '2025-12-15', period: 'Sem 2, 2025' },
  { id: 'CLM-2026-S1-011', reportId: 'OWS-DR-0315..0309',         institutionName: 'Opoku Ware SHS',         institution: 'Opoku Ware SHS',         amountClaimed:  396000, amountApproved:  388000,  status: 'approved', submittedAt: '2026-03-12', period: 'Sem 1, 2026' },
  { id: 'CLM-2026-S1-012', reportId: 'MFS-DR-0314..0310',         institutionName: 'Mfantsipim SHS',          institution: 'Mfantsipim SHS',          amountClaimed:  287500, amountApproved:  null,    status: 'pending',  submittedAt: '2026-03-14', period: 'Sem 1, 2026' },
  { id: 'CLM-2026-S1-013', reportId: 'WGS-DR-0311..0309',         institutionName: 'Wesley Girls SHS',       institution: 'Wesley Girls SHS',       amountClaimed:  215000, amountApproved:  null,    status: 'rejected', submittedAt: '2026-03-11', period: 'Sem 1, 2026' },
  { id: 'CLM-2026-S1-014', reportId: 'ACH-DR-0310..0308',         institutionName: 'Achimota SHS',           institution: 'Achimota SHS',           amountClaimed:  178000, amountApproved:  175500,  status: 'approved', submittedAt: '2026-03-08', period: 'Sem 1, 2026' },
  { id: 'CLM-2025-S2-008', reportId: 'MFS-2025-0080..0060',       institutionName: 'Mfantsipim SHS',          institution: 'Mfantsipim SHS',          amountClaimed: 1450000, amountApproved:  null,    status: 'rejected', submittedAt: '2025-12-20', period: 'Sem 2, 2025' },
]

// ── School profiles for the gov school-detail page ───────────────────────────
export interface GovSchoolSupplier {
  name: string
  category: string
  items: string[]
  tokenCode: string
  tokenValue: number
  tokenStatus: 'active' | 'pending' | 'redeemed' | 'none'
}

export interface GovSupplyRequest {
  item: string
  qty: string
  requestedBy: string
  requestedAt: string
  requiredBy: string
  status: 'pending' | 'approved' | 'delivered'
}

export interface GovSchoolValidation {
  date: string
  mealsServed: number
  fraudAlerts: number
  riskScore: number
  stage: 'generated' | 'operational_review' | 'compliance_review' | 'claim_eligible'
}

export interface GovSchoolProfile {
  id: string
  name: string
  region: string
  enrolled: number
  mealsValidated: number
  attendancePct: number
  claimStatus: 'pending' | 'approved' | 'flagged'
  claimedAmount: number
  approvedAmount: number | null
  suppliers: GovSchoolSupplier[]
  supplyRequests: GovSupplyRequest[]
  tokenRecommendation: {
    validatedMeals: number
    avgSupplyCostPerMeal: number
    grossSupplyCost: number
    fraudDeductions: number
    netRecommended: number
    alreadyIssued: number
    remainingAllowance: number
  }
  recentValidations: GovSchoolValidation[]
}

export const GOV_SCHOOL_PROFILES: GovSchoolProfile[] = [
  {
    id: 'sac',
    name: 'St. Augustine College',
    region: 'Ashanti',
    enrolled: 2845,
    mealsValidated: 144820,
    attendancePct: 89,
    claimStatus: 'pending',
    claimedAmount: 113710,
    approvedAmount: null,
    suppliers: [
      { name: 'Golden Harvest Foods',  category: 'Staples',   items: ['Rice', 'Maize', 'Beans'],     tokenCode: 'GOV-SAC-SEM1-005', tokenValue: 620000, tokenStatus: 'pending'  },
      { name: 'SunGold Oils',          category: 'Oils',      items: ['Cooking Oil', 'Palm Oil'],    tokenCode: 'GOV-SAC-SEM1-002', tokenValue: 180000, tokenStatus: 'active'   },
      { name: 'National School Foods', category: 'Proteins',  items: ['Fish (Frozen)', 'Tomato Paste'], tokenCode: 'GOV-SAC-SEM1-004', tokenValue: 95000,  tokenStatus: 'active'   },
    ],
    supplyRequests: [
      { item: 'Rice',         qty: '200 Bags', requestedBy: 'Mr. Kojo Asante (Storekeeper)', requestedAt: '12 Mar 2026', requiredBy: '20 Mar 2026', status: 'approved'  },
      { item: 'Cooking Oil',  qty: '80 Litres', requestedBy: 'Mr. Kojo Asante (Storekeeper)', requestedAt: '12 Mar 2026', requiredBy: '20 Mar 2026', status: 'delivered' },
      { item: 'Fish (Frozen)',qty: '60 Cartons', requestedBy: 'Mr. Kojo Asante (Storekeeper)', requestedAt: '14 Mar 2026', requiredBy: '22 Mar 2026', status: 'pending'   },
    ],
    tokenRecommendation: {
      validatedMeals:      144820,
      avgSupplyCostPerMeal: 0.64,
      grossSupplyCost:     92685,
      fraudDeductions:      2800,
      netRecommended:      89885,
      alreadyIssued:       895000,
      remainingAllowance:  630000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 2413, fraudAlerts: 3, riskScore: 58, stage: 'generated'          },
      { date: '14 Mar 2026', mealsServed: 2350, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '13 Mar 2026', mealsServed: 2355, fraudAlerts: 1, riskScore:  8, stage: 'claim_eligible'     },
      { date: '12 Mar 2026', mealsServed: 2360, fraudAlerts: 2, riskScore: 62, stage: 'compliance_review'  },
      { date: '11 Mar 2026', mealsServed: 2380, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '10 Mar 2026', mealsServed: 2105, fraudAlerts: 7, riskScore: 85, stage: 'operational_review' },
      { date: '09 Mar 2026', mealsServed: 2345, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
    ],
  },
  {
    id: 'ows',
    name: 'Opoku Ware SHS',
    region: 'Ashanti',
    enrolled: 4200,
    mealsValidated: 217800,
    attendancePct: 95,
    claimStatus: 'approved',
    claimedAmount: 396000,
    approvedAmount: 388000,
    suppliers: [
      { name: 'Ghana Foods Co.',    category: 'Staples',  items: ['Rice', 'Beans', 'Maize'], tokenCode: 'GOV-OWS-SEM1-001', tokenValue: 396000, tokenStatus: 'redeemed' },
      { name: 'Northern Foods Ltd', category: 'Proteins', items: ['Fish', 'Tomato Paste'],   tokenCode: 'GOV-OWS-SEM1-002', tokenValue: 215000, tokenStatus: 'active'   },
    ],
    supplyRequests: [
      { item: 'Rice',    qty: '300 Bags',  requestedBy: 'Maame Ama Osei (Storekeeper)', requestedAt: '10 Mar 2026', requiredBy: '18 Mar 2026', status: 'delivered' },
      { item: 'Beans',   qty: '80 Bags',   requestedBy: 'Maame Ama Osei (Storekeeper)', requestedAt: '10 Mar 2026', requiredBy: '18 Mar 2026', status: 'delivered' },
      { item: 'Fish',    qty: '100 Cartons',requestedBy: 'Maame Ama Osei (Storekeeper)', requestedAt: '13 Mar 2026', requiredBy: '22 Mar 2026', status: 'approved'  },
    ],
    tokenRecommendation: {
      validatedMeals:      217800,
      avgSupplyCostPerMeal: 0.70,
      grossSupplyCost:     152460,
      fraudDeductions:          0,
      netRecommended:      152460,
      alreadyIssued:       611000,
      remainingAllowance:  100000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 3980, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
      { date: '14 Mar 2026', mealsServed: 4010, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
      { date: '13 Mar 2026', mealsServed: 3940, fraudAlerts: 1, riskScore: 18, stage: 'claim_eligible'    },
      { date: '12 Mar 2026', mealsServed: 4050, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
      { date: '11 Mar 2026', mealsServed: 3920, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
      { date: '10 Mar 2026', mealsServed: 3900, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
      { date: '09 Mar 2026', mealsServed: 3960, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'    },
    ],
  },
  {
    id: 'mfs',
    name: 'Mfantsipim SHS',
    region: 'Central',
    enrolled: 2800,
    mealsValidated: 103040,
    attendancePct: 78,
    claimStatus: 'flagged',
    claimedAmount: 287500,
    approvedAmount: null,
    suppliers: [
      { name: 'Fresh Mart Ltd', category: 'Staples', items: ['Rice', 'Cooking Oil', 'Beans'], tokenCode: 'GOV-MFS-SEM1-001', tokenValue: 287500, tokenStatus: 'pending' },
    ],
    supplyRequests: [
      { item: 'Rice',        qty: '180 Bags',  requestedBy: 'Kwesi Asante (Storekeeper)', requestedAt: '08 Mar 2026', requiredBy: '16 Mar 2026', status: 'pending'  },
      { item: 'Cooking Oil', qty: '60 Litres', requestedBy: 'Kwesi Asante (Storekeeper)', requestedAt: '08 Mar 2026', requiredBy: '16 Mar 2026', status: 'approved' },
    ],
    tokenRecommendation: {
      validatedMeals:      103040,
      avgSupplyCostPerMeal: 0.62,
      grossSupplyCost:      63885,
      fraudDeductions:       8400,
      netRecommended:       55485,
      alreadyIssued:        287500,
      remainingAllowance:       0,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 1820, fraudAlerts: 4, riskScore: 74, stage: 'compliance_review'  },
      { date: '14 Mar 2026', mealsServed: 1760, fraudAlerts: 2, riskScore: 52, stage: 'compliance_review'  },
      { date: '13 Mar 2026', mealsServed: 1800, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '12 Mar 2026', mealsServed: 1780, fraudAlerts: 1, riskScore: 29, stage: 'operational_review' },
      { date: '11 Mar 2026', mealsServed: 1750, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '10 Mar 2026', mealsServed: 1690, fraudAlerts: 6, riskScore: 88, stage: 'operational_review' },
      { date: '09 Mar 2026', mealsServed: 1770, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
    ],
  },
  {
    id: 'wgs',
    name: 'Wesley Girls SHS',
    region: 'Eastern',
    enrolled: 2200,
    mealsValidated: 120120,
    attendancePct: 91,
    claimStatus: 'approved',
    claimedAmount: 215000,
    approvedAmount: 210000,
    suppliers: [
      { name: 'Ghana Foods Co.', category: 'Staples', items: ['Rice', 'Beans', 'Maize', 'Cooking Oil'], tokenCode: 'GOV-WGS-SEM1-001', tokenValue: 215000, tokenStatus: 'active' },
    ],
    supplyRequests: [
      { item: 'Rice',    qty: '150 Bags', requestedBy: 'Ama Mensah (Storekeeper)', requestedAt: '11 Mar 2026', requiredBy: '19 Mar 2026', status: 'delivered' },
      { item: 'Maize',   qty: '50 Bags',  requestedBy: 'Ama Mensah (Storekeeper)', requestedAt: '14 Mar 2026', requiredBy: '22 Mar 2026', status: 'approved'  },
    ],
    tokenRecommendation: {
      validatedMeals:      120120,
      avgSupplyCostPerMeal: 0.67,
      grossSupplyCost:      80480,
      fraudDeductions:          0,
      netRecommended:       80480,
      alreadyIssued:        215000,
      remainingAllowance:    40000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 2030, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
      { date: '14 Mar 2026', mealsServed: 2010, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
      { date: '13 Mar 2026', mealsServed: 2050, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
      { date: '12 Mar 2026', mealsServed: 1990, fraudAlerts: 1, riskScore: 15, stage: 'claim_eligible'  },
      { date: '11 Mar 2026', mealsServed: 2020, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
      { date: '10 Mar 2026', mealsServed: 2000, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
      { date: '09 Mar 2026', mealsServed: 2040, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'  },
    ],
  },
  {
    id: 'ach',
    name: 'Achimota SHS',
    region: 'Greater Accra',
    enrolled: 3850,
    mealsValidated: 177100,
    attendancePct: 92,
    claimStatus: 'pending',
    claimedAmount: 178000,
    approvedAmount: null,
    suppliers: [
      { name: 'Northern Foods Ltd', category: 'Staples', items: ['Rice', 'Beans', 'Maize'], tokenCode: 'GOV-ACH-SEM2-001', tokenValue: 178000, tokenStatus: 'active' },
    ],
    supplyRequests: [
      { item: 'Rice',  qty: '250 Bags', requestedBy: 'Kofi Darko (Storekeeper)', requestedAt: '13 Mar 2026', requiredBy: '21 Mar 2026', status: 'pending'  },
      { item: 'Beans', qty: '70 Bags',  requestedBy: 'Kofi Darko (Storekeeper)', requestedAt: '13 Mar 2026', requiredBy: '21 Mar 2026', status: 'approved' },
    ],
    tokenRecommendation: {
      validatedMeals:      177100,
      avgSupplyCostPerMeal: 0.68,
      grossSupplyCost:     120428,
      fraudDeductions:       1200,
      netRecommended:      119228,
      alreadyIssued:        178000,
      remainingAllowance:   80000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 3540, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '14 Mar 2026', mealsServed: 3480, fraudAlerts: 1, riskScore: 22, stage: 'operational_review' },
      { date: '13 Mar 2026', mealsServed: 3520, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '12 Mar 2026', mealsServed: 3500, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '11 Mar 2026', mealsServed: 3460, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '10 Mar 2026', mealsServed: 3510, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '09 Mar 2026', mealsServed: 3490, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
    ],
  },
  {
    id: 'tsh',
    name: 'Tamale SHS',
    region: 'Northern',
    enrolled: 1850,
    mealsValidated: 58480,
    attendancePct: 56,
    claimStatus: 'flagged',
    claimedAmount: 98000,
    approvedAmount: null,
    suppliers: [
      { name: 'Northern Foods Ltd', category: 'Staples', items: ['Maize', 'Beans', 'Rice'], tokenCode: '', tokenValue: 0, tokenStatus: 'none' },
    ],
    supplyRequests: [
      { item: 'Maize', qty: '100 Bags', requestedBy: 'Ibrahim Seidu (Storekeeper)', requestedAt: '10 Mar 2026', requiredBy: '20 Mar 2026', status: 'pending' },
      { item: 'Beans', qty: '40 Bags',  requestedBy: 'Ibrahim Seidu (Storekeeper)', requestedAt: '10 Mar 2026', requiredBy: '20 Mar 2026', status: 'pending' },
    ],
    tokenRecommendation: {
      validatedMeals:       58480,
      avgSupplyCostPerMeal:  0.58,
      grossSupplyCost:      33918,
      fraudDeductions:      12000,
      netRecommended:       21918,
      alreadyIssued:            0,
      remainingAllowance:   21918,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 980,  fraudAlerts: 5, riskScore: 82, stage: 'compliance_review'  },
      { date: '14 Mar 2026', mealsServed: 1010, fraudAlerts: 3, riskScore: 66, stage: 'compliance_review'  },
      { date: '13 Mar 2026', mealsServed: 920,  fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '12 Mar 2026', mealsServed: 960,  fraudAlerts: 4, riskScore: 79, stage: 'operational_review' },
      { date: '11 Mar 2026', mealsServed: 1050, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '10 Mar 2026', mealsServed: 880,  fraudAlerts: 8, riskScore: 91, stage: 'operational_review' },
      { date: '09 Mar 2026', mealsServed: 990,  fraudAlerts: 1, riskScore: 24, stage: 'claim_eligible'     },
    ],
  },
  {
    id: 'sush',
    name: 'Sunyani SHS',
    region: 'Brong-Ahafo',
    enrolled: 1450,
    mealsValidated: 79170,
    attendancePct: 91,
    claimStatus: 'approved',
    claimedAmount: 124000,
    approvedAmount: 121500,
    suppliers: [
      { name: 'Ghana Foods Co.', category: 'Staples', items: ['Rice', 'Beans', 'Cooking Oil'], tokenCode: 'GOV-SUS-SEM1-001', tokenValue: 124000, tokenStatus: 'redeemed' },
    ],
    supplyRequests: [
      { item: 'Rice',  qty: '110 Bags', requestedBy: 'Yaa Boateng (Storekeeper)', requestedAt: '12 Mar 2026', requiredBy: '20 Mar 2026', status: 'delivered' },
      { item: 'Beans', qty: '40 Bags',  requestedBy: 'Yaa Boateng (Storekeeper)', requestedAt: '14 Mar 2026', requiredBy: '22 Mar 2026', status: 'approved'  },
    ],
    tokenRecommendation: {
      validatedMeals:       79170,
      avgSupplyCostPerMeal:  0.63,
      grossSupplyCost:      49877,
      fraudDeductions:          0,
      netRecommended:       49877,
      alreadyIssued:        124000,
      remainingAllowance:   20000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 1320, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
      { date: '14 Mar 2026', mealsServed: 1310, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
      { date: '13 Mar 2026', mealsServed: 1325, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
      { date: '12 Mar 2026', mealsServed: 1300, fraudAlerts: 1, riskScore: 12, stage: 'claim_eligible' },
      { date: '11 Mar 2026', mealsServed: 1315, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
      { date: '10 Mar 2026', mealsServed: 1340, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
      { date: '09 Mar 2026', mealsServed: 1330, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible' },
    ],
  },
  {
    id: 'tark',
    name: 'Tarkwa SHS',
    region: 'Western',
    enrolled: 1120,
    mealsValidated: 52416,
    attendancePct: 78,
    claimStatus: 'pending',
    claimedAmount: 87200,
    approvedAmount: null,
    suppliers: [
      { name: 'Fresh Mart Ltd', category: 'Staples', items: ['Rice', 'Cooking Oil', 'Fish'], tokenCode: 'GOV-TAR-SEM1-001', tokenValue: 87200, tokenStatus: 'pending' },
    ],
    supplyRequests: [
      { item: 'Rice',   qty: '80 Bags',  requestedBy: 'Ebo Mensah (Storekeeper)', requestedAt: '11 Mar 2026', requiredBy: '19 Mar 2026', status: 'approved' },
      { item: 'Fish',   qty: '30 Cartons',requestedBy: 'Ebo Mensah (Storekeeper)', requestedAt: '14 Mar 2026', requiredBy: '23 Mar 2026', status: 'pending'  },
    ],
    tokenRecommendation: {
      validatedMeals:       52416,
      avgSupplyCostPerMeal:  0.61,
      grossSupplyCost:      31974,
      fraudDeductions:       1800,
      netRecommended:       30174,
      alreadyIssued:         87200,
      remainingAllowance:    15000,
    },
    recentValidations: [
      { date: '15 Mar 2026', mealsServed: 880, fraudAlerts: 1, riskScore: 28, stage: 'operational_review' },
      { date: '14 Mar 2026', mealsServed: 870, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '13 Mar 2026', mealsServed: 890, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '12 Mar 2026', mealsServed: 860, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '11 Mar 2026', mealsServed: 875, fraudAlerts: 2, riskScore: 41, stage: 'claim_eligible'     },
      { date: '10 Mar 2026', mealsServed: 865, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
      { date: '09 Mar 2026', mealsServed: 855, fraudAlerts: 0, riskScore:  0, stage: 'claim_eligible'     },
    ],
  },
]

// Institution + Supplier picklists for the "Issue Token" form
export const GOV_INSTITUTIONS = [
  'St. Augustine College',
  'Opoku Ware SHS',
  'Mfantsipim SHS',
  'Wesley Girls SHS',
  'Achimota SHS',
  'Tamale SHS',
  'Sunyani SHS',
  'Tarkwa SHS',
]

export const GOV_SUPPLIERS = [
  'Golden Harvest Foods',
  'SunGold Oils',
  'Ashanti Agro Supplies',
  'National School Foods',
  'Ghana Foods Co.',
  'Northern Foods Ltd',
  'Fresh Mart Ltd',
]

// ────────────────────────────────────────────────────────────────────────────────
// 10. BANK PORTAL — Token validation and cash release
// ────────────────────────────────────────────────────────────────────────────────

// Shared transaction ledger — used by both bank and supplier portals.
// Token codes match GOV_ALL_TOKENS and MOCK_TOKENS exactly.
export const BANK_TRANSACTIONS: BankTransaction[] = [
  { id: 'BTX-001', tokenId: '1', tokenCode: 'GOV-SAC-SEM1-001', supplierName: 'Golden Harvest Foods',  amount: 420000, processedAt: '2026-01-25', status: 'released' },
  { id: 'BTX-002', tokenId: '2', tokenCode: 'GOV-SAC-SEM1-002', supplierName: 'SunGold Oils',          amount: 180000, processedAt: '2026-01-28', status: 'pending'  },
  { id: 'BTX-003', tokenId: '4', tokenCode: 'GOV-SAC-SEM1-004', supplierName: 'National School Foods', amount:  95000, processedAt: '2026-02-20', status: 'pending'  },
  { id: 'BTX-004', tokenId: '5', tokenCode: 'GOV-SAC-SEM1-005', supplierName: 'Golden Harvest Foods',  amount: 620000, processedAt: '2026-03-14', status: 'pending'  },
  { id: 'BTX-005', tokenId: '6', tokenCode: 'GOV-OWS-SEM1-001', supplierName: 'Ghana Foods Co.',       amount: 396000, processedAt: '2026-01-12', status: 'released' },
  { id: 'BTX-006', tokenId: '7', tokenCode: 'GOV-OWS-SEM1-002', supplierName: 'Northern Foods Ltd',    amount: 215000, processedAt: '2026-02-18', status: 'pending'  },
  { id: 'BTX-007', tokenId: '3', tokenCode: 'GOV-SAC-SEM1-003', supplierName: 'Ashanti Agro Supplies', amount: 210000, processedAt: '2026-03-08', status: 'rejected' },
  { id: 'BTX-008', tokenId: '8', tokenCode: 'GOV-MFS-SEM1-001', supplierName: 'Fresh Mart Ltd',        amount: 287500, processedAt: '2026-02-05', status: 'pending'  },
]

// Bank Overview — 3-item snapshot (status labels match the bank overview's filter tabs)
export interface BankOverviewToken {
  id: string
  code: string
  amount: number
  expiry: string | null
  status: 'pending' | 'released' | 'rejected'
  isNew?: boolean
}

export const BANK_OVERVIEW_TOKENS: BankOverviewToken[] = [
  { id: '1', code: 'GOV-SAC-SEM1-005', amount: 620000, expiry: null,         status: 'pending', isNew: true },
  { id: '2', code: 'GOV-SAC-SEM1-001', amount: 420000, expiry: '2026-07-10', status: 'released'            },
  { id: '3', code: 'GOV-SAC-SEM1-003', amount: 210000, expiry: '2026-07-20', status: 'rejected'            },
]

// Bank PendingTokens — tokens submitted by suppliers, awaiting bank validation
export interface BankPendingToken {
  id: string
  code: string
  supplier: string
  institution: string
  amount: number
  submittedAt: string
  expiryDate: string | null
  priority: 'high' | 'normal'
}

export const BANK_PENDING_TOKENS: BankPendingToken[] = [
  { id: '1', code: 'GOV-SAC-SEM1-005', supplier: 'Golden Harvest Foods',  institution: 'St. Augustine College', amount: 620000, submittedAt: '2026-03-14', expiryDate: '2026-09-01', priority: 'high'   },
  { id: '2', code: 'GOV-SAC-SEM1-002', supplier: 'SunGold Oils',          institution: 'St. Augustine College', amount: 180000, submittedAt: '2026-01-28', expiryDate: '2026-07-15', priority: 'normal' },
  { id: '3', code: 'GOV-SAC-SEM1-004', supplier: 'National School Foods', institution: 'St. Augustine College', amount:  95000, submittedAt: '2026-02-20', expiryDate: '2026-08-05', priority: 'normal' },
  { id: '4', code: 'GOV-OWS-SEM1-002', supplier: 'Northern Foods Ltd',    institution: 'Opoku Ware SHS',         amount: 215000, submittedAt: '2026-02-18', expiryDate: '2026-08-12', priority: 'normal' },
]

// Bank CashRelease — validated tokens ready for disbursement to suppliers
export interface BankReadyToken {
  id: string
  code: string
  supplier: string
  institution: string
  amount: number
  validatedAt: string
}

export const BANK_CASH_READY: BankReadyToken[] = [
  { id: '1', code: 'GOV-SAC-SEM1-002', supplier: 'SunGold Oils',          institution: 'St. Augustine College', amount: 180000, validatedAt: '2026-02-05' },
  { id: '2', code: 'GOV-SAC-SEM1-004', supplier: 'National School Foods', institution: 'St. Augustine College', amount:  95000, validatedAt: '2026-02-28' },
  { id: '3', code: 'GOV-OWS-SEM1-002', supplier: 'Northern Foods Ltd',    institution: 'Opoku Ware SHS',         amount: 215000, validatedAt: '2026-03-05' },
]

// ────────────────────────────────────────────────────────────────────────────────
// 11. SUPPLIER PORTAL — Golden Harvest Foods perspective
//     Token codes cross-reference MOCK_TOKENS and GOV_ALL_TOKENS.
//     Deliveries cross-reference MOCK_DELIVERIES (same tokenRef values).
// ────────────────────────────────────────────────────────────────────────────────

// Token Inbox + Overview token list
export interface SupplierTokenItem {
  id: string
  code: string
  institution: string
  amount: number
  issuedDate: string
  expiry: string | null
  status: 'redeemed' | 'unsubmitted' | 'flagged' | 'active'
  isNew?: boolean
}

export const SUPPLIER_TOKENS: SupplierTokenItem[] = [
  { id: '1', code: 'GOV-SAC-SEM1-001', institution: 'St. Augustine College', amount: 420000, issuedDate: '2026-01-10', expiry: '2026-07-10', status: 'redeemed'                },
  { id: '2', code: 'GOV-SAC-SEM1-005', institution: 'St. Augustine College', amount: 620000, issuedDate: '2026-03-01', expiry: '2026-09-01', status: 'unsubmitted', isNew: true  },
  { id: '3', code: 'GOV-SAC-SEM2-005', institution: 'St. Augustine College', amount: 520000, issuedDate: '2025-10-01', expiry: '2026-01-31', status: 'redeemed'                },
  { id: '4', code: 'GOV-OWS-SEM2-003', institution: 'Opoku Ware SHS',         amount: 380000, issuedDate: '2025-09-15', expiry: '2026-01-15', status: 'redeemed'                },
  { id: '5', code: 'GOV-SAC-SEM1-007', institution: 'St. Augustine College', amount: 200000, issuedDate: '2025-08-01', expiry: '2025-12-31', status: 'flagged'                 },
]

// Supplier Overview deliveries table (matches MOCK_DELIVERIES tokenRef values)
export interface SupplierDeliveryItem {
  id: string
  institution: string
  items: string
  qty: number
  tokenRef: string
  date: string
  status: 'delivered' | 'pending' | 'in_transit'
}

export const SUPPLIER_DELIVERIES: SupplierDeliveryItem[] = [
  { id: 'd1', institution: 'St. Augustine College', items: 'Rice (500 Bags)',           qty: 500, tokenRef: 'GOV-SAC-SEM1-001', date: '2026-03-14', status: 'delivered'  },
  { id: 'd2', institution: 'St. Augustine College', items: 'Rice — Batch 2 (600 Bags)', qty: 600, tokenRef: 'GOV-SAC-SEM1-005', date: '2026-03-20', status: 'pending'    },
  { id: 'd3', institution: 'Opoku Ware SHS',         items: 'Rice, Maize (800 units)',   qty: 800, tokenRef: 'GOV-OWS-SEM2-003', date: '2025-11-15', status: 'delivered'  },
]

// Supplier transaction history — cash payments from Ghana Commercial Bank
export const SUPPLIER_TRANSACTIONS: BankTransaction[] = [
  { id: 'BTX-P01', tokenId: '3', tokenCode: 'GOV-SAC-SEM2-005', supplierName: 'Golden Harvest Foods', amount: 520000, processedAt: '2025-10-15', status: 'released' },
  { id: 'BTX-P02', tokenId: '4', tokenCode: 'GOV-OWS-SEM2-003', supplierName: 'Golden Harvest Foods', amount: 380000, processedAt: '2025-09-25', status: 'released' },
  { id: 'BTX-001', tokenId: '1', tokenCode: 'GOV-SAC-SEM1-001', supplierName: 'Golden Harvest Foods', amount: 420000, processedAt: '2026-01-25', status: 'released' },
  { id: 'BTX-P03', tokenId: '5', tokenCode: 'GOV-SAC-SEM1-007', supplierName: 'Golden Harvest Foods', amount: 200000, processedAt: '2025-08-20', status: 'rejected' },
  { id: 'BTX-004', tokenId: '2', tokenCode: 'GOV-SAC-SEM1-005', supplierName: 'Golden Harvest Foods', amount: 620000, processedAt: '2026-03-14', status: 'pending'  },
]

// ────────────────────────────────────────────────────────────────────────────────
// 9. GOVERNMENT CLAIMS WORKFLOW
// ────────────────────────────────────────────────────────────────────────────────
export type GovWorkflowStage =
  | 'received'
  | 'intake'
  | 'regional'
  | 'financial'
  | 'audit'
  | 'budget'
  | 'token_generated'
  | 'supplier_redemption'
  | 'bank_settlement'
  | 'closed'

export const GOV_WORKFLOW_COLUMNS: { id: GovWorkflowStage; label: string; dot: string; actor: string }[] = [
  { id: 'received',             label: 'Received',              dot: 'bg-gray-400',   actor: 'System' },
  { id: 'intake',                label: 'Intake Verification',   dot: 'bg-blue-400',   actor: 'Claims Officer' },
  { id: 'regional',              label: 'Regional Review',       dot: 'bg-indigo-400', actor: 'Regional Officer' },
  { id: 'financial',             label: 'Financial Assessment',  dot: 'bg-yellow-400', actor: 'Financial Officer' },
  { id: 'audit',                 label: 'Audit & Risk Review',   dot: 'bg-red-400',    actor: 'Audit Officer' },
  { id: 'budget',                label: 'Budget Authorization',  dot: 'bg-purple-400', actor: 'Budget Officer' },
  { id: 'token_generated',       label: 'Token Generated',       dot: 'bg-green-400',  actor: 'Treasury' },
  { id: 'supplier_redemption',   label: 'Supplier Redemption',   dot: 'bg-teal-400',   actor: 'Supplier' },
  { id: 'bank_settlement',       label: 'Bank Settlement',       dot: 'bg-emerald-400',actor: 'Bank' },
  { id: 'closed',                label: 'Closed',               dot: 'bg-gray-500',   actor: 'System' },
]

export interface GovApprovalLog {
  date: string
  action: string
  actor: string
  notes?: string
}

export interface GovSemesterClaim {
  id: string
  claimId: string
  school: string
  schoolId: string
  semester: string
  verifiedStudents: number
  claimValue: string
  riskScore: number
  fraudFlags: number
  stage: GovWorkflowStage
  submittedAt: string
  updatedAt: string
  // School data for sidebar
  attendancePct: number
  attendanceHistory: { month: string; meals: number; eligible: number }[]
  supplyBreakdown: { item: string; semester: string; cost: string }[]
  policyDeductions: { reason: string; amount: string }[]
  supportingDocs: { name: string; type: string }[]
  approvalHistory: GovApprovalLog[]
  governmentNotes: string
}

export const MOCK_GOV_CLAIMS: GovSemesterClaim[] = [
  {
    id: '1', claimId: 'CLM-2027-00042', school: 'St. Augustine SHS', schoolId: 'SCH-001',
    semester: 'Jan–Apr 2027', verifiedStudents: 2847, claimValue: 'GHS 2,410,300', riskScore: 22, fraudFlags: 0,
    stage: 'financial', submittedAt: '01 May 2027', updatedAt: '06 May 2027',
    attendancePct: 89, attendanceHistory: [
      { month: 'Jan', meals: 72500, eligible: 82000 }, { month: 'Feb', meals: 68000, eligible: 81000 },
      { month: 'Mar', meals: 71200, eligible: 81500 }, { month: 'Apr', meals: 74000, eligible: 82000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '2,100 Bags', cost: 'GHS 525,000' },
      { item: 'Beans', semester: '840 Bags', cost: 'GHS 268,800' },
      { item: 'Oil', semester: '420 Litres', cost: 'GHS 75,600' },
    ],
    policyDeductions: [
      { reason: 'Operational ceiling exceeded — Mar 2027', amount: '-GHS 18,200' },
      { reason: 'Duplicate scan adjustments', amount: '-GHS 6,400' },
    ],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Daily Reports Package', type: 'ZIP' }, { name: 'Storekeeper Logs', type: 'PDF' },
    ],
    approvalHistory: [
      { date: '01 May', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '02 May', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '04 May', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '06 May', action: 'Sent to Financial Assessment', actor: 'Regional Officer' },
    ],
    governmentNotes: 'School has a strong compliance record. Minor variance in March supply usage — already accounted for in policy deductions.',
  },
  {
    id: '2', claimId: 'CLM-2027-00038', school: 'Opoku Ware SHS', schoolId: 'SCH-002',
    semester: 'Jan–Apr 2027', verifiedStudents: 3120, claimValue: 'GHS 3,150,000', riskScore: 45, fraudFlags: 3,
    stage: 'audit', submittedAt: '28 Apr 2027', updatedAt: '10 May 2027',
    attendancePct: 83, attendanceHistory: [
      { month: 'Jan', meals: 81000, eligible: 98000 }, { month: 'Feb', meals: 79000, eligible: 97000 },
      { month: 'Mar', meals: 76000, eligible: 96000 }, { month: 'Apr', meals: 83000, eligible: 98000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '2,800 Bags', cost: 'GHS 700,000' },
      { item: 'Beans', semester: '1,100 Bags', cost: 'GHS 352,000' },
      { item: 'Oil', semester: '550 Litres', cost: 'GHS 99,000' },
    ],
    policyDeductions: [
      { reason: 'Excess supply — Rice 22% above benchmark', amount: '-GHS 154,000' },
      { reason: 'Card incident — suspended card usage', amount: '-GHS 12,500' },
    ],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Supply Reconciliation', type: 'PDF' }, { name: 'Fraud Investigation Report', type: 'PDF' },
    ],
    approvalHistory: [
      { date: '28 Apr', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '29 Apr', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '02 May', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '05 May', action: 'Financial Assessment — Partially Verified', actor: 'Financial Officer' },
      { date: '10 May', action: 'Escalated to Audit — risk score 45, fraud flags present', actor: 'Financial Officer' },
    ],
    governmentNotes: 'Elevated risk score due to supply anomaly. Audit officer reviewing fraud report from March card incident.',
  },
  {
    id: '3', claimId: 'CLM-2027-00041', school: 'Mfantsipim SHS', schoolId: 'SCH-003',
    semester: 'Jan–Apr 2027', verifiedStudents: 2650, claimValue: 'GHS 2,180,000', riskScore: 8, fraudFlags: 0,
    stage: 'budget', submittedAt: '20 Apr 2027', updatedAt: '12 May 2027',
    attendancePct: 94, attendanceHistory: [
      { month: 'Jan', meals: 62500, eligible: 67000 }, { month: 'Feb', meals: 61000, eligible: 66000 },
      { month: 'Mar', meals: 63000, eligible: 67000 }, { month: 'Apr', meals: 64000, eligible: 67000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '1,800 Bags', cost: 'GHS 450,000' },
      { item: 'Beans', semester: '720 Bags', cost: 'GHS 230,400' },
      { item: 'Oil', semester: '360 Litres', cost: 'GHS 64,800' },
    ],
    policyDeductions: [],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Daily Reports Package', type: 'ZIP' },
    ],
    approvalHistory: [
      { date: '20 Apr', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '21 Apr', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '24 Apr', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '28 Apr', action: 'Financial Assessment Approved', actor: 'Financial Officer' },
      { date: '03 May', action: 'Audit Review — Clean, risk score 8', actor: 'Audit Officer' },
      { date: '12 May', action: 'Awaiting Budget Authorization', actor: 'Budget Officer' },
    ],
    governmentNotes: 'Exemplary compliance. All reports clean. No deductions. Recommended for priority settlement.',
  },
  {
    id: '4', claimId: 'CLM-2027-00035', school: 'Wesley Girls SHS', schoolId: 'SCH-004',
    semester: 'Jan–Apr 2027', verifiedStudents: 2890, claimValue: 'GHS 2,890,000', riskScore: 12, fraudFlags: 0,
    stage: 'token_generated', submittedAt: '15 Apr 2027', updatedAt: '08 Jun 2027',
    attendancePct: 91, attendanceHistory: [
      { month: 'Jan', meals: 74000, eligible: 82000 }, { month: 'Feb', meals: 71000, eligible: 81000 },
      { month: 'Mar', meals: 73000, eligible: 81500 }, { month: 'Apr', meals: 75000, eligible: 82000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '2,200 Bags', cost: 'GHS 550,000' },
      { item: 'Beans', semester: '950 Bags', cost: 'GHS 304,000' },
      { item: 'Oil', semester: '480 Litres', cost: 'GHS 86,400' },
    ],
    policyDeductions: [{ reason: 'Minor supply variance — within tolerance', amount: '-GHS 5,200' }],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Daily Reports Package', type: 'ZIP' },
    ],
    approvalHistory: [
      { date: '15 Apr', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '16 Apr', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '20 Apr', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '25 Apr', action: 'Financial Assessment Approved', actor: 'Financial Officer' },
      { date: '30 Apr', action: 'Audit Review Approved', actor: 'Audit Officer' },
      { date: '05 May', action: 'Budget Authorized', actor: 'Budget Officer' },
      { date: '08 Jun', action: 'Token Generated — GT-2027-0088', actor: 'Treasury' },
    ],
    governmentNotes: 'Full approval chain complete. Token issued. Awaiting supplier redemption.',
  },
  {
    id: '5', claimId: 'CLM-2027-00029', school: 'Achimota SHS', schoolId: 'SCH-005',
    semester: 'Jan–Apr 2027', verifiedStudents: 3050, claimValue: 'GHS 3,020,000', riskScore: 3, fraudFlags: 0,
    stage: 'closed', submittedAt: '05 Apr 2027', updatedAt: '20 May 2027',
    attendancePct: 93, attendanceHistory: [
      { month: 'Jan', meals: 78000, eligible: 85000 }, { month: 'Feb', meals: 75000, eligible: 84000 },
      { month: 'Mar', meals: 77000, eligible: 84500 }, { month: 'Apr', meals: 79000, eligible: 85000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '2,400 Bags', cost: 'GHS 600,000' },
      { item: 'Beans', semester: '1,000 Bags', cost: 'GHS 320,000' },
      { item: 'Oil', semester: '500 Litres', cost: 'GHS 90,000' },
    ],
    policyDeductions: [],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Daily Reports Package', type: 'ZIP' },
    ],
    approvalHistory: [
      { date: '05 Apr', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '06 Apr', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '10 Apr', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '15 Apr', action: 'Financial Assessment Approved', actor: 'Financial Officer' },
      { date: '20 Apr', action: 'Audit Review Approved', actor: 'Audit Officer' },
      { date: '25 Apr', action: 'Budget Authorized', actor: 'Budget Officer' },
      { date: '30 Apr', action: 'Token Generated — GT-2027-0055', actor: 'Treasury' },
      { date: '10 May', action: 'Supplier Redeemed Token', actor: 'Supplier' },
      { date: '20 May', action: 'Bank Settlement — Cash Released', actor: 'Ghana Commercial Bank' },
    ],
    governmentNotes: 'Fully settled. All stages complete. Token redeemed by Golden Harvest Foods. Payment released by Ghana Commercial Bank.',
  },
  {
    id: '6', claimId: 'CLM-2027-00044', school: 'Sunyani SHS', schoolId: 'SCH-006',
    semester: 'Jan–Apr 2027', verifiedStudents: 1980, claimValue: 'GHS 1,650,000', riskScore: 18, fraudFlags: 1,
    stage: 'regional', submittedAt: '03 May 2027', updatedAt: '05 May 2027',
    attendancePct: 78, attendanceHistory: [
      { month: 'Jan', meals: 48000, eligible: 62000 }, { month: 'Feb', meals: 46000, eligible: 61000 },
      { month: 'Mar', meals: 45000, eligible: 60000 }, { month: 'Apr', meals: 49000, eligible: 62000 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '1,400 Bags', cost: 'GHS 350,000' },
      { item: 'Beans', semester: '600 Bags', cost: 'GHS 192,000' },
      { item: 'Oil', semester: '280 Litres', cost: 'GHS 50,400' },
    ],
    policyDeductions: [],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
    ],
    approvalHistory: [
      { date: '03 May', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '04 May', action: 'Intake Verification — Missing Documents Returned', actor: 'Claims Officer', notes: 'Storekeeper logs missing' },
      { date: '05 May', action: 'Documents Resubmitted', actor: 'School Admin' },
    ],
    governmentNotes: 'Below-average attendance rate (78%). Regional officer to verify enrollment vs attendance discrepancy.',
  },
  {
    id: '7', claimId: 'CLM-2027-00040', school: 'Tamale SHS', schoolId: 'SCH-007',
    semester: 'Jan–Apr 2027', verifiedStudents: 2150, claimValue: 'GHS 1,820,000', riskScore: 8, fraudFlags: 0,
    stage: 'supplier_redemption', submittedAt: '18 Apr 2027', updatedAt: '05 Jun 2027',
    attendancePct: 86, attendanceHistory: [
      { month: 'Jan', meals: 52000, eligible: 62000 }, { month: 'Feb', meals: 50000, eligible: 61000 },
      { month: 'Mar', meals: 54000, eligible: 62000 }, { month: 'Apr', meals: 53000, eligible: 61500 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '1,600 Bags', cost: 'GHS 400,000' },
      { item: 'Beans', semester: '680 Bags', cost: 'GHS 217,600' },
      { item: 'Oil', semester: '320 Litres', cost: 'GHS 57,600' },
    ],
    policyDeductions: [],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' }, { name: 'Enrolment Register', type: 'XLSX' },
      { name: 'Daily Reports Package', type: 'ZIP' },
    ],
    approvalHistory: [
      { date: '18 Apr', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '19 Apr', action: 'Intake Verification Approved', actor: 'Claims Officer' },
      { date: '23 Apr', action: 'Regional Review Approved', actor: 'Regional Officer' },
      { date: '28 Apr', action: 'Financial Assessment Approved', actor: 'Financial Officer' },
      { date: '02 May', action: 'Audit Review Approved', actor: 'Audit Officer' },
      { date: '08 May', action: 'Budget Authorized', actor: 'Budget Officer' },
      { date: '15 May', action: 'Token Generated — GT-2027-0061', actor: 'Treasury' },
      { date: '05 Jun', action: 'Supplier Redeemed Token — Awaiting Bank Settlement', actor: 'Supplier' },
    ],
    governmentNotes: 'Token redeemed by Ashanti Agro Supplies. Bank settlement in progress.',
  },
  {
    id: '8', claimId: 'CLM-2027-00036', school: 'Tarkwa SHS', schoolId: 'SCH-008',
    semester: 'Jan–Apr 2027', verifiedStudents: 1620, claimValue: 'GHS 1,380,000', riskScore: 55, fraudFlags: 7,
    stage: 'intake', submittedAt: '02 May 2027', updatedAt: '03 May 2027',
    attendancePct: 62, attendanceHistory: [
      { month: 'Jan', meals: 35000, eligible: 58000 }, { month: 'Feb', meals: 32000, eligible: 57000 },
      { month: 'Mar', meals: 38000, eligible: 58000 }, { month: 'Apr', meals: 36000, eligible: 57500 },
    ],
    supplyBreakdown: [
      { item: 'Rice', semester: '1,200 Bags', cost: 'GHS 300,000' },
      { item: 'Beans', semester: '500 Bags', cost: 'GHS 160,000' },
      { item: 'Oil', semester: '240 Litres', cost: 'GHS 43,200' },
    ],
    policyDeductions: [
      { reason: 'Unknown cards — 286 incidents flagged', amount: '-GHS 78,000' },
      { reason: 'Supply-anomaly — 7 fraud flags active', amount: 'Under review' },
    ],
    supportingDocs: [
      { name: 'Dining Hall Summary', type: 'PDF' },
    ],
    approvalHistory: [
      { date: '02 May', action: 'Claim Submitted', actor: 'School Admin' },
      { date: '03 May', action: 'Intake — High Risk Flag, Audit Hold', actor: 'Claims Officer', notes: '286 unknown card incidents. Missing fraud investigation report.' },
    ],
    governmentNotes: 'CRITICAL: 286 unknown card scans. Missing fraud investigation report. Missing supply reconciliation. Claims officer placed on audit hold. Risk score elevated to 55.',
  },
]
