// ─── Mock Data — Central registry for all modules ──────────────────────────────
// Each module has data covering all possible case scenarios (statuses, edge cases)

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
export type ReportWorkflowStage = 'generated' | 'operational_review' | 'compliance_review' | 'approve_lock' | 'claim_eligible'
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
  // Supply
  riceUsed: string
  oilUsed: string
  beansUsed: string
  // Logs
  logs: { time: string; event: string }[]
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
    sessions: 3,
    breakfastServed: 2352,
    lunchServed: 2418,
    dinnerServed: 2469,
    riceUsed: '420 Bags',
    oilUsed: '310 Litres',
    beansUsed: '75 Bags',
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
  },
  {
    id: '2',
    reportId: 'DR-2026-0314',
    date: '14 Mar 2026',
    mealsServed: 2387,
    eligibleStudents: 2850,
    fraudAlerts: 0,
    netEligible: 'GHS 37,910',
    grossEstimate: 'GHS 37,910',
    semesterAccrued: 'GHS 774,080',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '14 Mar, 8:12 PM',
    sessions: 3,
    breakfastServed: 2310,
    lunchServed: 2405,
    dinnerServed: 2445,
    riceUsed: '440 Bags',
    oilUsed: '295 Litres',
    beansUsed: '80 Bags',
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
    netEligible: 'GHS 38,150',
    grossEstimate: 'GHS 38,650',
    semesterAccrued: 'GHS 736,170',
    policyAdjustments: '-GHS 500',
    workflowStage: 'approve_lock',
    status: 'locked',
    generatedBy: 'Auto',
    updatedAt: '13 Mar, 9:05 PM',
    sessions: 3,
    breakfastServed: 2330,
    lunchServed: 2420,
    dinnerServed: 2450,
    riceUsed: '430 Bags',
    oilUsed: '300 Litres',
    beansUsed: '78 Bags',
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
  },
  {
    id: '4',
    reportId: 'DR-2026-0312',
    date: '12 Mar 2026',
    mealsServed: 2395,
    eligibleStudents: 2845,
    fraudAlerts: 2,
    netEligible: 'GHS 37,800',
    grossEstimate: 'GHS 38,100',
    semesterAccrued: 'GHS 698,020',
    policyAdjustments: '-GHS 300',
    workflowStage: 'compliance_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '12 Mar, 8:30 PM',
    sessions: 3,
    breakfastServed: 2340,
    lunchServed: 2410,
    dinnerServed: 2430,
    riceUsed: '425 Bags',
    oilUsed: '305 Litres',
    beansUsed: '74 Bags',
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:15 PM', event: 'Operational review completed' },
      { time: '8:30 PM', event: 'Sent to compliance review' },
    ],
  },
  {
    id: '5',
    reportId: 'DR-2026-0311',
    date: '11 Mar 2026',
    mealsServed: 2420,
    eligibleStudents: 2840,
    fraudAlerts: 0,
    netEligible: 'GHS 37,950',
    grossEstimate: 'GHS 37,950',
    semesterAccrued: 'GHS 660,220',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '11 Mar, 8:11 PM',
    sessions: 3,
    breakfastServed: 2355,
    lunchServed: 2425,
    dinnerServed: 2480,
    riceUsed: '445 Bags',
    oilUsed: '298 Litres',
    beansUsed: '82 Bags',
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
    netEligible: 'GHS 33,200',
    grossEstimate: 'GHS 36,800',
    semesterAccrued: 'GHS 622,270',
    policyAdjustments: '-GHS 3,600',
    workflowStage: 'operational_review',
    status: 'analyzing',
    generatedBy: 'Auto',
    updatedAt: '10 Mar, 8:45 PM',
    sessions: 3,
    breakfastServed: 2000,
    lunchServed: 2150,
    dinnerServed: 2165,
    riceUsed: '380 Bags',
    oilUsed: '270 Litres',
    beansUsed: '65 Bags',
    logs: [
      { time: '8:05 PM', event: 'Daily report created' },
      { time: '8:10 PM', event: 'High fraud alert count detected — flagged for review' },
      { time: '8:45 PM', event: 'Sent to operational review' },
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
    netEligible: 'GHS 37,850',
    grossEstimate: 'GHS 37,850',
    semesterAccrued: 'GHS 589,070',
    policyAdjustments: 'GHS 0',
    workflowStage: 'claim_eligible',
    status: 'eligible',
    generatedBy: 'Auto',
    updatedAt: '09 Mar, 8:08 PM',
    sessions: 3,
    breakfastServed: 2330,
    lunchServed: 2410,
    dinnerServed: 2430,
    riceUsed: '435 Bags',
    oilUsed: '290 Litres',
    beansUsed: '77 Bags',
    logs: [
      { time: '8:04 PM', event: 'Daily report created' },
      { time: '8:08 PM', event: 'Clean report — auto-approved and locked' },
    ],
  },
]

// Kanban workflow columns
export const WORKFLOW_COLUMNS = [
  { id: 'generated', label: 'Generated', dot: 'bg-orange-400' },
  { id: 'operational_review', label: 'Operational Review', dot: 'bg-blue-500' },
  { id: 'compliance_review', label: 'Compliance Review', dot: 'bg-red-500' },
  { id: 'approve_lock', label: 'Approve And Lock', dot: 'bg-yellow-500' },
  { id: 'claim_eligible', label: 'Claim Eligible', dot: 'bg-green-500' },
]

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
