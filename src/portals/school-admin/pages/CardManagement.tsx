import { useState, useMemo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { clsx } from 'clsx'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { type DropdownMenuItem } from '../../../components/ui/DropdownMenu'
import { StatCard, StatCardGroup } from '../../../components/ui/StatCard'
import {
  MOCK_CARDS,
  MOCK_STUDENTS,
  CARD_STATUS_MAP,
  type MockCard,
} from '../../../lib/mockData'

type CardFilter = 'all' | 'issued' | 'pending' | 'suspended' | 'deactivated'
type SidebarView = 'detail' | 'issue' | null
type IssueStep = 1 | 2 | 3 | 4 | 5

const ISSUE_STEPS = [
  { step: 1 as IssueStep, label: 'Select Student', description: 'Choose student to issue card to' },
  { step: 2 as IssueStep, label: 'Verify Identity', description: 'Confirm student details' },
  { step: 3 as IssueStep, label: 'Generate Card', description: 'Create unique card and QR' },
  { step: 4 as IssueStep, label: 'Assign Card', description: 'Link card to student' },
  { step: 5 as IssueStep, label: 'Activate', description: 'Enable meal validation' },
]

const CARD_FILTERS: { key: CardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'issued', label: 'Issued' },
  { key: 'pending', label: 'Pending' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'deactivated', label: 'Deactivated' },
]


const STATS = [
  { label: 'Total Active Cards', value: '4,791', description: 'Currently allowed for meal validation',     tone: 'bg-[#f7fbff]', trend: '↑ (+25%)' },
  { label: 'Pending Issuance',   value: '41',    description: 'Active students awaiting cards',           tone: 'bg-[#fcf8f5]' },
  { label: 'Suspended Cards',    value: '12',    description: 'Temporarily blocked from validation',       tone: 'bg-[#fff7f8]', alert: true },
  { label: 'Lost / Replaced',    value: '18',    description: 'Cards replaced this semester',              tone: 'bg-[#f7fdf9]' },
]

function SidebarDetailRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[13px] last:border-0">
      <span className="text-[14px] text-[#888]">{label}</span>
      <span className={clsx('text-[14px] font-semibold', valueClass || 'text-[#111]')}>{value}</span>
    </div>
  )
}

const STUDENTS_FOR_ISSUE = MOCK_STUDENTS.filter(s => s.cardStatus === 'pending')

export default function CardManagement() {
  const [cardFilter, setCardFilter] = useState<CardFilter>('all')
  const [search, setSearch] = useState('')
  const [sidebarView, setSidebarView] = useState<SidebarView>(null)
  const [selectedCard, setSelectedCard] = useState<MockCard | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'info' | 'history' | 'logs'>('info')
  const [issueStep, setIssueStep] = useState<IssueStep>(1)
  const [issueStudentId, setIssueStudentId] = useState('')

  const filtered = useMemo(() => {
    let rows = MOCK_CARDS
    if (cardFilter !== 'all') rows = rows.filter(c => c.status === cardFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(c =>
        c.studentName.toLowerCase().includes(q) ||
        c.studentId.toLowerCase().includes(q) ||
        c.cardUid.toLowerCase().includes(q)
      )
    }
    return rows
  }, [cardFilter, search])

  function openDetail(card: MockCard) {
    setSelectedCard(card)
    setSidebarTab('info')
    setSidebarView('detail')
  }

  function openIssue() {
    setIssueStep(1)
    setIssueStudentId('')
    setSidebarView('issue')
  }

  function handleDownloadPDF() {
    const cardHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Student ID Card — CARD-88421</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6}
  .card{width:380px;background:#fff;border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,0.12);overflow:hidden}
  .card-header{background:#1e3a5f;color:#fff;padding:24px 28px;display:flex;align-items:center;gap:16px}
  .card-header h2{font-size:13px;font-weight:400;text-transform:uppercase;letter-spacing:2px;opacity:.7;margin-bottom:4px}
  .card-header .school{font-size:18px;font-weight:700;line-height:1.2}
  .card-body{padding:28px}
  .card-body .row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0}
  .card-body .row:last-child{border-bottom:none}
  .card-body .label{font-size:12px;color:#888}
  .card-body .value{font-size:14px;font-weight:600;color:#111}
  .qr-section{display:flex;align-items:center;gap:18px;margin-top:18px;padding:18px;background:#fafafa;border-radius:12px}
  .qr-section .qr{margin-left:auto}
  .card-footer{padding:20px 28px;border-top:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center}
  .card-footer .card-id{font-size:12px;color:#888}
  .card-footer .status{font-size:12px;font-weight:600;color:#10b981;display:flex;align-items:center;gap:4px}
  .card-footer .status::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981}
  .crest{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}
  @media print{body{background:#fff}.card{box-shadow:none;border:1px solid #eee}}
</style></head><body>
<div class="card">
  <div class="card-header"><div class="crest">SA</div><div><h2>Ministry of Education</h2><div class="school">St. Augustine SHS</div></div></div>
  <div class="card-body">
    <div class="row"><span class="label">Student Name</span><span class="value">Kwesi Mensah</span></div>
    <div class="row"><span class="label">Student ID</span><span class="value">SAC-2026-01482</span></div>
    <div class="row"><span class="label">Programme</span><span class="value">General Science</span></div>
    <div class="row"><span class="label">Form / Class</span><span class="value">Form 1 — 1 Science A</span></div>
    <div class="row"><span class="label">House</span><span class="value">St Augustine House</span></div>
    <div class="row"><span class="label">Academic Year</span><span class="value">2025 / 2026</span></div>
    <div class="qr-section">
      <div><span class="label">Card ID</span><br><span class="value" style="font-size:16px">CARD-88421</span></div>
      <div class="qr">[QR CODE — SAC-2026-01482]</div>
    </div>
  </div>
  <div class="card-footer">
    <span class="card-id">Issued: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    <span class="status">Active</span>
  </div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`
    const w = window.open('', '_blank', 'width=500,height=700')
    if (w) { w.document.write(cardHtml); w.document.close() }
  }

  function closeSidebar() { setSidebarView(null); setSelectedCard(null) }

  function rowActions(card: MockCard): DropdownMenuItem[] {
    return [
      { label: 'View Card',          onClick: () => openDetail(card) },
      { label: 'Issue Card',         onClick: () => openIssue(), disabled: card.status !== 'pending' },
      { label: 'Suspend Card',       onClick: () => {}, disabled: card.status !== 'issued' },
      { label: 'Replace Card',       onClick: () => {}, disabled: card.status === 'deactivated' },
      { label: 'Reactivate Card',    onClick: () => {}, disabled: card.status !== 'suspended' },
      { label: 'Deactivate Card',    onClick: () => {}, destructive: true, disabled: card.status === 'deactivated' },
    ]
  }

  const columns: Column<MockCard>[] = [
    {
      key: 'studentName',
      label: 'Student',
      width: '18%',
      primaryKey: true,
      render: (c) => <span className="text-[15px] font-normal leading-none text-[#4ea4ff]">{c.studentName}</span>,
    },
    { key: 'studentId',  label: 'Student ID',   width: '16%', render: (c) => c.studentId },
    { key: 'cardUid',    label: 'Card ID',      width: '14%', render: (c) => c.cardUid },
    {
      key: 'status',
      label: 'Status',
      width: '13%',
      render: (c) => {
        const m = CARD_STATUS_MAP[c.status]
        return <Badge variant={m.variant}>{m.label}</Badge>
      },
    },
    { key: 'lastUsed',   label: 'Last Scan',    width: '16%', render: (c) => c.lastUsed ?? '—' },
    {
      key: 'validations',
      label: 'Today',
      width: '9%',
      align: 'center',
      render: (c) => (
        <span className={c.validationsToday >= 3 ? 'text-[#10b981] font-semibold' : ''}>
          {c.validationsToday}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Card Management"
        actions={<Button onClick={openIssue}><Icon name="plus" size={14} />Issue Card</Button>}
      />

      <div className="pl-[36px] pr-[20px] pt-[2px]">
        {/* stat cards */}
        <StatCardGroup>
          {STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              sub={stat.alert
                ? <span className="font-medium text-[#ff3333]">{stat.description}</span>
                : stat.description
              }
              accent={
                stat.tone === 'bg-[#f7fbff]' ? 'bg-gradient-to-br from-white to-blue-50/50' :
                stat.tone === 'bg-[#f7fdf9]' ? 'bg-gradient-to-br from-white to-green-50/50' :
                stat.tone === 'bg-[#fcf8f5]' ? 'bg-gradient-to-br from-white to-orange-50/50' :
                'bg-gradient-to-br from-white to-red-50/50'
              }
              badge={stat.trend
                ? <span className="flex items-center gap-[3px] rounded-full bg-[#eefbf4] px-[8px] py-[3px] text-[12px] font-semibold text-[#0f9f5d]">{stat.trend}</span>
                : undefined
              }
            />
          ))}
        </StatCardGroup>

        {/* card registry */}
        <section className="mt-[52px]">
          <h2 className="text-[22px] font-bold leading-[24px] text-black">Card Registry</h2>
          <p className="mt-[4px] text-[14px] text-[#888]">Manage student validation cards and dining access.</p>

          <div className="mt-[6px] flex h-[31px] items-center justify-between">
            <div className="flex items-center gap-[8px]">
              {/* Card Status filter */}
              <div className="flex h-[25px] items-center rounded-[5px] border border-[#f0f0f0] bg-[#fbfbfb] p-[1px]">
                {CARD_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setCardFilter(f.key)}
                    className={clsx(
                      'flex h-[22px] items-center rounded-[4px] px-[9px] text-[12px] font-medium leading-none transition-colors',
                      cardFilter === f.key ? 'border border-[#e7edf5] bg-white text-[#4ea4ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#7e7e7e] hover:text-[#555]'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex h-[31px] w-[240px] items-center gap-[10px] rounded-[8px] border border-[#e5e5e5] bg-[#fcfcfc] px-[12px]">
              <Icon name="search" size={15} className="shrink-0 text-[#767676]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, card ID or student ID..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#555] outline-none placeholder:text-[#7e7e7e]"
              />
            </div>
          </div>

          <div className="mt-[12px]">
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(c) => c.id}
              onRowClick={openDetail}
              rowActions={rowActions}
              emptyMessage="All validation cards are up to date. No pending issuances or card incidents."
            />
          </div>
        </section>
      </div>

      {/* ── Right Sidebar ─────────────────────────────────────────────── */}
      {sidebarView && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={closeSidebar} />
          <div className="absolute right-[12px] top-[12px] flex h-[calc(100vh-24px)] w-[460px] flex-col overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <div className="px-[20px] pb-[10px] pt-[22px]">
              <h2 className="pr-12 text-[17px] font-bold leading-none text-black">
                {sidebarView === 'issue' ? 'Issue Card' : 'Card Details'}
              </h2>
              <button onClick={closeSidebar} className="absolute right-[12px] top-[12px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202020] shadow-[0_2px_7px_rgba(0,0,0,0.22)] hover:bg-[#f8f8f8]">
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* ── Issue Card Flow ───────────────────────────────── */}
            {sidebarView === 'issue' && (
              <div className="flex flex-1 flex-col px-[20px] pb-[24px]">
                {/* Step indicators */}
                <div className="mb-[20px] flex gap-[6px]">
                  {ISSUE_STEPS.map((step) => (
                    <div key={step.step} className="flex items-center gap-[6px]">
                      <div className={clsx(
                        'flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-semibold',
                        issueStep >= step.step ? 'bg-[#4ea4ff] text-white' : 'bg-[#efefef] text-[#999]'
                      )}>
                        {issueStep > step.step ? <Icon name="check" size={12} /> : step.step}
                      </div>
                      {step.step < 5 && <div className={clsx('h-[1px] w-[16px]', issueStep > step.step ? 'bg-[#4ea4ff]' : 'bg-[#e5e5e5]')} />}
                    </div>
                  ))}
                </div>

                <p className="mb-[4px] text-[14px] font-semibold text-[#111]">{ISSUE_STEPS[issueStep - 1].label}</p>
                <p className="mb-[18px] text-[13px] text-[#888]">{ISSUE_STEPS[issueStep - 1].description}</p>

                {/* Step 1: Select Student */}
                {issueStep === 1 && (
                  <div className="space-y-[8px]">
                    <input
                      value={issueStudentId}
                      onChange={(e) => setIssueStudentId(e.target.value)}
                      placeholder="Search student name or ID..."
                      className="h-[36px] w-full rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] outline-none focus:border-[#4ea4ff]"
                    />
                    <div className="rounded-[10px] border border-[#efefef]">
                      {STUDENTS_FOR_ISSUE.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setIssueStudentId(s.studentId)}
                          className={clsx(
                            'flex w-full items-center justify-between px-[14px] py-[12px] text-left border-b border-[#f5f5f5] last:border-0 transition-colors hover:bg-[#fafafa]',
                            issueStudentId === s.studentId && 'bg-[#f0f7ff] border-[#d7eaff]'
                          )}
                        >
                          <div>
                            <p className="text-[14px] font-medium text-[#111]">{s.fullName}</p>
                            <p className="text-[12px] text-[#888]">{s.studentId} &middot; {s.form}</p>
                          </div>
                          <Badge variant={CARD_STATUS_MAP[s.cardStatus].variant}>{CARD_STATUS_MAP[s.cardStatus].label}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Verify Identity */}
                {issueStep === 2 && (
                  <div className="rounded-[12px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                    <SidebarDetailRow label="Student Name"   value="Kwesi Mensah" />
                    <SidebarDetailRow label="Student ID"     value="SAC-2026-01482" />
                    <SidebarDetailRow label="Programme"      value="General Science" />
                    <SidebarDetailRow label="Form"           value="Form 1" />
                    <SidebarDetailRow label="Dining"         value="Enabled" />
                  </div>
                )}

                {/* Step 3: Generate Card */}
                {issueStep === 3 && (
                  <div className="space-y-[14px]">
                    <div className="rounded-[12px] border border-[#dbeafe] bg-[#eff6ff] p-[16px] text-center">
                      <p className="text-[13px] font-semibold text-[#1e40af] mb-[4px]">Card Generated</p>
                      <p className="text-[12px] text-[#3b82f6]">System has created CARD-88421</p>
                    </div>
                    <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-[20px]">
                      <div className="flex items-center gap-[16px] mb-[16px]">
                        <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-[10px] border-2 border-dashed border-[#ddd] bg-[#fafafa]">
                          <Icon name="qrcode" size={44} className="text-[#333]" />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-[#111]">CARD-88421</p>
                          <p className="text-[13px] text-[#888] mt-[2px]">Kwesi Mensah</p>
                          <p className="text-[12px] text-[#aaa] mt-[2px]">SAC-2026-01482</p>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#888]">Unique QR generated for student meal validation.</p>
                      <Button className="w-full mt-[14px]" variant="secondary" onClick={handleDownloadPDF}>
                        <Icon name="download" size={14} /> Export Physical Card
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Assign Card */}
                {issueStep === 4 && (
                  <div className="space-y-[14px]">
                    <div className="rounded-[12px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Card ID"        value="CARD-88421" />
                      <SidebarDetailRow label="Student"        value="Kwesi Mensah" />
                      <SidebarDetailRow label="Student ID"     value="SAC-2026-01482" />
                      <SidebarDetailRow label="Generation Date" value="Today" />
                    </div>
                    <Button className="w-full">Assign Card to Student</Button>
                  </div>
                )}

                {/* Step 5: Activate */}
                {issueStep === 5 && (
                  <div className="space-y-[14px]">
                    <div className="rounded-[12px] border border-[#d1fae5] bg-[#ecfdf5] p-[16px]">
                      <p className="text-[14px] font-semibold text-[#065f46] mb-[10px]">Card issued successfully.</p>
                      <p className="text-[13px] text-[#065f46]">Student may now validate meals.</p>
                    </div>
                    <div className="rounded-[12px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                      <SidebarDetailRow label="Card ID"    value="CARD-88421" />
                      <SidebarDetailRow label="Status"     value="Active" />
                      <SidebarDetailRow label="Issued To"  value="Kwesi Mensah" />
                      <SidebarDetailRow label="Issued At"  value="Today, 09:14 AM" />
                    </div>
                    <Button className="w-full">Activate Card</Button>
                  </div>
                )}

                {/* Issue nav buttons */}
                <div className="mt-auto flex items-center justify-between pt-[20px]">
                  <button onClick={() => setIssueStep(Math.max(1, issueStep - 1) as IssueStep)} className={clsx('flex items-center gap-[6px] text-[13px]', issueStep === 1 ? 'invisible' : 'text-[#888] hover:text-[#555]')}>
                    <Icon name="arrow-left" size={14} /> Back
                  </button>
                  <button
                    onClick={() => setIssueStep(Math.min(5, issueStep + 1) as IssueStep)}
                    disabled={issueStep === 1 && !issueStudentId}
                    className={clsx(
                      'flex items-center gap-[6px] rounded-[8px] px-[16px] py-[8px] text-[13px] font-medium transition-colors',
                      issueStep === 5 ? 'invisible' :
                        issueStep === 1 && !issueStudentId ? 'cursor-not-allowed bg-[#e5e5e5] text-[#aaa]' :
                        'bg-[#4ea4ff] text-white hover:bg-[#3d93e8]'
                    )}
                  >
                    Continue <Icon name="arrow-right" size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Card Detail View ───────────────────────────────── */}
            {sidebarView === 'detail' && selectedCard && (
              <>
                {/* Detail tabs */}
                <div className="mx-[20px] flex h-[26px] w-fit items-center rounded-[6px] bg-[#f1f1f2] p-[1px]">
                  {[
                    { label: 'Info',     value: 'info'    as const, icon: <Icon name="credit-card" size={13} /> },
                    { label: 'History',  value: 'history' as const, icon: <Icon name="history" size={13} /> },
                    { label: 'Logs',     value: 'logs'    as const, icon: <Icon name="refresh" size={13} /> },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setSidebarTab(tab.value)}
                      className={clsx(
                        'flex h-[24px] items-center gap-[5px] rounded-[5px] px-[9px] text-[12px] font-medium transition-colors',
                        sidebarTab === tab.value ? 'bg-white text-[#242424] shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-black/50 hover:text-[#555]'
                      )}
                    >
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-[20px] pb-[24px] pt-[16px]">
                  {/* Info tab */}
                  {sidebarTab === 'info' && (
                    <>
                      {/* Pending prompt */}
                      {selectedCard.status === 'pending' && (
                        <div className="mb-[16px] rounded-[12px] border border-[#fef3c7] bg-[#fffbeb] p-[16px]">
                          <div className="flex items-start gap-[10px]">
                            <Icon name="alert-triangle" size={18} className="shrink-0 text-[#df6b13] mt-[2px]" />
                            <div>
                              <p className="text-[13px] font-semibold text-[#92400e] mb-[6px]">No validation card has been assigned.</p>
                              <p className="text-[12px] text-[#a16207] leading-[18px]">The student cannot validate meals until a card is issued.</p>
                            </div>
                          </div>
                          <div className="mt-[14px] space-y-[8px]">
                            <Button className="w-full" onClick={openIssue}>Issue Card</Button>
                            <Button variant="secondary" className="w-full">Save for Later</Button>
                          </div>
                          <div className="mt-[12px] rounded-[8px] border border-[#fde68a] bg-[#fefce8] p-[10px]">
                            <p className="text-[12px] font-medium text-[#92400e] mb-[4px]">Policy</p>
                            <p className="text-[11px] text-[#a16207] leading-[16px]">No Card &rarr; No Meal Validation &rarr; No Reimbursement</p>
                          </div>
                        </div>
                      )}

                      {/* Issued prompt */}
                      {selectedCard.status === 'issued' && (
                        <div className="mb-[16px] rounded-[12px] border border-[#d1fae5] bg-[#ecfdf5] p-[16px]">
                          <div className="flex items-start gap-[10px]">
                            <Icon name="check" size={18} className="shrink-0 text-[#10b981] mt-[2px]" />
                            <div>
                              <p className="text-[13px] font-semibold text-[#065f46] mb-[6px]">Card Active</p>
                              <p className="text-[12px] text-[#059669] leading-[18px]">This card is active and can be used for dining hall validation. Meal records generated by this card contribute to operational reports.</p>
                            </div>
                          </div>
                          <div className="mt-[14px] space-y-[8px]">
                            <Button variant="secondary" className="w-full justify-start">
                              <Icon name="ban" size={14} /> Suspend Card
                            </Button>
                            <Button variant="secondary" className="w-full justify-start">
                              <Icon name="refresh" size={14} /> Replace Card
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Suspended prompt */}
                      {selectedCard.status === 'suspended' && (
                        <div className="mb-[16px] rounded-[12px] border border-[#fef3c7] bg-[#fffbeb] p-[16px]">
                          <div className="flex items-start gap-[10px]">
                            <Icon name="alert-triangle" size={18} className="shrink-0 text-[#df6b13] mt-[2px]" />
                            <div>
                              <p className="text-[13px] font-semibold text-[#92400e] mb-[6px]">This card has been temporarily disabled.</p>
                              <p className="text-[12px] text-[#a16207] leading-[18px]">Meal validations will not be accepted until access is restored.</p>
                            </div>
                          </div>
                          <div className="mt-[14px] space-y-[8px]">
                            <Button className="w-full justify-start">
                              <Icon name="refresh" size={14} /> Reactivate Card
                            </Button>
                            <Button variant="secondary" className="w-full justify-start">
                              <Icon name="credit-card" size={14} /> Replace Card
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Deactivated prompt */}
                      {selectedCard.status === 'deactivated' && (
                        <div className="mb-[16px] rounded-[12px] border border-[#fee2e2] bg-[#fef2f2] p-[16px]">
                          <div className="flex items-start gap-[10px]">
                            <Icon name="ban" size={18} className="shrink-0 text-[#de3d36] mt-[2px]" />
                            <div>
                              <p className="text-[13px] font-semibold text-[#991b1b] mb-[6px]">This card is permanently invalid.</p>
                              <p className="text-[12px] text-[#b91c1c] leading-[18px]">Future scans will automatically trigger a security event.</p>
                            </div>
                          </div>
                          <div className="mt-[14px]">
                            <Button className="w-full justify-start">
                              <Icon name="plus" size={14} /> Issue New Card
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Card info */}
                      <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                        <SidebarDetailRow label="Card ID"             value={selectedCard.cardUid} />
                        <SidebarDetailRow label="Student"             value={selectedCard.studentName} />
                        <SidebarDetailRow label="Student ID"          value={selectedCard.studentId} />
                        <SidebarDetailRow label="Status"              value={CARD_STATUS_MAP[selectedCard.status]?.label ?? selectedCard.status} />
                        <SidebarDetailRow label="Issue Date"          value={selectedCard.issueDate} />
                        <SidebarDetailRow label="Last Scan"           value={selectedCard.lastUsed ?? '—'} />
                        <SidebarDetailRow label="Validations Today"   value={String(selectedCard.validationsToday)} />
                        <SidebarDetailRow label="Dining Eligibility"  value={selectedCard.diningEligibility === 'enabled' ? 'Enabled' : 'Disabled'} />
                      </div>
                    </>
                  )}

                  {/* Scan History tab */}
                  {sidebarTab === 'history' && (
                    <div>
                      {selectedCard.scanHistory.length === 0 ? (
                        <div className="py-[30px] text-center">
                          <Icon name="history" size={28} className="mx-auto text-[#ccc] mb-[10px]" />
                          <p className="text-[13px] text-[#aaa]">No scan history available</p>
                        </div>
                      ) : (
                        <div className="rounded-[13px] border border-[#f5f5f5] bg-white px-[17px] shadow-[0_1px_7px_rgba(0,0,0,0.05)]">
                          {/* Table header */}
                          <div className="flex items-center border-b border-[#f0f0f0] py-[10px] text-[12px] font-medium text-[#888]">
                            <span className="w-[80px]">Time</span>
                            <span className="flex-1">Hall</span>
                            <span className="w-[80px] text-right">Result</span>
                          </div>
                          {selectedCard.scanHistory.map((scan, i) => (
                            <div key={i} className="flex items-center border-b border-[#f8f8f8] py-[12px] last:border-0">
                              <span className="w-[80px] text-[13px] text-[#888]">{scan.time}</span>
                              <span className="flex-1 text-[13px] text-[#3f3f3f]">{scan.hall}</span>
                              <span className={clsx('w-[80px] text-right text-[13px] font-medium', scan.result === 'Success' ? 'text-[#10b981]' : 'text-[#df6b13]')}>
                                {scan.result}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Duplicate scan policy */}
                      <div className="mt-[16px] rounded-[10px] border border-[#fef3c7] bg-[#fffbeb] p-[12px]">
                        <p className="text-[11px] font-medium text-[#92400e] mb-[4px]">Duplicate Scan Policy</p>
                        <p className="text-[11px] text-[#a16207] leading-[16px]">Duplicate validation attempt detected. Only one meal validation is allowed per approved meal session.</p>
                      </div>
                    </div>
                  )}

                  {/* Audit Logs tab */}
                  {sidebarTab === 'logs' && (
                    <div className="space-y-[12px]">
                      {selectedCard.cardLogs.length === 0 ? (
                        <div className="py-[30px] text-center">
                          <Icon name="refresh" size={28} className="mx-auto text-[#ccc] mb-[10px]" />
                          <p className="text-[13px] text-[#aaa]">No audit logs yet</p>
                        </div>
                      ) : (
                        selectedCard.cardLogs.map((log, i) => (
                          <div key={i} className="flex items-start gap-[12px]">
                            <span className="shrink-0 w-[48px] text-[12px] font-medium text-[#888]">{log.time}</span>
                            <span className="text-[13px] text-[#333]">{log.event}</span>
                          </div>
                        ))
                      )}
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
