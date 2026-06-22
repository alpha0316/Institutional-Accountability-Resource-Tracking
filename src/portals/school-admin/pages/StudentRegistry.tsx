import { useState, useMemo, useRef } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import {
  MOCK_STUDENTS,
  MOCK_CARDS,
  STUDENT_FILTERS,
  STUDENT_STATUS_MAP,
  CARD_STATUS_MAP,
  ENROLLMENT_STEPS,
  type MockStudent,
  type House,
} from '../../../lib/mockData'

const HOUSES: House[] = ['St Augustine House', 'St Theresa House', 'St Francis House', 'St Monica House']

function randomHouse(): House {
  return HOUSES[Math.floor(Math.random() * HOUSES.length)]
}

function randomClass(): string {
  const forms = ['1', '2', '3']
  const subjects = ['Science', 'Arts', 'Business', 'Home Ec', 'Agric']
  const sections = ['A', 'B', 'C']
  const form = forms[Math.floor(Math.random() * forms.length)]
  const subject = subjects[Math.floor(Math.random() * subjects.length)]
  const section = sections[Math.floor(Math.random() * 2)]
  return `${form} ${subject} ${section}`
}

type StudentFilterKey = 'all' | 'active' | 'pending' | 'suspended' | 'inactive'
type SidebarView = 'detail' | 'enroll' | null
type DetailTab = 'profile' | 'dining' | 'card' | 'attendance'

const DETAIL_TABS: { label: string; value: DetailTab; icon: React.ReactNode }[] = [
  { label: 'Profile',     value: 'profile',    icon: <Icon name="user" size={14} /> },
  { label: 'Dining',      value: 'dining',      icon: <Icon name="tools-kitchen-2" size={14} /> },
  { label: 'Card Info',   value: 'card',        icon: <Icon name="credit-card" size={14} /> },
  { label: 'Attendance',  value: 'attendance',  icon: <Icon name="clipboard-check" size={14} /> },
]

function SidebarDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[13px] last:border-0">
      <span className="text-[14px] text-[#888]">{label}</span>
      <span className="text-[14px] font-semibold text-[#111]">{value}</span>
    </div>
  )
}

const STATS = [
  { label: 'Total Students',       value: '4,832', description: 'All enrolled students',        tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Active Students',      value: '1,247', description: 'Currently eligible',           tone: 'bg-[#f7fdf9]' },
  { label: 'Pending Cards',        value: '15',    description: 'Active but do not yet have card', tone: 'bg-[#fcf8f5]' },
  { label: 'Inactive Students',    value: '3',     description: 'Graduated, suspended, withdrawn', tone: 'bg-[#fff7f8]', alert: true },
]

export default function StudentRegistry() {
  const [statusFilter, setStatusFilter] = useState<StudentFilterKey>('all')

  const [search, setSearch] = useState('')
  const [sidebarView, setSidebarView] = useState<SidebarView>(null)
  const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('profile')
  const [enrollStep, setEnrollStep] = useState(1)
  const [lookupResult, setLookupResult] = useState<{ found: boolean; name?: string; bece?: string; programme?: string; school?: string } | null>(null)
  const [enrollHouse, setEnrollHouse] = useState<House>(() => randomHouse())
  const [enrollClass, setEnrollClass] = useState(() => randomClass())
  const qrContainerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    let rows = MOCK_STUDENTS
    if (statusFilter !== 'all') rows = rows.filter(s => s.studentStatus === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.beceNumber.toLowerCase().includes(q)
      )
    }
    return rows
  }, [statusFilter, search])

  function openDetail(student: MockStudent) {
    setSelectedStudent(student)
    setDetailTab('profile')
    setSidebarView('detail')
  }

  function openEnroll() {
    setEnrollStep(1)
    setLookupResult(null)
    setEnrollHouse(randomHouse())
    setEnrollClass(randomClass())
    setSidebarView('enroll')
  }

  function handleDownloadPDF() {
    const student = lookupResult

    // Grab the rendered QR SVG and embed it as a base64 data URI so it prints correctly
    const svgEl = qrContainerRef.current?.querySelector('svg')
    let qrImgHtml = '<div style="width:130px;height:130px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#aaa">QR unavailable</div>'
    if (svgEl) {
      const cloned = svgEl.cloneNode(true) as SVGSVGElement
      cloned.setAttribute('width', '130')
      cloned.setAttribute('height', '130')
      const svgStr = new XMLSerializer().serializeToString(cloned)
      const b64 = btoa(unescape(encodeURIComponent(svgStr)))
      qrImgHtml = `<img src="data:image/svg+xml;base64,${b64}" width="130" height="130" style="display:block" />`
    }

    const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const studentName = student?.name ?? 'Abena Mensah'
    const initials = studentName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

    const cardHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Student ID Card — SAC-2026-01490</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#b0b8c8}
  .card{width:680px;background:#dbd8d2;border-radius:18px;overflow:hidden;box-shadow:0 12px 50px rgba(0,0,0,0.35);position:relative}
  /* ── Header ── */
  .header{background:#1a3a6e;padding:14px 28px;display:flex;align-items:center;justify-content:space-between}
  .header-title{font-size:22px;font-weight:900;color:#fff;letter-spacing:4px;text-transform:uppercase;flex:1;text-align:center}
  .header-crest{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0}
  /* ── Accent stripes ── */
  .accent{height:5px;background:#1a3a6e;opacity:.25}
  /* ── Body: 3 columns ── */
  .body{display:flex;align-items:stretch;padding:24px 20px 20px;gap:20px;min-height:240px}
  /* Photo column */
  .col-photo{flex-shrink:0;width:148px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
  .photo-box{width:148px;height:185px;background:#b8b4ae;border:3px solid #1a3a6e;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .photo-initials{font-size:52px;font-weight:700;color:#1a3a6e;opacity:.35;letter-spacing:-2px}
  .photo-label{font-size:10px;font-weight:700;color:#1a3a6e;text-transform:uppercase;letter-spacing:1px;opacity:.6}
  .student-id{font-size:11px;font-weight:700;color:#1a3a6e;letter-spacing:.5px}
  /* Details column */
  .col-details{flex:1;display:flex;flex-direction:column;gap:0;padding-top:4px}
  .school-line{font-size:10px;font-weight:600;color:#1a3a6e;text-transform:uppercase;letter-spacing:1.5px;opacity:.6;margin-bottom:14px}
  .field{margin-bottom:13px}
  .field-lbl{font-size:12px;font-weight:900;color:#1a3a6e;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:3px}
  .field-val{font-size:16px;font-weight:600;color:#111;line-height:1.3}
  .field-val.sm{font-size:13px;font-weight:500;color:#333}
  /* QR column */
  .col-qr{flex-shrink:0;width:158px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-left:2px solid rgba(26,58,110,.15);padding-left:18px}
  .qr-box{border:2px solid #1a3a6e;border-radius:8px;padding:8px;background:#fff}
  .qr-lbl{font-size:10px;font-weight:800;color:#1a3a6e;text-transform:uppercase;letter-spacing:2px;text-align:center}
  .qr-sub{font-size:10px;color:#555;text-align:center;margin-top:2px;letter-spacing:.3px}
  /* Vertical stripe bar (right edge, like inspiration barcode) */
  .stripe-bar{position:absolute;right:0;top:0;bottom:0;width:26px;display:flex;flex-direction:column;justify-content:stretch;gap:0;overflow:hidden;border-radius:0 18px 18px 0}
  .stripe-bar span{flex:1;background:#1a3a6e}
  .stripe-bar span:nth-child(even){opacity:.35}
  .stripe-bar span:nth-child(3n){flex:1.8}
  /* Footer */
  .footer{background:#1a3a6e;padding:10px 24px;display:flex;justify-content:space-between;align-items:center}
  .footer-l{font-size:11px;color:rgba(255,255,255,.65);letter-spacing:.3px}
  .footer-r{font-size:11px;font-weight:700;color:#4ade80;display:flex;align-items:center;gap:5px}
  .footer-r::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ade80}
  @media print{body{background:#fff}.card{box-shadow:none}}
</style></head><body>
<div class="card">
  <div class="stripe-bar">
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
  </div>

  <div class="header">
    <div class="header-crest">SA</div>
    <div class="header-title">Student Identity Card</div>
    <div style="width:38px"></div>
  </div>
  <div class="accent"></div>

  <div class="body">
    <!-- Photo -->
    <div class="col-photo">
      <div class="photo-box">
        <div class="photo-initials">${initials}</div>
      </div>
      <div class="photo-label">Student Photo</div>
      <div class="student-id">ID: SAC-2026-01490</div>
    </div>

    <!-- Details -->
    <div class="col-details">
      <div class="school-line">St. Augustine College &middot; Ghana</div>
      <div class="field">
        <div class="field-lbl">Name</div>
        <div class="field-val">${studentName}</div>
      </div>
      <div class="field">
        <div class="field-lbl">Programme</div>
        <div class="field-val sm">${student?.programme ?? 'General Science'}</div>
      </div>
      <div class="field">
        <div class="field-lbl">Form &amp; Class</div>
        <div class="field-val sm">Form 1 &mdash; 1 Science A</div>
      </div>
      <div class="field">
        <div class="field-lbl">House</div>
        <div class="field-val sm">St Augustine House</div>
      </div>
      <div class="field">
        <div class="field-lbl">Academic Year</div>
        <div class="field-val sm">2025 / 2026</div>
      </div>
    </div>

    <!-- QR -->
    <div class="col-qr">
      <div class="qr-box">${qrImgHtml}</div>
      <div class="qr-lbl">Scan to Validate</div>
      <div class="qr-sub">CARD-0004833</div>
      <div class="qr-sub">SAC-2026-01490</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-l">Issued ${issueDate} &nbsp;&middot;&nbsp; Ministry of Education, Ghana</div>
    <div class="footer-r">Active</div>
  </div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`

    const w = window.open('', '_blank', 'width=740,height=420')
    if (w) { w.document.write(cardHtml); w.document.close() }
  }

  function closeSidebar() {
    setSidebarView(null)
    setSelectedStudent(null)
  }

  function rowActions(student: MockStudent): DropdownMenuItem[] {
    return [
      { label: 'View Profile',      onClick: () => openDetail(student) },
      { label: 'Edit Student',      onClick: () => openDetail(student) },
      { label: 'Manage Card',       onClick: () => { openDetail(student); setDetailTab('card') } },
      { label: 'Deactivate Student',onClick: () => {}, destructive: true, disabled: student.studentStatus === 'inactive' },
    ]
  }

  const columns: Column<MockStudent>[] = [
    {
      key: 'studentId',
      label: 'Student ID',
      width: '16%',
      primaryKey: true,
      render: (s) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{s.studentId}</span>,
    },
    {
      key: 'fullName',
      label: 'Student Name',
      width: '20%',
      render: (s) => s.fullName,
    },
    {
      key: 'form',
      label: 'Year / Level',
      width: '15%',
      render: (s) => s.form,
    },
    {
      key: 'cardStatus',
      label: 'Card',
      width: '14%',
      render: (s) => {
        const m = CARD_STATUS_MAP[s.cardStatus]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
    },
    {
      key: 'studentStatus',
      label: 'Status',
      width: '14%',
      render: (s) => {
        const m = STUDENT_STATUS_MAP[s.studentStatus]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
    },
    {
      key: 'fraudFlags',
      label: 'Flags',
      width: '15%',
      align: 'center',
      render: (s) => (
        <span className={s.fraudFlags > 0 ? 'text-[#ff3333] font-semibold' : ''}>
          {s.fraudFlags}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        actions={<Button onClick={openEnroll}><Icon name="plus" size={14} />Enroll Student</Button>}
      />

      <div className="pl-[36px] pr-[20px] pt-[2px]">
        {/* stat cards */}
        <div className="grid grid-cols-4 gap-[30px]">
          {STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <div className={clsx('flex h-[25px] items-center justify-between rounded-[7px] px-[5px]', stat.tone)}>
                <span className="truncate text-[15px] font-normal leading-none text-[#6f6f6f]">{stat.label}</span>
                {stat.trend && <span className="shrink-0 text-[13px] font-semibold leading-none text-[#5fc98e]">{stat.trend}</span>}
              </div>
              <div className="mt-[29px]">
                <p className="text-[26px] font-semibold leading-none text-[#414141]">{stat.value}</p>
                <p className={clsx('mt-[12px] truncate text-[15px] font-normal leading-none', stat.alert ? 'text-[#ff3333]' : 'text-[#969696]')}>
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* students table */}
        <section className="mt-[52px]">
          <h2 className="text-[22px] font-bold leading-[24px] text-black">Students</h2>

          <div className="mt-[6px] flex h-[31px] items-center justify-between">
            <div className="flex items-center gap-[8px]">
              {/* Student Status filters */}
              <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
                {STUDENT_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key as StudentFilterKey)}
                    className={clsx(
                      'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                      statusFilter === f.key
                        ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'text-[#7e7e7e] hover:text-[#555]'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex h-[31px] w-[217px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
              <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, BECE..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]"
              />
            </div>
          </div>

          <div className="mt-[12px]">
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(s) => s.id}
              onRowClick={openDetail}
              rowActions={rowActions}
              emptyMessage="No students match your filters."
            />
          </div>
        </section>
      </div>

      {/* ── Right Sidebar ─────────────────────────────────────────────────── */}
      {sidebarView && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeSidebar} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            {/* Header */}
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">
                {sidebarView === 'enroll' ? 'Enroll Student' : selectedStudent?.fullName ?? ''}
              </h2>
              <button
                onClick={closeSidebar}
                className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </button>
            </div>

            {/* ── Enroll Student Flow ─────────────────────────────── */}
            {sidebarView === 'enroll' && (
              <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
                {/* Step indicators */}
                <div className="mb-[20px] flex gap-[6px]">
                  {ENROLLMENT_STEPS.map((step) => (
                    <div key={step.step} className="flex items-center gap-[6px]">
                      <div className={clsx(
                        'flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-semibold',
                        enrollStep >= step.step ? 'bg-[#4ea4ff] text-white' : 'bg-[#efefef] text-[#999]'
                      )}>
                        {enrollStep > step.step ? <Icon name="check" size={12} /> : step.step}
                      </div>
                      {step.step < 4 && <div className={clsx('h-[1px] w-[20px]', enrollStep > step.step ? 'bg-[#4ea4ff]' : 'bg-[#e5e5e5]')} />}
                    </div>
                  ))}
                </div>

                <p className="mb-[4px] text-[14px] font-semibold text-[#111]">{ENROLLMENT_STEPS[enrollStep - 1].label}</p>
                <p className="mb-[18px] text-[13px] text-[#888]">{ENROLLMENT_STEPS[enrollStep - 1].description}</p>

                {/* STEP 1: Student Lookup (GES Verification) */}
                {enrollStep === 1 && (
                  <div className="space-y-[14px]">
                    <div>
                      <label className="text-[13px] font-medium text-[#555]">Admission Number</label>
                      <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="ADM-2026-XXXXX" />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[#555]">BECE Index Number</label>
                      <input className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" placeholder="BECE-2024-GH-XXXXX" />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[#555]">Date of Birth</label>
                      <input type="date" className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]" />
                    </div>

                    <Button
                      className="w-fit mt-[8px]"
                      onClick={() => setLookupResult({
                        found: true,
                        name: 'Abena Mensah',
                        bece: 'BECE-2024-GH-03921',
                        programme: 'General Science',
                        school: 'St. Augustine SHS',
                      })}
                    >
                      Verify Against GES
                    </Button>

                    {lookupResult && (
                      <div className="rounded-[12px] border border-[#d1fae5] bg-[#ecfdf5] p-[16px]">
                        <p className="text-[14px] font-semibold text-[#065f46] mb-[10px]">Student Found</p>
                        <div className="space-y-[8px]">
                          <div className="flex justify-between"><span className="text-[12px] text-[#888]">Name</span><span className="text-[13px] font-semibold text-[#111]">{lookupResult.name}</span></div>
                          <div className="flex justify-between"><span className="text-[12px] text-[#888]">BECE Index</span><span className="text-[13px] font-semibold text-[#111]">{lookupResult.bece}</span></div>
                          <div className="flex justify-between"><span className="text-[12px] text-[#888]">Placed Programme</span><span className="text-[13px] font-semibold text-[#111]">{lookupResult.programme}</span></div>
                          <div className="flex justify-between"><span className="text-[12px] text-[#888]">Placement School</span><span className="text-[13px] font-semibold text-[#111]">{lookupResult.school}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Academic Assignment */}
                {enrollStep === 2 && (
                  <div className="space-y-[14px]">
                    <div className="grid grid-cols-2 gap-[12px]">
                      <div>
                        <label className="text-[13px] font-medium text-[#555]">Form</label>
                        <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white">
                          <option>Select...</option><option>Form 1</option><option>Form 2</option><option>Form 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-[#555]">Programme</label>
                        <select className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white" defaultValue={lookupResult?.programme}>
                          <option>Select...</option><option>General Science</option><option>General Arts</option><option>Home Economics</option><option>Visual Arts</option><option>Business</option><option>Agricultural Science</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[#555]">Class</label>
                      <input
                        value={enrollClass}
                        onChange={(e) => setEnrollClass(e.target.value)}
                        className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[#555]">House</label>
                      <select
                        value={enrollHouse}
                        onChange={(e) => setEnrollHouse(e.target.value as House)}
                        className="mt-[4px] h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none bg-white"
                      >
                        <option>St Augustine House</option>
                        <option>St Theresa House</option>
                        <option>St Francis House</option>
                        <option>St Monica House</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 3: Card Generation */}
                {enrollStep === 3 && (
                  <div className="space-y-[14px]">
                    <div className="rounded-[12px] border border-[#dbeafe] bg-[#eff6ff] p-[16px] text-center">
                      <p className="text-[13px] font-semibold text-[#1e40af] mb-[4px]">Card Auto-Generated</p>
                      <p className="text-[12px] text-[#3b82f6]">A unique validation card has been generated for this student</p>
                    </div>

                    {/* Card Preview — matches export PDF design */}
                    <div className="rounded-[14px] border border-[#e5e5e5] bg-[#dbd8d2] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
                      <div className="bg-[#1a3a6e] px-[16px] py-[12px] flex items-center justify-between">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/15 text-white text-[11px] font-bold">SA</div>
                        <span className="text-[13px] font-bold text-white tracking-[2px] uppercase">Student Identity Card</span>
                        <div className="w-[30px]" />
                      </div>
                      <div className="h-[3px] bg-[#1a3a6e] opacity-25" />
                      <div className="flex items-stretch p-[16px] gap-[14px] relative overflow-hidden">
                        <div className="flex-shrink-0 w-[100px] flex flex-col items-start gap-[8px]">
                          <div className="w-[100px] h-[125px] bg-[#b8b4ae] border-[2px] border-[#1a3a6e] rounded-[4px] flex items-center justify-center">
                            <span className="text-[36px] font-bold text-[#1a3a6e] opacity-35">AM</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#1a3a6e] uppercase tracking-[1px] opacity-60">Student Photo</span>
                          <span className="text-[10px] font-bold text-[#1a3a6e]">ID: SAC-2026-01490</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-0 pt-[2px]">
                          <span className="text-[9px] font-semibold text-[#1a3a6e] uppercase tracking-[1px] opacity-60 mb-[10px]">St. Augustine College &middot; Ghana</span>
                          <div className="mb-[8px]">
                            <span className="text-[10px] font-bold text-[#1a3a6e] uppercase tracking-[1px]">Name</span>
                            <p className="text-[13px] font-semibold text-[#111]">{lookupResult?.name ?? 'Abena Mensah'}</p>
                          </div>
                          <div className="mb-[8px]">
                            <span className="text-[10px] font-bold text-[#1a3a6e] uppercase tracking-[1px]">Programme</span>
                            <p className="text-[11px] font-medium text-[#333]">{lookupResult?.programme ?? 'General Science'}</p>
                          </div>
                          <div className="mb-[8px]">
                            <span className="text-[10px] font-bold text-[#1a3a6e] uppercase tracking-[1px]">Form &amp; Class</span>
                            <p className="text-[11px] font-medium text-[#333]">Form 1 &mdash; {enrollClass}</p>
                          </div>
                          <div className="mb-[8px]">
                            <span className="text-[10px] font-bold text-[#1a3a6e] uppercase tracking-[1px]">House</span>
                            <p className="text-[11px] font-medium text-[#333]">{enrollHouse}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[#1a3a6e] uppercase tracking-[1px]">Academic Year</span>
                            <p className="text-[11px] font-medium text-[#333]">2025 / 2026</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-[90px] flex flex-col items-center justify-center gap-[6px] border-l-[1px] border-[#1a3a6e]/15 pl-[12px]">
                          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[6px] border-[2px] border-[#1a3a6e] bg-white">
                            <Icon name="qrcode" size={40} className="text-[#1a3a6e]" />
                          </div>
                          <span className="text-[9px] font-bold text-[#1a3a6e] uppercase tracking-[1px] text-center">Scan to Validate</span>
                          <span className="text-[9px] text-[#555]">CARD-0004833</span>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-[14px] flex flex-col">
                          {[...Array(12)].map((_, i) => (
                            <span key={i} className="flex-1 bg-[#1a3a6e]" style={{ opacity: i % 2 === 0 ? 1 : 0.35, flex: i % 3 === 2 ? 1.8 : 1 }} />
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#1a3a6e] px-[14px] py-[8px] flex justify-between items-center">
                        <span className="text-[10px] text-white/65">Issued {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &middot; Ministry of Education, Ghana</span>
                        <span className="flex items-center gap-[4px] text-[10px] font-bold text-[#4ade80]">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#4ade80]" /> Active
                        </span>
                      </div>
                    </div>
                    <Button className="w-full mt-[14px]" variant="secondary" onClick={handleDownloadPDF}>
                      <Icon name="download" size={14} /> Export Physical Card
                    </Button>
                  </div>
                )}

                {/* STEP 4: Student Activation */}
                {enrollStep === 4 && (
                  <div className="space-y-[14px]">
                    <div className="rounded-[12px] border border-[#d1fae5] bg-[#ecfdf5] p-[16px]">
                      <p className="text-[14px] font-semibold text-[#065f46]">Ready to Activate</p>
                      <div className="mt-[12px] space-y-[8px]">
                        {[
                          { label: 'GES verification passed',   done: true },
                          { label: 'Academic details assigned',  done: true },
                          { label: 'Validation card generated',  done: true },
                          { label: 'QR code assigned',           done: true },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-[8px]">
                            <Icon name="check" size={14} className="text-[#10b981]" />
                            <span className="text-[13px] text-[#065f46]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-[14px]">
                      <p className="text-[12px] font-medium text-[#666] mb-[8px]">Upon activation, the system will:</p>
                      <ul className="space-y-[4px] text-[12px] text-[#888]">
                        <li>&bull; Create Student ID (e.g. SAC-2026-01490)</li>
                        <li>&bull; Add to active student population</li>
                        <li>&bull; Enable dining eligibility</li>
                        <li>&bull; Create immutable audit trail</li>
                        <li>&bull; Add to dining registry</li>
                      </ul>
                    </div>
                    <Button className="w-full" onClick={closeSidebar}>Activate Student</Button>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-auto flex items-center justify-between pt-[20px]">
                  <button
                    onClick={() => setEnrollStep(Math.max(1, enrollStep - 1))}
                    className={clsx(
                      'flex items-center gap-[6px] text-[13px]',
                      enrollStep === 1 ? 'invisible' : 'text-[#888] hover:text-[#555]'
                    )}
                  >
                    <Icon name="arrow-left" size={14} /> Back
                  </button>
                  <button
                    onClick={() => setEnrollStep(Math.min(4, enrollStep + 1))}
                    disabled={enrollStep === 1 && !lookupResult?.found}
                    className={clsx(
                      'flex items-center gap-[6px] rounded-[8px] px-[16px] py-[8px] text-[13px] font-medium transition-colors',
                      enrollStep === 4
                        ? 'invisible'
                        : enrollStep === 1 && !lookupResult?.found
                          ? 'cursor-not-allowed bg-[#e5e5e5] text-[#aaa]'
                          : 'bg-[#4ea4ff] text-white hover:bg-[#3d93e8]'
                    )}
                  >
                    {enrollStep === 3 ? 'Review & Activate' : 'Continue'} <Icon name="arrow-right" size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Student Detail View ─────────────────────────────── */}
            {sidebarView === 'detail' && selectedStudent && (
              <>
                {/* Detail tabs */}
                <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
                  {DETAIL_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setDetailTab(tab.value)}
                      className={clsx(
                        'flex h-[24px] items-center gap-[5px] rounded-[5px] px-[9px] text-[12px] font-medium transition-colors',
                        detailTab === tab.value
                          ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                          : 'text-black/50 hover:text-[#555]'
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-[20px] pb-[24px] pt-[16px]">
                  {/* Profile tab (merged with Academic) */}
                  {detailTab === 'profile' && (
                    <>
                      <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        <SidebarDetailRow label="Student ID"       value={selectedStudent.studentId} />
                        <SidebarDetailRow label="Full Name"        value={selectedStudent.fullName} />
                        <SidebarDetailRow label="BECE Number"      value={selectedStudent.beceNumber} />
                        <SidebarDetailRow label="Admission Number"  value={selectedStudent.admissionNumber} />
                        <SidebarDetailRow label="Enrollment Source" value={selectedStudent.enrollmentSource === 'ges' ? 'GES Placement' : 'Manual'} />
                        <SidebarDetailRow label="Reporting Date"   value={selectedStudent.reportingDate} />
                        <SidebarDetailRow label="Joined"           value={selectedStudent.joinedDate} />
                      </div>
                      <div className="mt-[16px] rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        <SidebarDetailRow label="Form"          value={selectedStudent.form} />
                        <SidebarDetailRow label="Class"         value={selectedStudent.className} />
                        <SidebarDetailRow label="Programme"     value={selectedStudent.programme} />
                        <SidebarDetailRow label="House"         value={selectedStudent.house} />
                        <SidebarDetailRow label="Academic Year" value={selectedStudent.academicYear} />
                      </div>
                      {(() => {
                        const card = MOCK_CARDS.find(c => c.studentId === selectedStudent.studentId)
                        if (!card) return null
                        return (
                          <div className="mt-[16px] rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                            <SidebarDetailRow label="Card ID"           value={card.cardUid !== '—' ? card.cardUid : '—'} />
                            <SidebarDetailRow label="Card Status"       value={CARD_STATUS_MAP[card.status]?.label ?? card.status} />
                            <SidebarDetailRow label="Issue Date"        value={card.issueDate !== '—' ? card.issueDate : '—'} />
                            <SidebarDetailRow label="Last Scan"         value={card.lastUsed ?? '—'} />
                            <SidebarDetailRow label="Validations Today" value={String(card.validationsToday)} />
                          </div>
                        )
                      })()}
                    </>
                  )}

                  {/* Dining tab */}
                  {detailTab === 'dining' && (
                    <div>
                      <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        <SidebarDetailRow label="Dining Eligibility" value={selectedStudent.diningEligibility === 'enabled' ? 'Enabled' : 'Disabled'} />
                      </div>
                      <div className="mt-[16px] rounded-[12px] border border-[#fef3c7] bg-[#fffbeb] p-[14px]">
                        <p className="text-[12px] font-medium text-[#92400e] mb-[6px]">Reimbursement Rule</p>
                        <p className="text-[12px] text-[#a16207] leading-[18px]">
                          Active Student + Dining Eligible + Successful Meal Validation = Contributes to reimbursement
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card tab */}
                  {detailTab === 'card' && (
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Card Status" value={CARD_STATUS_MAP[selectedStudent.cardStatus]?.label ?? selectedStudent.cardStatus} />
                      <SidebarDetailRow label="Fraud Flags" value={String(selectedStudent.fraudFlags)} />
                    </div>
                  )}

                  {/* Attendance tab */}
                  {detailTab === 'attendance' && (
                    <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Meals This Week"     value={String(selectedStudent.mealsThisWeek)} />
                      <SidebarDetailRow label="Last Validation"     value={selectedStudent.lastMealTime ?? '—'} />
                      <SidebarDetailRow label="Duplicate Attempts"  value={String(selectedStudent.duplicateAttempts)} />
                      <SidebarDetailRow label="Missed Validations"  value={String(selectedStudent.missedValidations)} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
