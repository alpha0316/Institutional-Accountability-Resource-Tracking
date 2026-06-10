import { useState } from 'react'
import { AlertTriangle, Download } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable, type Column } from '../../../components/ui/DataTable'
import { clsx } from 'clsx'

type Severity  = 'high' | 'medium' | 'low'
type FraudStatus = 'open' | 'investigating' | 'resolved' | 'dismissed'

interface FraudReport {
  id: string
  institution: string
  type: string
  description: string
  severity: Severity
  status: FraudStatus
  flaggedAt: string
  affectedAmount: number | null
}

const reports: FraudReport[] = [
  { id: 'FRD-001', institution: 'Mfantsipim SHS',      type: 'Duplicate Scan Cluster',    description: '47 duplicate scans in a single session within 12 minutes.',          severity: 'high',   status: 'investigating', flaggedAt: '2026-03-12', affectedAmount: 58750  },
  { id: 'FRD-002', institution: 'St. Augustine College',type: 'Inflated Attendance',       description: 'Meals-served count exceeded eligible dining students by 240.',        severity: 'high',   status: 'open',          flaggedAt: '2026-03-10', affectedAmount: 130000 },
  { id: 'FRD-003', institution: 'Mfantsipim SHS',       type: 'Token Misuse',              description: 'Token GOV-MFS-SEM1-001 redeemed at an unlisted supplier location.',   severity: 'medium', status: 'open',          flaggedAt: '2026-03-04', affectedAmount: 42000  },
  { id: 'FRD-004', institution: 'Achimota SHS',         type: 'Inactive Card Activity',    description: '12 deactivated student cards scanned successfully at Hall B.',         severity: 'medium', status: 'investigating', flaggedAt: '2026-03-08', affectedAmount: 15000  },
  { id: 'FRD-005', institution: 'Opoku Ware SHS',       type: 'Off-Hours Scanning',        description: 'Mass scan activity logged between 02:00–03:00 hrs on Friday 13 Mar.', severity: 'medium', status: 'resolved',      flaggedAt: '2026-03-13', affectedAmount: 8400   },
  { id: 'FRD-006', institution: 'Wesley Girls SHS',     type: 'Missing Attendance Logs',   description: 'Meals-served logs for 8 Mar–15 Mar are absent from the system.',       severity: 'low',    status: 'dismissed',     flaggedAt: '2026-03-15', affectedAmount: null   },
]

type Filter = 'all' | FraudStatus

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',          label: 'All Reports' },
  { key: 'open',         label: 'Open' },
  { key: 'investigating',label: 'Investigating' },
  { key: 'resolved',     label: 'Resolved' },
  { key: 'dismissed',    label: 'Dismissed' },
]

const severityBadge: Record<Severity, React.ReactNode> = {
  high:   <Badge variant="red">High</Badge>,
  medium: <Badge variant="orange">Medium</Badge>,
  low:    <Badge variant="gray">Low</Badge>,
}

const statusBadge: Record<FraudStatus, React.ReactNode> = {
  open:          <Badge variant="red">Open</Badge>,
  investigating: <Badge variant="orange">Investigating</Badge>,
  resolved:      <Badge variant="green">Resolved</Badge>,
  dismissed:     <Badge variant="gray">Dismissed</Badge>,
}

const columns: Column<FraudReport>[] = [
  { key: 'id',          label: 'Report ID',    width: '12%', primaryKey: true, render: r => r.id },
  { key: 'institution', label: 'Institution',  width: '14%', render: r => <span className="font-medium text-[#111]">{r.institution}</span> },
  { key: 'type',        label: 'Type',         width: '22%', render: r => r.type },
  { key: 'severity',    label: 'Severity',     width: '10%', render: r => severityBadge[r.severity] },
  { key: 'affected',    label: 'Est. Impact',  width: '14%', render: r => r.affectedAmount ? `GH₵${r.affectedAmount.toLocaleString()}` : '—' },
  { key: 'flagged',     label: 'Flagged',      width: '12%', render: r => new Date(r.flaggedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
  { key: 'status',      label: 'Status',       width: '16%', render: r => statusBadge[r.status] },
]

export default function FraudReports() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered   = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const openCount  = reports.filter(r => r.status === 'open').length
  const highCount  = reports.filter(r => r.severity === 'high').length
  const totalImpact = reports.reduce((a, r) => a + (r.affectedAmount ?? 0), 0)

  return (
    <>
      <PageHeader
        title="Fraud Reports"
        actions={
          <Button variant="secondary">
            <Download size={14} strokeWidth={2.2} />
            Export
          </Button>
        }
      />
      <div className="px-[36px] pb-[40px]">

        {/* Alert banner */}
        {openCount > 0 && (
          <div className="mb-[22px] flex items-center gap-[12px] rounded-[12px] border border-[#ffb9b4] bg-[#fff1f0] px-[16px] py-[12px]">
            <AlertTriangle size={16} strokeWidth={2.2} className="shrink-0 text-[#de3d36]" />
            <p className="text-[13px] font-medium text-[#de3d36]">
              {openCount} open fraud report{openCount > 1 ? 's' : ''} require your attention.
            </p>
          </div>
        )}

        {/* Stat strip */}
        <div className="mb-[28px] grid grid-cols-4 gap-[1px] overflow-hidden rounded-[14px] border border-[#f0f0f0] bg-[#f0f0f0]">
          {[
            { label: 'Open Cases',     value: openCount,                               color: 'text-[#de3d36]' },
            { label: 'High Severity',  value: highCount,                               color: 'text-[#df6b13]' },
            { label: 'Est. Total Impact', value: `GH₵${totalImpact.toLocaleString()}`, color: 'text-[#111]' },
            { label: 'Total Reports',  value: reports.length,                          color: 'text-[#111]' },
          ].map(s => (
            <div key={s.label} className="bg-white px-[22px] py-[18px]">
              <p className="text-[12px] font-medium text-[#888]">{s.label}</p>
              <p className={`mt-[6px] text-[22px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-[14px] flex items-center gap-[4px] rounded-[10px] border border-[#efefef] bg-white p-[3px] w-fit">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'rounded-[7px] px-[12px] py-[5px] text-[13px] font-medium transition-colors',
                filter === f.key
                  ? 'bg-[#f4f4f4] text-[#111] shadow-sm'
                  : 'text-[#888] hover:text-[#555]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey={r => r.id}
          rowActions={r => [
            { label: 'View Details',     onClick: () => {} },
            { label: 'Mark Investigating', onClick: () => {}, disabled: r.status !== 'open' },
            { label: 'Mark Resolved',    onClick: () => {}, disabled: r.status !== 'investigating' },
            { label: 'Dismiss Report',   onClick: () => {}, destructive: true, disabled: r.status === 'resolved' || r.status === 'dismissed' },
          ]}
        />
      </div>
    </>
  )
}
